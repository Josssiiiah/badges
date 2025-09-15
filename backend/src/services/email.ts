import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.log('[email.service] WARN: RESEND_API_KEY is not set');
}
const resend = new Resend(resendApiKey);

// Rate limiting configuration
const RATE_LIMIT_MS = 1000; // 1 second between emails (Resend allows ~10 emails/second on free tier)
let lastEmailSend = 0;

// Simple email queue for rate limiting
interface QueuedEmail {
  to: string;
  subject: string;
  html: string;
  fromCandidates: string[];
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

const emailQueue: QueuedEmail[] = [];
let isProcessingQueue = false;

async function processEmailQueue() {
  if (isProcessingQueue || emailQueue.length === 0) return;

  isProcessingQueue = true;

  while (emailQueue.length > 0) {
    const email = emailQueue.shift()!;

    try {
      // Rate limiting: ensure minimum delay between sends
      const now = Date.now();
      const timeSinceLastSend = now - lastEmailSend;
      if (timeSinceLastSend < RATE_LIMIT_MS) {
        const delay = RATE_LIMIT_MS - timeSinceLastSend;
        console.log(`[email.service] Rate limiting: waiting ${delay}ms before sending email`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await sendWithFallback(email.to, email.subject, email.html, email.fromCandidates);
      lastEmailSend = Date.now();
      email.resolve(result);
    } catch (error) {
      console.error('[email.service] Failed to send queued email:', error);
      email.reject(error);
    }
  }

  isProcessingQueue = false;
}

async function sendWithFallback(
  to: string,
  subject: string,
  html: string,
  fromCandidates: string[]
) {
  let lastError: unknown = null;
  for (const from of fromCandidates) {
    try {
      const { error, data } = await resend.emails.send({ from, to: [to], subject, html });
      if (!error) return data;
      lastError = error;
      console.log('[email.service] send error with from=', from, error);

      // If it's a rate limit error, add extra delay
      if (error.message && error.message.includes('429')) {
        console.log('[email.service] Rate limit detected, adding extra delay');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay on rate limit
      }
    } catch (err) {
      lastError = err;
      console.log('[email.service] send error with from=', from, err);
    }
  }
  throw new Error('Failed to send email via all from candidates: ' + String(lastError));
}

async function queueEmailSend(
  to: string,
  subject: string,
  html: string,
  fromCandidates: string[]
): Promise<any> {
  return new Promise((resolve, reject) => {
    emailQueue.push({
      to,
      subject,
      html,
      fromCandidates,
      resolve,
      reject,
    });

    // Start processing if not already running
    processEmailQueue();
  });
}

type SendVerificationEmailArgs = {
  to: string;
  verificationUrl: string;
};

export async function sendVerificationEmail({ to, verificationUrl }: SendVerificationEmailArgs) {
  const primaryFrom = process.env.RESEND_FROM || 'Badges <onboarding@resend.dev>';
  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Thanks for signing up! Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}"
           style="display: inline-block; background-color: #111827; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `;

  return await queueEmailSend(
    to,
    'Verify your email address',
    html,
    [primaryFrom, 'Badges <onboarding@resend.dev>']
  );
}

type SendMagicLinkEmailArgs = {
  to: string;
  magicLinkUrl: string;
};

export async function sendMagicLinkEmail({ to, magicLinkUrl }: SendMagicLinkEmailArgs) {
  const primaryFrom = process.env.RESEND_FROM || 'Badges <onboarding@resend.dev>';

  // Detect if the callbackURL includes existing=1 to tailor copy
  let isExisting = false;
  let isBadgeView = false;
  try {
    const link = new URL(magicLinkUrl);
    const rawCallback = link.searchParams.get('callbackURL');
    if (rawCallback) {
      const decoded = decodeURIComponent(rawCallback);
      const cb = new URL(decoded);
      isExisting = cb.searchParams.get('existing') === '1';
      // Check if it's a direct badge view (for existing users)
      isBadgeView = cb.pathname.includes('/badges/');
    }
  } catch {}

  const heading = isExisting || isBadgeView ? "You've received a badge!" : 'Create your account to view your badge';
  const lead = isExisting || isBadgeView
    ? 'Congratulations! Click below to securely sign in and view your new badge.'
    : 'Click below to securely set your password. Afterwards, you will be redirected to your badge page.';
  const cta = isExisting || isBadgeView ? 'View Your Badge' : 'Create Account';

  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${heading}</h2>
        <p>${lead}</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <a href="${magicLinkUrl}"
             style="display: inline-block; background-color: #111827; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            ${cta}
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `;

  const subject = isExisting || isBadgeView ? "You've received a badge!" : 'Create your account to view your badge';

  return await queueEmailSend(
    to,
    subject,
    html,
    [primaryFrom, 'Badges <onboarding@resend.dev>']
  );
}
