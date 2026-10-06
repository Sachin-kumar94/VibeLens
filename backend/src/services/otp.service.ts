import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "./prisma.service.js";
import { emailService } from "./email.service.js";
import { sessionService } from "./session.service.js";

function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

function sanitizeUser(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    avatarUrl: user.avatarUrl || "/assets/editorial/hero-editorial-woman.jpg",
    plan: user.plan || "Free Plan",
    role: user.role || "USER",
    status: user.status || "ACTIVE",
    theme: user.theme || "editorial",
    language: user.language || "en",
    timezone: user.timezone || "UTC",
    baseline: {
      confidence: user.confidenceBaseline || 82,
      speechPaceWpm: user.paceBaselineWpm || 138,
      postureAlignment: user.postureBaseline || 85,
      vocalEnergy: user.vocalEnergyBaseline || 78,
    },
    preferences: {
      theme: user.theme || "editorial",
      sensoryFeedback: user.sensoryFeedback ?? true,
      privateMode: user.privateMode ?? false,
    },
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export const otpService = {
  /**
   * LOGIN OTP REQUEST
   * Rule: User must ALREADY exist. If not found, throws USER_NOT_FOUND.
   */
  async requestLoginOtp(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const err = new Error("Please enter a valid email address.") as any;
      err.code = "INVALID_EMAIL";
      throw err;
    }

    // Check if account exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const err = new Error("No VibeLens account was found for this email.") as any;
      err.code = "USER_NOT_FOUND";
      throw err;
    }

    if (user.status === "SUSPENDED" || user.status === "DELETED") {
      const err = new Error("Your account has been deactivated. Please contact support.") as any;
      err.code = "ACCOUNT_INACTIVE";
      throw err;
    }

    // 60-Second Cooldown Check
    const recent = await prisma.emailVerificationCode.findFirst({
      where: {
        email: cleanEmail,
        purpose: "LOGIN",
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      const elapsedMs = Date.now() - recent.createdAt.getTime();
      if (elapsedMs < 60 * 1000) {
        const waitSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        const err = new Error(`Please wait ${waitSec} seconds before requesting a new code.`) as any;
        err.code = "COOLDOWN_ACTIVE";
        throw err;
      }
    }

    // Invalidate previous active login codes
    await prisma.emailVerificationCode.updateMany({
      where: {
        email: cleanEmail,
        purpose: "LOGIN",
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    // Generate cryptographically random 6-digit OTP
    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.emailVerificationCode.create({
      data: {
        email: cleanEmail,
        userId: user.id,
        codeHash,
        purpose: "LOGIN",
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
      },
    });

    // Send transactional sign-in email
    await emailService.sendLoginOTP(cleanEmail, user.name, code);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        event: "otp_sent",
        details: JSON.stringify({ email: cleanEmail, purpose: "LOGIN" }),
      },
    }).catch(() => {});

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
    };
  },

  /**
   * LOGIN OTP VERIFY
   * Verifies code and logs into existing account
   */
  async verifyLoginOtp(
    email: string,
    code: string,
    req: Request,
    res: Response
  ): Promise<{ user: any; token: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code ? String(code).trim() : "";

    if (!cleanEmail || !cleanCode) {
      throw new Error("Email and 6-digit verification code are required.");
    }

    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      throw new Error("Verification code must be exactly 6 digits.");
    }

    const record = await prisma.emailVerificationCode.findFirst({
      where: {
        email: cleanEmail,
        purpose: "LOGIN",
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new Error("No active sign-in code found. Please request a new code.");
    }

    if (Date.now() > record.expiresAt.getTime()) {
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });
      throw new Error("That code has expired. Please request a new code.");
    }

    if (record.attempts >= record.maxAttempts) {
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });
      throw new Error("Too many attempts. Request a new code.");
    }

    const inputHash = hashOtp(cleanCode);
    if (inputHash !== record.codeHash) {
      const nextAttempts = record.attempts + 1;
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { attempts: nextAttempts },
      });

      const remaining = record.maxAttempts - nextAttempts;
      if (remaining <= 0) {
        await prisma.emailVerificationCode.update({
          where: { id: record.id },
          data: { consumedAt: new Date() },
        });
        throw new Error("Too many attempts. Request a new code.");
      }

      throw new Error(`That code is incorrect. Please try again. (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`);
    }

    // Mark single-use as consumed
    await prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new Error("Account not found. Please register first.");
    }

    // Touch emailVerified if needed
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      });
    }

    // Create session and set HttpOnly cookie
    const { rawToken } = await sessionService.createSession(user.id, req, true);
    sessionService.setSessionCookie(res, rawToken, true);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        event: "login_success",
        details: JSON.stringify({ method: "otp", email: cleanEmail }),
      },
    }).catch(() => {});

    return {
      user: sanitizeUser(user),
      token: rawToken,
    };
  },

  /**
   * REGISTRATION OTP REQUEST
   * Rule: Checks duplicate email. If user already exists, throws EMAIL_EXISTS.
   */
  async requestRegisterOtp(
    email: string,
    name?: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const err = new Error("Please enter a valid email address.") as any;
      err.code = "INVALID_EMAIL";
      throw err;
    }

    // Check if account already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      const err = new Error("An account with this email already exists. Please sign in.") as any;
      err.code = "EMAIL_EXISTS";
      throw err;
    }

    // 60-Second Cooldown Check
    const recent = await prisma.emailVerificationCode.findFirst({
      where: {
        email: cleanEmail,
        purpose: "REGISTER",
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      const elapsedMs = Date.now() - recent.createdAt.getTime();
      if (elapsedMs < 60 * 1000) {
        const waitSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        const err = new Error(`Please wait ${waitSec} seconds before requesting a new code.`) as any;
        err.code = "COOLDOWN_ACTIVE";
        throw err;
      }
    }

    // Invalidate previous active register codes
    await prisma.emailVerificationCode.updateMany({
      where: {
        email: cleanEmail,
        purpose: "REGISTER",
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailVerificationCode.create({
      data: {
        email: cleanEmail,
        userId: null,
        codeHash,
        purpose: "REGISTER",
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
      },
    });

    const displayName = name?.trim() || cleanEmail.split("@")[0];
    await emailService.sendRegistrationOTP(cleanEmail, displayName, code);

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
    };
  },

  /**
   * REGISTRATION OTP VERIFY
   * Verifies code, creates new User record, creates session
   */
  async verifyRegisterOtp(
    email: string,
    code: string,
    req: Request,
    res: Response,
    name?: string
  ): Promise<{ user: any; token: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code ? String(code).trim() : "";

    if (!cleanEmail || !cleanCode) {
      throw new Error("Email and 6-digit verification code are required.");
    }

    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      throw new Error("Verification code must be exactly 6 digits.");
    }

    const record = await prisma.emailVerificationCode.findFirst({
      where: {
        email: cleanEmail,
        purpose: "REGISTER",
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new Error("No active verification code found. Please request a new code.");
    }

    if (Date.now() > record.expiresAt.getTime()) {
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });
      throw new Error("That code has expired. Please request a new code.");
    }

    if (record.attempts >= record.maxAttempts) {
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });
      throw new Error("Too many attempts. Request a new code.");
    }

    const inputHash = hashOtp(cleanCode);
    if (inputHash !== record.codeHash) {
      const nextAttempts = record.attempts + 1;
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { attempts: nextAttempts },
      });

      const remaining = record.maxAttempts - nextAttempts;
      if (remaining <= 0) {
        await prisma.emailVerificationCode.update({
          where: { id: record.id },
          data: { consumedAt: new Date() },
        });
        throw new Error("Too many attempts. Request a new code.");
      }

      throw new Error(`That code is incorrect. Please try again. (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`);
    }

    // Mark single-use consumed
    await prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    // Check duplicate once more to prevent race conditions
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const displayName = name?.trim() || cleanEmail.split("@")[0];
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: displayName,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: "ACTIVE",
          plan: "Free Plan",
          avatarUrl: "/assets/editorial/hero-editorial-woman.jpg",
        },
      });

      emailService.sendWelcomeEmail(cleanEmail, displayName).catch(() => {});

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          event: "account_created",
          details: JSON.stringify({ method: "otp", email: cleanEmail }),
        },
      }).catch(() => {});
    }

    const { rawToken } = await sessionService.createSession(user.id, req, true);
    sessionService.setSessionCookie(res, rawToken, true);

    return {
      user: sanitizeUser(user),
      token: rawToken,
    };
  },

  // Backwards compatibility aliases
  async sendOtp(email: string, name?: string, purpose: string = "LOGIN") {
    if (purpose === "REGISTER") {
      return this.requestRegisterOtp(email, name);
    }
    return this.requestLoginOtp(email);
  },

  async verifyOtpAndLogin(
    email: string,
    code: string,
    req: Request,
    res: Response,
    name?: string,
    purpose: string = "LOGIN"
  ) {
    if (purpose === "REGISTER") {
      return this.verifyRegisterOtp(email, code, req, res, name);
    }
    return this.verifyLoginOtp(email, code, req, res);
  },
};
