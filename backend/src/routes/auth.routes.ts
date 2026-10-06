import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../services/prisma.service.js";
import { sessionService } from "../services/session.service.js";
import { emailService } from "../services/email.service.js";
import { oauthService, verifyOAuthState } from "../services/oauth.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { otpService } from "../services/otp.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  authRateLimiter,
  registerRateLimiter,
  forgotPasswordRateLimiter,
} from "../middleware/rateLimit.middleware.js";
import { isOAuthConfigured, updateOAuthEnv } from "../config/env.js";
import { providerRegistry } from "../services/auth/providerRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
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

// 1. POST /api/auth/register
router.post("/register", registerRateLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Name, email, and password are required." },
      });
    }

    const trimmedName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_EMAIL", message: "Please provide a valid email address." },
      });
    }

    // Password requirements: min 8 chars
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "WEAK_PASSWORD", message: "Password must be at least 8 characters long." },
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "PASSWORD_MISMATCH", message: "Passwords do not match." },
      });
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        data: null,
        error: {
          code: "EMAIL_EXISTS",
          message: "An account with this email already exists. Please sign in or reset your password.",
        },
      });
    }

    // Hash password with bcrypt cost 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        email: cleanEmail,
        passwordHash,
        status: "ACTIVE",
        plan: "Free Plan",
        emailVerified: false,
      },
    });

    // Create verification token (expires in 24h)
    const rawVerifyToken = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        userId: newUser.id,
        tokenHash: hashToken(rawVerifyToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Dispatch verification email
    await emailService.sendVerificationEmail(cleanEmail, trimmedName, rawVerifyToken);
    await emailService.sendWelcomeEmail(cleanEmail, trimmedName);

    // Create session and set cookie
    const { rawToken } = await sessionService.createSession(newUser.id, req, false);
    sessionService.setSessionCookie(res, rawToken, false);

    return res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(newUser),
        token: rawToken,
        requiresEmailVerification: true,
        message: "Account created. Please check your email to verify your address.",
      },
      error: null,
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "Failed to create account. Please try again." },
    });
  }
});

// 2. POST /api/auth/login
router.post("/login", authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "MISSING_CREDENTIALS", message: "Email and password are required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Prevent account enumeration: generic message if user not found or has no password
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
      });
    }

    if (user.status === "SUSPENDED" || user.status === "DELETED") {
      return res.status(403).json({
        success: false,
        data: null,
        error: { code: "ACCOUNT_INACTIVE", message: "Your account has been suspended or deactivated." },
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Audit log failed attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          event: "login_failed",
          details: JSON.stringify({ reason: "incorrect_password" }),
        },
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        data: null,
        error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
      });
    }

    // Create session
    const { rawToken } = await sessionService.createSession(user.id, req, Boolean(rememberMe));
    sessionService.setSessionCookie(res, rawToken, Boolean(rememberMe));

    // Audit log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        event: "login_success",
        details: JSON.stringify({ rememberMe: Boolean(rememberMe) }),
      },
    }).catch(() => {});

    return res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token: rawToken,
        message: "Signed in successfully",
      },
      error: null,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "An unexpected error occurred during sign in." },
    });
  }
});

// 3. POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  const token = req.cookies?.[sessionService.COOKIE_NAME] || req.headers.authorization?.substring(7);
  if (token) {
    await sessionService.revokeSession(token);
  }
  sessionService.clearSessionCookie(res);
  return res.json({
    success: true,
    data: { message: "Signed out successfully" },
    error: null,
  });
});

// 4. POST /api/auth/logout-all
router.post("/logout-all", requireAuth, async (req: Request, res: Response) => {
  await sessionService.revokeAllUserSessions(req.user.id);
  sessionService.clearSessionCookie(res);
  return res.json({
    success: true,
    data: { message: "Signed out of all devices successfully." },
    error: null,
  });
});

// 5. GET /api/auth/me
router.get("/me", requireAuth, (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
    error: null,
  });
});

// 6. POST /api/auth/forgot-password
router.post("/forgot-password", forgotPasswordRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "MISSING_EMAIL", message: "Email is required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user && user.status === "ACTIVE") {
      // Create single-use token expiring in 1 hour
      const rawToken = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await emailService.sendPasswordResetEmail(cleanEmail, user.name, rawToken);
    }

    // Always return neutral response to prevent account enumeration
    return res.json({
      success: true,
      data: {
        message: "If an account matches this email, we've sent a password reset link.",
      },
      error: null,
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "Failed to process password reset request." },
    });
  }
});

// 7. POST /api/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "MISSING_FIELDS", message: "Token and new password are required." },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "WEAK_PASSWORD", message: "Password must be at least 8 characters long." },
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "PASSWORD_MISMATCH", message: "Passwords do not match." },
      });
    }

    const tokenHash = hashToken(token);
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || new Date() > resetRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "INVALID_TOKEN",
          message: "Password reset link is invalid or has expired. Please request a new one.",
        },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password and mark token used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all active sessions for security
      prisma.session.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    return res.json({
      success: true,
      data: { message: "Your password has been updated. Please sign in with your new password." },
      error: null,
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "Failed to reset password." },
    });
  }
});

// 8. POST /api/auth/verify-email
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "MISSING_TOKEN", message: "Verification token is required." },
      });
    }

    const tokenHash = hashToken(token);
    const verifyRecord = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!verifyRecord || new Date() > verifyRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "INVALID_TOKEN",
          message: "Verification link is invalid or has expired. Please request a new verification email.",
        },
      });
    }

    // Mark email verified and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verifyRecord.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { id: verifyRecord.id },
      }),
    ]);

    return res.json({
      success: true,
      data: { message: "Email verified successfully. Welcome to VibeLens." },
      error: null,
    });
  } catch (err: any) {
    console.error("Verify email error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "Failed to verify email." },
    });
  }
});

// 9. POST /api/auth/resend-verification
router.post("/resend-verification", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user.emailVerified) {
      return res.json({
        success: true,
        data: { message: "Your email is already verified." },
        error: null,
      });
    }

    const rawVerifyToken = crypto.randomBytes(32).toString("hex");
    // Delete any old tokens
    await prisma.verificationToken.deleteMany({
      where: { userId: req.user.id },
    });

    await prisma.verificationToken.create({
      data: {
        userId: req.user.id,
        tokenHash: hashToken(rawVerifyToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await emailService.sendVerificationEmail(req.user.email, req.user.name, rawVerifyToken);

    return res.json({
      success: true,
      data: { message: "Verification email resent. You can request another in 60 seconds." },
      error: null,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "Failed to resend verification email." },
    });
  }
});

// 10. POST /api/auth/change-password
router.post("/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "MISSING_FIELDS", message: "Current and new passwords are required." },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "WEAK_PASSWORD", message: "New password must be at least 8 characters long." },
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "PASSWORD_MISMATCH", message: "New passwords do not match." },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.passwordHash) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "NO_PASSWORD", message: "Account was created with OAuth. Please set a password." },
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: "INVALID_PASSWORD", message: "Current password is incorrect." },
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    return res.json({
      success: true,
      data: { message: "Password updated successfully." },
      error: null,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "Failed to update password." },
    });
  }
});

// 11. GET /api/auth/sessions
router.get("/sessions", requireAuth, async (req: Request, res: Response) => {
  const sessions = await sessionService.getUserSessions(req.user.id, req.rawSessionToken);
  return res.json({
    success: true,
    data: { sessions },
    error: null,
  });
});

// 12. DELETE /api/auth/sessions/:id
router.delete("/sessions/:id", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  await sessionService.revokeSessionById(req.user.id, String(id));
  return res.json({
    success: true,
    data: { message: "Session revoked successfully." },
    error: null,
  });
});

// 13. DELETE /api/auth/account
router.delete("/account", requireAuth, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (user?.passwordHash) {
      if (!password) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { code: "PASSWORD_REQUIRED", message: "Please confirm your password to delete your account." },
        });
      }
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          data: null,
          error: { code: "INVALID_PASSWORD", message: "Incorrect password." },
        });
      }
    }

    // Delete user (Prisma cascade deletes sessions, analyses, journal, tokens)
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    sessionService.clearSessionCookie(res);

    return res.json({
      success: true,
      data: { message: "Account and associated data deleted permanently." },
      error: null,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "Failed to delete account." },
    });
  }
});

// 13a. POST /api/auth/login/request-otp (Login via OTP - User MUST exist)
router.post("/login/request-otp", authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email is required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = await otpService.requestLoginOtp(cleanEmail);
    return res.json({
      success: true,
      data: { message: result.message },
      error: null,
    });
  } catch (err: any) {
    const statusCode = err.code === "USER_NOT_FOUND" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      data: null,
      error: {
        code: err.code || "OTP_DISPATCH_FAILED",
        message: err.message || "Failed to dispatch verification code.",
      },
    });
  }
});

// 13b. POST /api/auth/login/verify-otp (Verify login OTP and create session)
router.post("/login/verify-otp", authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email and 6-digit OTP code are required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    const result = await otpService.verifyLoginOtp(cleanEmail, cleanOtp, req, res);
    return res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: "OTP_VERIFICATION_FAILED", message: err.message || "Failed to verify code." },
    });
  }
});

// 13c. POST /api/auth/register/request-otp (Register via real account OTP - User must NOT exist)
router.post("/register/request-otp", registerRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email is required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = await otpService.requestRegisterOtp(cleanEmail, name);
    return res.json({
      success: true,
      data: { message: result.message },
      error: null,
    });
  } catch (err: any) {
    const statusCode = err.code === "EMAIL_EXISTS" ? 409 : 400;
    return res.status(statusCode).json({
      success: false,
      data: null,
      error: {
        code: err.code || "OTP_DISPATCH_FAILED",
        message: err.message || "Failed to dispatch verification code.",
      },
    });
  }
});

// 13d. POST /api/auth/register/verify-otp (Verify registration OTP and create user)
router.post("/register/verify-otp", registerRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp, name } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email and 6-digit OTP code are required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    const result = await otpService.verifyRegisterOtp(cleanEmail, cleanOtp, req, res, name);
    return res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: "OTP_VERIFICATION_FAILED", message: err.message || "Failed to verify code." },
    });
  }
});

// 13e. POST /api/auth/resend-otp (Generic resend supporting both login and register)
router.post("/resend-otp", authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, purpose, name } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email is required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let result;
    if (purpose === "REGISTER") {
      result = await otpService.requestRegisterOtp(cleanEmail, name);
    } else {
      result = await otpService.requestLoginOtp(cleanEmail);
    }

    return res.json({
      success: true,
      data: { message: result.message },
      error: null,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: err.code || "OTP_DISPATCH_FAILED", message: err.message || "Failed to resend code." },
    });
  }
});

// 13f. POST /api/auth/otp/send (Backwards compatible fallback)
router.post("/otp/send", async (req: Request, res: Response) => {
  try {
    const { email, name, purpose } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email is required to send verification code." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = purpose === "REGISTER"
      ? await otpService.requestRegisterOtp(cleanEmail, name)
      : await otpService.requestLoginOtp(cleanEmail);

    return res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: err.code || "OTP_DISPATCH_FAILED", message: err.message || "Failed to dispatch verification code." },
    });
  }
});

// 13g. POST /api/auth/otp/verify (Backwards compatible fallback)
router.post("/otp/verify", async (req: Request, res: Response) => {
  try {
    const { email, otp, purpose, name } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email and 6-digit OTP code are required." },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    const result = purpose === "REGISTER"
      ? await otpService.verifyRegisterOtp(cleanEmail, cleanOtp, req, res, name)
      : await otpService.verifyLoginOtp(cleanEmail, cleanOtp, req, res);

    return res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: "OTP_VERIFICATION_FAILED", message: err.message || "Failed to verify code." },
    });
  }
});

// 14. GET /api/auth/providers (Status check for available OAuth providers)
router.get("/providers", (_req: Request, res: Response) => {
  const status = providerRegistry.getPublicStatus();
  return res.json({
    success: true,
    data: status,
    configured: status,
    error: null,
  });
});

// 14b. GET /api/auth/providers/diagnostics (Developer/Admin diagnostics)
router.get("/providers/diagnostics", (_req: Request, res: Response) => {
  const diagnostics = providerRegistry.getDiagnostics();
  return res.json({
    success: true,
    data: diagnostics,
    error: null,
  });
});

// 14c. POST /api/auth/dev/oauth-config (Helper to configure OAuth credentials)
router.post("/dev/oauth-config", async (req: Request, res: Response) => {
  try {
    const { provider, clientId, clientSecret } = req.body;
    if (!provider || !clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        error: { message: "Provider, clientId, and clientSecret are required." },
      });
    }
    const cleanId = String(clientId).trim();
    const cleanSecret = String(clientSecret).trim();
    const upper = provider.toUpperCase();

    updateOAuthEnv(provider as any, cleanId, cleanSecret);
    providerRegistry.refresh();

    // Persist to backend/.env
    const envPath = path.resolve(__dirname, "../../.env");
    let envContent = fs.readFileSync(envPath, "utf-8");
    const idRegex = new RegExp(`^${upper}_CLIENT_ID=.*$`, "m");
    const secRegex = new RegExp(`^${upper}_CLIENT_SECRET=.*$`, "m");
    if (idRegex.test(envContent)) {
      envContent = envContent.replace(idRegex, `${upper}_CLIENT_ID="${cleanId}"`);
    } else {
      envContent += `\n${upper}_CLIENT_ID="${cleanId}"`;
    }
    if (secRegex.test(envContent)) {
      envContent = envContent.replace(secRegex, `${upper}_CLIENT_SECRET="${cleanSecret}"`);
    } else {
      envContent += `\n${upper}_CLIENT_SECRET="${cleanSecret}"`;
    }
    fs.writeFileSync(envPath, envContent, "utf-8");

    return res.json({
      success: true,
      data: { message: `${provider} configured successfully!` },
      error: null,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err.message || "Failed to update OAuth configuration." },
    });
  }
});

// 15. Real OAuth Provider Initiation Endpoints
router.get("/google", (req: Request, res: Response) => {
  const result = oauthService.getGoogleAuthUrl();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  if (result.error || !result.url) {
    if (req.accepts("json") && !req.accepts("html")) {
      return res.status(503).json({
        success: false,
        data: null,
        error: { code: "OAUTH_PROVIDER_UNAVAILABLE", provider: "google", message: "Google sign-in is temporarily unavailable." }
      });
    }
    return res.redirect(`${frontendUrl}/login?oauth_provider=google&oauth_error=unavailable`);
  }
  return res.redirect(result.url);
});

router.get("/microsoft", (req: Request, res: Response) => {
  const result = oauthService.getMicrosoftAuthUrl();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  if (result.error || !result.url) {
    if (req.accepts("json") && !req.accepts("html")) {
      return res.status(503).json({
        success: false,
        data: null,
        error: { code: "OAUTH_PROVIDER_UNAVAILABLE", provider: "microsoft", message: "Microsoft sign-in is temporarily unavailable." }
      });
    }
    return res.redirect(`${frontendUrl}/login?oauth_provider=microsoft&oauth_error=unavailable`);
  }
  return res.redirect(result.url);
});

router.get("/github", (req: Request, res: Response) => {
  const result = oauthService.getGitHubAuthUrl();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  if (result.error || !result.url) {
    if (req.accepts("json") && !req.accepts("html")) {
      return res.status(503).json({
        success: false,
        data: null,
        error: { code: "OAUTH_PROVIDER_UNAVAILABLE", provider: "github", message: "GitHub sign-in is temporarily unavailable." }
      });
    }
    return res.redirect(`${frontendUrl}/login?oauth_provider=github&oauth_error=unavailable`);
  }
  return res.redirect(result.url);
});

router.get("/linkedin", (req: Request, res: Response) => {
  const result = oauthService.getLinkedInAuthUrl();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  if (result.error || !result.url) {
    if (req.accepts("json") && !req.accepts("html")) {
      return res.status(503).json({
        success: false,
        data: null,
        error: { code: "OAUTH_PROVIDER_UNAVAILABLE", provider: "linkedin", message: "LinkedIn sign-in is temporarily unavailable." }
      });
    }
    return res.redirect(`${frontendUrl}/login?oauth_provider=linkedin&oauth_error=unavailable`);
  }
  return res.redirect(result.url);
});

// 16. OAuth Callbacks
router.get("/:provider/callback", async (req: Request, res: Response) => {
  const { provider } = req.params;
  const { code, state, error, error_description } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (error || !code) {
    const reason = error === "access_denied" ? "Sign-in was cancelled." : String(error_description || "Authentication cancelled.");
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(reason)}`);
  }

  if (provider !== "google" && provider !== "microsoft" && provider !== "github" && provider !== "linkedin") {
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Invalid authentication provider.")}`);
  }

  if (!verifyOAuthState(String(state), provider as any)) {
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Invalid or expired OAuth state. Please try again.")}`);
  }

  try {
    let profile: { id: string; email: string; name: string; avatarUrl?: string };

    if (provider === "google") {
      profile = await oauthService.exchangeGoogleCode(String(code));
    } else if (provider === "microsoft") {
      profile = await oauthService.exchangeMicrosoftCode(String(code));
    } else if (provider === "github") {
      profile = await oauthService.exchangeGitHubCode(String(code));
    } else {
      profile = await oauthService.exchangeLinkedInCode(String(code));
    }

    // Link or create user and AccountIdentity
    const user = await oauthService.handleOAuthUser(provider as any, profile);

    // Create secure session
    const { rawToken } = await sessionService.createSession(user.id, req, true);
    sessionService.setSessionCookie(res, rawToken, true);

    return res.redirect(`${frontendUrl}/dashboard`);
  } catch (e: any) {
    console.error(`OAuth callback error for ${provider}:`, e?.message || e);
    const safeErrorMsg = e?.message?.includes("must provide an email")
      ? e.message
      : `Failed to authenticate with ${provider}. Please try email sign-in.`;
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(safeErrorMsg)}`);
  }
});

export default router;
