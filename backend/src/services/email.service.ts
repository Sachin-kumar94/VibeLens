import nodemailer, { type Transporter } from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  }

  // If in development and no SMTP configured, use ethereal test account
  if (process.env.NODE_ENV !== "production") {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("[EMAIL SERVICE] Initialized development Ethereal SMTP transport.");
      return transporter;
    } catch {
      // Fallback to JSON transport in test environments if ethereal unreachable
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      return transporter;
    }
  }

  // Production requires configured SMTP credentials
  throw new Error("SMTP credentials are not configured in production.");
}

export const emailService = {
  async sendEmail({ to, subject, text, html }: SendEmailOptions): Promise<boolean> {
    try {
      const mailer = await getTransporter();
      const from = process.env.EMAIL_FROM || "VibeLens <security@vibelens.ai>";

      const info = await mailer.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });

      // Operational log without exposing secrets or OTP codes
      console.log(`[EMAIL SERVICE] Dispatched email to: ${to} (Subject: "${subject}")`);

      // If ethereal transport was used in development, log the preview URL for verification
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[EMAIL SERVICE] Ethereal Inbox Preview: ${previewUrl}`);
      }

      return true;
    } catch (err: any) {
      console.error("[EMAIL SERVICE] Failed to dispatch email:", err?.message || "Unknown error");
      throw new Error("We couldn't send the verification code. Please try again.");
    }
  },

  async sendLoginOTP(to: string, name: string, otp: string): Promise<boolean> {
    const subject = "Your VibeLens sign-in code";
    const text = `Hello ${name},\n\nYour VibeLens verification code is:\n\n${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.\n\n— The VibeLens Security Team`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 36px 28px; background: #FAF8F5; border: 1px solid #E6E2D8; border-radius: 16px; color: #15171A;">
        <div style="margin-bottom: 24px;">
          <span style="font-weight: 800; font-size: 22px; letter-spacing: -0.5px; color: #15171A;">VibeLens</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #15171A; letter-spacing: -0.3px;">Sign in to VibeLens</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #575A60; margin-bottom: 24px;">
          Hello ${name}, your VibeLens verification code is:
        </p>
        <div style="margin: 28px 0; padding: 20px 24px; background: #FFFFFF; border: 1px solid #DDD8CD; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 12px; font-family: monospace; color: #15171A; display: inline-block; padding-left: 12px;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #8C8983; line-height: 1.5; margin-bottom: 16px;">
          This code expires in <strong>10 minutes</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #E6E2D8; margin: 24px 0;" />
        <p style="font-size: 11px; color: #8C8983; line-height: 1.4;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  },

  async sendRegistrationOTP(to: string, name: string, otp: string): Promise<boolean> {
    const subject = "Verify your VibeLens account";
    const text = `Hello ${name},\n\nYour verification code:\n\n${otp}\n\nExpires in: 10 minutes\n\n— The VibeLens Security Team`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 36px 28px; background: #FAF8F5; border: 1px solid #E6E2D8; border-radius: 16px; color: #15171A;">
        <div style="margin-bottom: 24px;">
          <span style="font-weight: 800; font-size: 22px; letter-spacing: -0.5px; color: #15171A;">VibeLens</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #15171A; letter-spacing: -0.3px;">Verify your VibeLens account</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #575A60; margin-bottom: 24px;">
          Hello ${name}, your verification code is:
        </p>
        <div style="margin: 28px 0; padding: 20px 24px; background: #FFFFFF; border: 1px solid #DDD8CD; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 12px; font-family: monospace; color: #15171A; display: inline-block; padding-left: 12px;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #8C8983; line-height: 1.5; margin-bottom: 16px;">
          Expires in: <strong>10 minutes</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #E6E2D8; margin: 24px 0;" />
        <p style="font-size: 11px; color: #8C8983; line-height: 1.4;">
          If you did not request this verification code, please ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  },

  async sendVerificationCode(to: string, name: string, otp: string): Promise<boolean> {
    return this.sendLoginOTP(to, name, otp);
  },

  async sendPasswordReset(to: string, name: string, token: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const subject = "Reset your VibeLens password";
    const text = `Hello ${name},\n\nYou requested to reset your password for VibeLens. Use this single-use link to choose a new password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\n— The VibeLens Security Team`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 36px 28px; background: #FAF8F5; border: 1px solid #E6E2D8; border-radius: 16px; color: #15171A;">
        <div style="margin-bottom: 24px;">
          <span style="font-weight: 800; font-size: 22px; letter-spacing: -0.5px; color: #15171A;">VibeLens</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #15171A; letter-spacing: -0.3px;">Reset your password</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #575A60; margin-bottom: 24px;">
          Hello ${name}, we received a request to reset the password for your VibeLens account. Click the button below to set a new password:
        </p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 13px 28px; background: #15171A; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 13px; letter-spacing: 0.2px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #8C8983; line-height: 1.5; margin-bottom: 16px;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #6F7471; word-break: break-all;">${resetUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #E6E2D8; margin: 24px 0;" />
        <p style="font-size: 11px; color: #8C8983; line-height: 1.4;">
          This link expires in 1 hour and can only be used once. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  },

  async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    const subject = "Verify your VibeLens email";
    const text = `Hello ${name},\n\nPlease verify your email for VibeLens by clicking this link:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\n— The VibeLens Team`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 36px 28px; background: #FAF8F5; border: 1px solid #E6E2D8; border-radius: 16px; color: #15171A;">
        <div style="margin-bottom: 24px;">
          <span style="font-weight: 800; font-size: 22px; letter-spacing: -0.5px; color: #15171A;">VibeLens</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #15171A;">Verify your email address</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #575A60; margin-bottom: 24px;">
          Hello ${name}, thank you for joining VibeLens. Please confirm your email to activate your account and secure your personal signal archive.
        </p>
        <div style="margin: 28px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 13px 28px; background: #15171A; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 13px;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 12px; color: #8C8983; line-height: 1.5;">
          Direct link: <a href="${verifyUrl}" style="color: #6F7471;">${verifyUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #E6E2D8; margin: 24px 0;" />
        <p style="font-size: 11px; color: #8C8983;">This link expires in 24 hours.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, text, html });
  },

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
    return this.sendPasswordReset(to, name, token);
  },

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = "Welcome to VibeLens";
    const text = `Hello ${name},\n\nWelcome to VibeLens. Your account is ready.\n\n— The VibeLens Team`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 36px 28px; background: #FAF8F5; border: 1px solid #E6E2D8; border-radius: 16px; color: #15171A;">
        <div style="margin-bottom: 24px;">
          <span style="font-weight: 800; font-size: 22px; letter-spacing: -0.5px; color: #15171A;">VibeLens</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #15171A;">Welcome to VibeLens</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #575A60; margin-bottom: 20px;">
          Hello ${name}, your personal account is confirmed. Your signal analyses, history, journal, and insights remain private and strictly owned by you.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html }).catch(() => false);
  },
};
