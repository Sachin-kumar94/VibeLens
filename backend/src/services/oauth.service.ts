import crypto from "crypto";
import { prisma } from "./prisma.service.js";
import { ENV, isOAuthConfigured } from "../config/env.js";

export interface OAuthStatePayload {
  provider: "google" | "microsoft" | "github" | "linkedin";
  nonce: string;
  createdAt: number;
}

export function generateOAuthState(provider: "google" | "microsoft" | "github" | "linkedin"): string {
  const payload: OAuthStatePayload = {
    provider,
    nonce: crypto.randomBytes(16).toString("hex"),
    createdAt: Date.now(),
  };
  const raw = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", ENV.JWT_SECRET).update(raw).digest("hex");
  return `${raw}.${signature}`;
}

export function verifyOAuthState(stateString: string, expectedProvider: string): boolean {
  if (!stateString) return false;
  const parts = stateString.split(".");
  if (parts.length !== 2) return false;
  const [raw, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", ENV.JWT_SECRET).update(raw).digest("hex");
  if (signature !== expectedSig) return false;

  try {
    const payload: OAuthStatePayload = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8"));
    if (payload.provider !== expectedProvider) return false;
    // Expire state after 15 minutes
    if (Date.now() - payload.createdAt > 15 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export const oauthService = {
  getGoogleAuthUrl(): { url?: string; error?: string } {
    if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
      return {
        error:
          "Google sign-in is not configured. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.",
      };
    }
    if (!ENV.GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com")) {
      return {
        error: `Invalid Google Client ID format ('${ENV.GOOGLE_CLIENT_ID}'). An OAuth Client ID must end with '.apps.googleusercontent.com'. In Google Cloud Console under APIs & Services > Credentials, click 'Create Credentials' > 'OAuth client ID' (Web application).`,
      };
    }
    const state = generateOAuthState("google");
    const scope = encodeURIComponent("openid email profile");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ENV.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      ENV.GOOGLE_CALLBACK_URL
    )}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;
    return { url };
  },

  getMicrosoftAuthUrl(): { url?: string; error?: string } {
    if (!isOAuthConfigured("microsoft")) {
      return {
        error:
          "Microsoft sign-in is currently unavailable. Please configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in backend/.env.",
      };
    }
    const state = generateOAuthState("microsoft");
    const scope = encodeURIComponent("openid profile email User.Read");
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${ENV.MICROSOFT_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      ENV.MICROSOFT_CALLBACK_URL
    )}&response_type=code&scope=${scope}&state=${state}`;
    return { url };
  },

  getGitHubAuthUrl(): { url?: string; error?: string } {
    if (!isOAuthConfigured("github")) {
      return {
        error:
          "GitHub sign-in is currently unavailable. Please configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env.",
      };
    }
    const state = generateOAuthState("github");
    const scope = encodeURIComponent("read:user user:email");
    const url = `https://github.com/login/oauth/authorize?client_id=${ENV.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      ENV.GITHUB_CALLBACK_URL
    )}&scope=${scope}&state=${state}`;
    return { url };
  },

  getLinkedInAuthUrl(): { url?: string; error?: string } {
    if (!isOAuthConfigured("linkedin")) {
      return {
        error:
          "LinkedIn sign-in is currently unavailable. Please configure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in backend/.env.",
      };
    }
    const state = generateOAuthState("linkedin");
    const scope = encodeURIComponent("openid profile email");
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${ENV.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      ENV.LINKEDIN_CALLBACK_URL
    )}&state=${state}&scope=${scope}`;
    return { url };
  },

  // Token Exchanges
  async exchangeGoogleCode(code: string): Promise<{ id: string; email: string; name: string; avatarUrl?: string }> {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: ENV.GOOGLE_CLIENT_ID,
        client_secret: ENV.GOOGLE_CLIENT_SECRET,
        redirect_uri: ENV.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Google token exchange failed: ${err}`);
    }

    const tokenData = (await tokenRes.json()) as any;
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch Google user profile.");
    }

    const profile = (await userRes.json()) as any;
    if (!profile.email) {
      throw new Error("Google account must provide an email address.");
    }

    return {
      id: String(profile.id),
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      avatarUrl: profile.picture,
    };
  },

  async exchangeMicrosoftCode(code: string): Promise<{ id: string; email: string; name: string; avatarUrl?: string }> {
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: ENV.MICROSOFT_CLIENT_ID,
        client_secret: ENV.MICROSOFT_CLIENT_SECRET,
        redirect_uri: ENV.MICROSOFT_CALLBACK_URL,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      throw new Error("Microsoft token exchange failed.");
    }

    const tokenData = (await tokenRes.json()) as any;
    const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch Microsoft profile.");
    }

    const profile = (await userRes.json()) as any;
    const email = profile.mail || profile.userPrincipalName;
    if (!email) {
      throw new Error("Microsoft account must provide an email address.");
    }

    return {
      id: String(profile.id),
      email,
      name: profile.displayName || email.split("@")[0],
    };
  },

  async exchangeGitHubCode(code: string): Promise<{ id: string; email: string; name: string; avatarUrl?: string }> {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: ENV.GITHUB_CLIENT_ID,
        client_secret: ENV.GITHUB_CLIENT_SECRET,
        redirect_uri: ENV.GITHUB_CALLBACK_URL,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("GitHub token exchange failed.");
    }

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || "GitHub authentication failed.");
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "VibeLens-Auth",
      },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch GitHub profile.");
    }

    const profile = (await userRes.json()) as any;
    let email = profile.email;

    if (!email) {
      // Fetch user emails if private
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "VibeLens-Auth",
        },
      });
      if (emailsRes.ok) {
        const emails = ((await emailsRes.json()) as any) || [];
        const primary = emails.find((e: any) => e.primary && e.verified);
        if (primary) email = primary.email;
        else if (emails.length > 0) email = emails[0].email;
      }
    }

    if (!email) {
      throw new Error("GitHub account must have a verified email.");
    }

    return {
      id: String(profile.id),
      email,
      name: profile.name || profile.login || email.split("@")[0],
      avatarUrl: profile.avatar_url,
    };
  },

  async exchangeLinkedInCode(code: string): Promise<{ id: string; email: string; name: string; avatarUrl?: string }> {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: ENV.LINKEDIN_CLIENT_ID,
        client_secret: ENV.LINKEDIN_CLIENT_SECRET,
        redirect_uri: ENV.LINKEDIN_CALLBACK_URL,
      }).toString(),
    });

    if (!tokenRes.ok) {
      throw new Error("LinkedIn token exchange failed.");
    }

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || "LinkedIn authentication failed.");
    }

    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch LinkedIn profile.");
    }

    const profile = (await userRes.json()) as any;
    const email = profile.email;
    if (!email) {
      throw new Error("LinkedIn account must have a verified email.");
    }

    return {
      id: String(profile.sub),
      email,
      name: profile.name || email.split("@")[0],
      avatarUrl: profile.picture,
    };
  },

  // Account Linking & User Creation
  async handleOAuthUser(
    provider: "google" | "microsoft" | "github" | "linkedin",
    profile: {
      id: string;
      email: string;
      name: string;
      avatarUrl?: string;
    }
  ) {
    const cleanEmail = profile.email.toLowerCase().trim();

    // 1. Check if identity already exists
    const identity = await prisma.accountIdentity.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: profile.id,
        },
      },
      include: {
        user: true,
      },
    });

    if (identity) {
      return identity.user;
    }

    // 2. Check if a user already exists with this email (Account Linking)
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: profile.name || cleanEmail.split("@")[0],
          emailVerified: true,
          emailVerifiedAt: new Date(),
          avatarUrl: profile.avatarUrl || "/assets/editorial/hero-editorial-woman.jpg",
          status: "ACTIVE",
          plan: "Free Plan",
        },
      });
    } else {
      // Link: If user exists, mark email verified as identity provider verified it
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true, emailVerifiedAt: new Date() },
        });
      }
    }

    // 3. Create AccountIdentity linking provider to user
    await prisma.accountIdentity.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId: profile.id,
        providerEmail: cleanEmail,
      },
    });

    // 4. Audit log OAuth connection
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        event: "oauth_linked",
        details: JSON.stringify({ provider, providerAccountId: profile.id }),
      },
    }).catch(() => {});

    return user;
  },
};
