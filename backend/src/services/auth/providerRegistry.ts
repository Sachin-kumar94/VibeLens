import { ENV, isOAuthConfigured } from "../../config/env.js";

export type OAuthProviderName = "google" | "microsoft" | "github" | "linkedin";

export interface PublicProviderStatus {
  password: true;
  emailOtp: true;
  google: boolean;
  microsoft: boolean;
  github: boolean;
  linkedin: boolean;
}

export interface ProviderDiagnostic {
  provider: OAuthProviderName;
  configured: boolean;
  callbackConfigured: boolean;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  initializationStatus: "active" | "disabled";
}

class ProviderRegistry {
  private providers: Map<
    OAuthProviderName,
    {
      configured: boolean;
      callbackUrl: string;
      clientIdSet: boolean;
      clientSecretSet: boolean;
    }
  > = new Map();

  constructor() {
    this.refresh();
  }

  public refresh(): void {
    const providerConfigs: Array<{
      name: OAuthProviderName;
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    }> = [
      {
        name: "google",
        clientId: ENV.GOOGLE_CLIENT_ID,
        clientSecret: ENV.GOOGLE_CLIENT_SECRET,
        callbackUrl: ENV.GOOGLE_CALLBACK_URL,
      },
      {
        name: "microsoft",
        clientId: ENV.MICROSOFT_CLIENT_ID,
        clientSecret: ENV.MICROSOFT_CLIENT_SECRET,
        callbackUrl: ENV.MICROSOFT_CALLBACK_URL,
      },
      {
        name: "github",
        clientId: ENV.GITHUB_CLIENT_ID,
        clientSecret: ENV.GITHUB_CLIENT_SECRET,
        callbackUrl: ENV.GITHUB_CALLBACK_URL,
      },
      {
        name: "linkedin",
        clientId: ENV.LINKEDIN_CLIENT_ID,
        clientSecret: ENV.LINKEDIN_CLIENT_SECRET,
        callbackUrl: ENV.LINKEDIN_CALLBACK_URL,
      },
    ];

    for (const p of providerConfigs) {
      const configured = isOAuthConfigured(p.name);
      this.providers.set(p.name, {
        configured,
        callbackUrl: p.callbackUrl,
        clientIdSet: Boolean(p.clientId && !p.clientId.includes("your_")),
        clientSecretSet: Boolean(p.clientSecret && !p.clientSecret.includes("your_")),
      });
    }
  }

  public logStartupStatus(): void {
    console.log("--------------------------------------------------");
    console.log("VibeLens Authentication Provider Registry:");
    console.log("  ✓ Email + Password: ACTIVE");
    console.log("  ✓ Real Email + OTP: ACTIVE");

    for (const [name, info] of this.providers.entries()) {
      if (info.configured) {
        console.log(`  ✓ ${name.toUpperCase()} OAuth: ACTIVE`);
      } else {
        console.log(`  ⚪ ${name.toUpperCase()} OAuth: DISABLED (Credentials not configured)`);
      }
    }
    console.log("--------------------------------------------------");
  }

  public isAvailable(provider: OAuthProviderName): boolean {
    return this.providers.get(provider)?.configured ?? false;
  }

  public getPublicStatus(): PublicProviderStatus {
    this.refresh();
    return {
      password: true,
      emailOtp: true,
      google: this.isAvailable("google"),
      microsoft: this.isAvailable("microsoft"),
      github: this.isAvailable("github"),
      linkedin: this.isAvailable("linkedin"),
    };
  }

  public getDiagnostics(): ProviderDiagnostic[] {
    this.refresh();
    const list: ProviderDiagnostic[] = [];
    for (const [provider, info] of this.providers.entries()) {
      list.push({
        provider,
        configured: info.configured,
        callbackConfigured: Boolean(info.callbackUrl),
        clientIdConfigured: info.clientIdSet,
        clientSecretConfigured: info.clientSecretSet,
        initializationStatus: info.configured ? "active" : "disabled",
      });
    }
    return list;
  }
}

export const providerRegistry = new ProviderRegistry();
