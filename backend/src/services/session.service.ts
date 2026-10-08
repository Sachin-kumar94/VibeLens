import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "./prisma.service.js";

const COOKIE_NAME = "vibelens_session";
const STANDARD_SESSION_MS = 24 * 60 * 60 * 1000; // 24 Hours
const REMEMBER_ME_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashIp(ip: string | undefined): string {
  if (!ip) return "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

export const sessionService = {
  COOKIE_NAME,

  async createSession(userId: string, req: Request, rememberMe: boolean = false) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const duration = rememberMe ? REMEMBER_ME_SESSION_MS : STANDARD_SESSION_MS;
    const expiresAt = new Date(Date.now() + duration);

    const userAgent = req.headers["user-agent"] || "Unknown Browser";
    const ip = req.ip || (req.headers["x-forwarded-for"] as string) || "127.0.0.1";

    const session = await prisma.session.create({
      data: {
        userId,
        tokenHash,
        userAgent,
        ipHash: hashIp(ip),
        rememberMe,
        expiresAt,
      },
    });

    // Update user lastLoginAt
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    }).catch(() => {});

    return { rawToken, session };
  },

  async validateSession(rawToken: string) {
    if (!rawToken) return null;
    const tokenHash = hashToken(rawToken);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });

    if (!session) return null;

    // Check expiration
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Check user status
    if (session.user.status === "SUSPENDED" || session.user.status === "DELETED") {
      return null;
    }

    // Touch lastUsedAt asynchronously
    prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    return session;
  },

  async revokeSession(rawToken: string) {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    await prisma.session.deleteMany({
      where: { tokenHash },
    }).catch(() => {});
  },

  async revokeSessionById(userId: string, sessionId: string) {
    return await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
  },

  async revokeAllUserSessions(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId },
    });
  },

  async getUserSessions(userId: string, currentToken?: string) {
    const currentTokenHash = currentToken ? hashToken(currentToken) : null;
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { lastUsedAt: "desc" },
    });

    return sessions.map((s) => {
      // Parse friendly browser/OS name from user agent
      const ua = s.userAgent || "";
      let browser = "Web Browser";
      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";

      let os = "Desktop";
      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("iPhone")) os = "iOS";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("Linux")) os = "Linux";

      return {
        id: s.id,
        browser,
        os,
        lastActive: s.lastUsedAt,
        createdAt: s.createdAt,
        isCurrent: currentTokenHash === s.tokenHash,
        rememberMe: s.rememberMe,
      };
    });
  },

  setSessionCookie(res: Response, rawToken: string, rememberMe: boolean = false) {
    const maxAge = rememberMe ? REMEMBER_ME_SESSION_MS : STANDARD_SESSION_MS;
    const isProduction = process.env.NODE_ENV === "production";
    const isSecure = process.env.COOKIE_SECURE === "true" || isProduction;

    res.cookie(COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "none",
      maxAge,
      path: "/",
    });
  },

  clearSessionCookie(res: Response) {
    const isProduction = process.env.NODE_ENV === "production";
    const isSecure = process.env.COOKIE_SECURE === "true" || isProduction;

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "none",
      path: "/",
    });
  },
};
