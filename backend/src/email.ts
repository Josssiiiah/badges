import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  // eslint-disable-next-line no-console
  console.log('[email.server] WARN: RESEND_API_KEY is not set');
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

  const from = process.env.RESEND_FROM || 'Badgespot <onboarding@updates.badgespot.com>';
  // eslint-disable-next-line no-console
  console.log(`[email] Sending verification to ${to} -> ${verificationUrl}`);

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
    // eslint-disable-next-line no-console
    console.log('[email.server] sendVerificationEmail error', error);
    throw new Error('Failed to send verification email');
  }

  return data;
}

type SendVenueMagicLinkEmailArgs = {
  to: string;
  magicLinkUrl: string;
};

export async function sendVenueMagicLinkEmail({ to, magicLinkUrl }: SendVenueMagicLinkEmailArgs) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const from = process.env.RESEND_FROM || 'Badgespot <onboarding@updates.badgespot.com>';

  const { error, data } = await resend.emails.send({
    from,
    to: [to],
    subject: 'Complete your venue onboarding',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Complete your venue onboarding</h2>
        <p>Hello!</p>
        <p>Click the magic link below to create your account and complete your venue setup to start receiving bookings.</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <a href="${magicLinkUrl}" 
             style="display: inline-block; background-color: #111827; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Complete Venue Onboarding
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't expect this email, you can safely ignore it.
        </p>
      </div>
    `,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.log('[email.server] sendVenueMagicLinkEmail error', error);
    throw new Error('Failed to send venue magic link email');
  }

  return data;
}

type SendStudentInviteEmailArgs = {
  to: string;
  inviteUrl: string;
  badgeName?: string;
};

export async function sendStudentInviteEmail({ to, inviteUrl, badgeName }: SendStudentInviteEmailArgs) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const from = process.env.RESEND_FROM || 'Badgespot <onboarding@updates.badgespot.com>';
  const subject = badgeName
    ? `Claim your ${badgeName} badge`
    : 'Create your account to claim your badge';

  const { error, data } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${badgeName ? `Claim your ${badgeName} badge` : 'Claim your badge'}</h2>
        <p>You've been invited to Badgespot. Create your account to claim your badge.</p>
        <a href="${inviteUrl}"
           style="display: inline-block; background-color: #111827; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Sign up to claim your badge
        </a>
        <p style="color: #666; font-size: 14px;">If you weren't expecting this, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.log('[email.server] sendStudentInviteEmail error', error);
    throw new Error('Failed to send invite email');
  }

  return data;
}
