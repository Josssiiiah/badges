import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.log('[email.service] WARN: RESEND_API_KEY is not set');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

type SendVerificationEmailArgs = {
  to: string;
  verificationUrl: string;
};

export async function sendVerificationEmail({ to, verificationUrl }: SendVerificationEmailArgs) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const from = process.env.RESEND_FROM || 'Badges <onboarding@resend.dev>';

  const { error, data } = await resend.emails.send({
    from,
    to: [to],
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Thanks for signing up! Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}"
           style="display: inline-block; background-color: #111827; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.log('[email.service] sendVerificationEmail error', error);
    throw new Error('Failed to send verification email');
  }

  return data;
}

type SendMagicLinkEmailArgs = {
  to: string;
  magicLinkUrl: string;
};

export async function sendMagicLinkEmail({ to, magicLinkUrl }: SendMagicLinkEmailArgs) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const from = process.env.RESEND_FROM || 'Badges <onboarding@resend.dev>';

  const { error, data } = await resend.emails.send({
    from,
    to: [to],
    subject: 'Sign in to your account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Sign in to your account</h2>
        <p>Click the magic link below to sign in to your account:</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <a href="${magicLinkUrl}" 
             style="display: inline-block; background-color: #111827; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Sign In
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `,
  });

  if (error) {
    console.log('[email.service] sendMagicLinkEmail error', error);
    throw new Error('Failed to send magic link email');
  }

  return data;
}