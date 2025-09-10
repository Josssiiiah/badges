import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.log('[email.service] WARN: RESEND_API_KEY is not set');
}
const resend = new Resend(resendApiKey);

async function sendWithFallback({
  to,
  subject,
  html,
  fromCandidates,
}: {
  to: string;
  subject: string;
  html: string;
  fromCandidates: string[];
}) {
  let lastError: unknown = null;
  for (const from of fromCandidates) {
    const { error, data } = await resend.emails.send({ from, to: [to], subject, html });
    if (!error) return data;
    lastError = error;
    console.log('[email.service] send error with from=', from, error);
  }
  throw new Error('Failed to send email via all from candidates: ' + String(lastError));
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
  return await sendWithFallback({
    to,
    subject: 'Verify your email address',
    html,
    fromCandidates: [primaryFrom, 'Badges <onboarding@resend.dev>'],
  });
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
  return await sendWithFallback({
    to,
    subject,
    html,
    fromCandidates: [primaryFrom, 'Badges <onboarding@resend.dev>'],
  });
}
