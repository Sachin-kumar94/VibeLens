import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env regardless of where the node process was initiated
const serverEnvPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: serverEnvPath });
// Also fallback to root .env if present
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  DATABASE_URL: process.env.DATABASE_URL || "file:./vibelens.db",
  SESSION_SECRET: process.env.SESSION_SECRET || "vibelens_editorial_secret_key_2026",
  JWT_SECRET: process.env.JWT_SECRET || "vibelens_editorial_secret_key_2026",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",

  // OAuth Credentials
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",

  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID || "",
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET || "",
  MICROSOFT_CALLBACK_URL:
    process.env.MICROSOFT_CALLBACK_URL || "http://localhost:5000/api/auth/microsoft/callback",

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
  GITHUB_CALLBACK_URL:
    process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",

  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || "",
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET || "",
  LINKEDIN_CALLBACK_URL:
    process.env.LINKEDIN_CALLBACK_URL || "http://localhost:5000/api/auth/linkedin/callback",
};

export function isOAuthConfigured(provider: "google" | "microsoft" | "github" | "linkedin"): boolean {
  switch (provider) {
    case "google":
      return Boolean(
        ENV.GOOGLE_CLIENT_ID &&
        ENV.GOOGLE_CLIENT_SECRET &&
        ENV.GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com") &&
        !ENV.GOOGLE_CLIENT_ID.includes("your_google_client_id")
      );
    case "microsoft":
      return Boolean(
        ENV.MICROSOFT_CLIENT_ID &&
        ENV.MICROSOFT_CLIENT_SECRET &&
        !ENV.MICROSOFT_CLIENT_ID.includes("your_microsoft_client_id")
      );
    case "github":
      return Boolean(
        ENV.GITHUB_CLIENT_ID &&
        ENV.GITHUB_CLIENT_SECRET &&
        !ENV.GITHUB_CLIENT_ID.includes("your_github_client_id")
      );
    case "linkedin":
      return Boolean(
        ENV.LINKEDIN_CLIENT_ID &&
        ENV.LINKEDIN_CLIENT_SECRET &&
        !ENV.LINKEDIN_CLIENT_ID.includes("your_linkedin_client_id")
      );
  }
}

// In production, enforce that critical configurations exist
if (ENV.NODE_ENV === "production") {
  if (!ENV.DATABASE_URL) {
    throw new Error("[FATAL CONFIG] DATABASE_URL must be defined in production.");
  }
  if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "[FATAL CONFIG] Google OAuth is not configured. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in server/.env in production."
    );
  }
}

export function updateOAuthEnv(
  provider: "google" | "microsoft" | "github" | "linkedin",
  clientId: string,
  clientSecret: string
) {
  const upper = provider.toUpperCase() as "GOOGLE" | "MICROSOFT" | "GITHUB" | "LINKEDIN";
  (ENV as any)[`${upper}_CLIENT_ID`] = clientId;
  (ENV as any)[`${upper}_CLIENT_SECRET`] = clientSecret;
  process.env[`${upper}_CLIENT_ID`] = clientId;
  process.env[`${upper}_CLIENT_SECRET`] = clientSecret;
}
