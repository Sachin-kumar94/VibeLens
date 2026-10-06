import { Request, Response, NextFunction } from "express";
import { sessionService } from "../services/session.service.js";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
      sessionRecord?: any;
      rawSessionToken?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[sessionService.COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in to access your VibeLens data.",
        },
      });
    }

    const session = await sessionService.validateSession(token);

    if (!session) {
      sessionService.clearSessionCookie(res);
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: "SESSION_EXPIRED",
          message: "Your session has expired. Please sign in again.",
        },
      });
    }

    req.user = session.user;
    req.sessionRecord = session;
    req.rawSessionToken = token;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "SERVER_ERROR",
        message: "An internal authentication error occurred.",
      },
    });
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[sessionService.COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    }

    if (token) {
      const session = await sessionService.validateSession(token);
      if (session) {
        req.user = session.user;
        req.sessionRecord = session;
        req.rawSessionToken = token;
      }
    }
  } catch (e) {
    // Non-blocking
  }
  next();
}
