import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { GoogleIcon, MicrosoftIcon, GitHubIcon, LinkedInIcon } from "../common/BrandIcons";

export type OAuthProvider = "google" | "microsoft" | "github" | "linkedin";

interface OAuthSetupModalProps {
  provider: OAuthProvider;
  isOpen: boolean;
  onClose: () => void;
  onSelectEmailAuth?: () => void;
}

const PROVIDER_CONFIG: Record<
  OAuthProvider,
  {
    title: string;
    icon: React.ReactNode;
    consoleName: string;
    consoleUrl: string;
    clientIdVar: string;
    clientSecretVar: string;
    callbackUrl: string;
    instructions: string[];
  }
> = {
  google: {
    title: "Google OAuth Setup",
    icon: <GoogleIcon size={20} />,
    consoleName: "Google Cloud Console",
    consoleUrl: "https://console.cloud.google.com/apis/credentials",
    clientIdVar: "GOOGLE_CLIENT_ID",
    clientSecretVar: "GOOGLE_CLIENT_SECRET",
    callbackUrl: "http://localhost:5000/api/auth/google/callback",
    instructions: [
      "Open Google Cloud Console -> 'APIs & Services' -> 'Credentials'.",
      "Click '+ CREATE CREDENTIALS' -> 'OAuth client ID'.",
      "Application type: 'Web application', Name: 'VibeLens'.",
      "Under 'Authorized redirect URIs', click 'ADD URI' and paste the callback URL below.",
      "Click 'CREATE'. Copy Client ID and Client Secret, and paste them below."
    ]
  },
  microsoft: {
    title: "Microsoft OAuth Setup",
    icon: <MicrosoftIcon size={20} />,
    consoleName: "Microsoft Entra / Azure Portal",
    consoleUrl: "https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade",
    clientIdVar: "MICROSOFT_CLIENT_ID",
    clientSecretVar: "MICROSOFT_CLIENT_SECRET",
    callbackUrl: "http://localhost:5000/api/auth/microsoft/callback",
    instructions: [
      "Open Azure Portal -> 'App registrations' -> click 'New registration'.",
      "Name it 'VibeLens' and choose 'Accounts in any organizational directory and personal Microsoft accounts'.",
      "Under 'Redirect URI (optional)', choose 'Web' and enter the callback URL below.",
      "Click 'Register'. Copy the 'Application (client) ID' as your MICROSOFT_CLIENT_ID.",
      "Go to 'Certificates & secrets' -> 'New client secret', copy the Value as MICROSOFT_CLIENT_SECRET."
    ]
  },
  github: {
    title: "GitHub OAuth Setup",
    icon: <GitHubIcon size={20} />,
    consoleName: "GitHub Developer Settings",
    consoleUrl: "https://github.com/settings/developers",
    clientIdVar: "GITHUB_CLIENT_ID",
    clientSecretVar: "GITHUB_CLIENT_SECRET",
    callbackUrl: "http://localhost:5000/api/auth/github/callback",
    instructions: [
      "Open GitHub Developer Settings -> 'OAuth Apps' -> 'New OAuth App'.",
      "Application name: 'VibeLens', Homepage URL: 'http://localhost:3000'.",
      "Authorization callback URL: paste the callback URL below.",
      "Click 'Register application' and generate a new client secret.",
      "Copy Client ID and Secret into your server/.env."
    ]
  },
  linkedin: {
    title: "LinkedIn OAuth Setup",
    icon: <LinkedInIcon size={20} />,
    consoleName: "LinkedIn Developer Portal",
    consoleUrl: "https://www.linkedin.com/developers/apps",
    clientIdVar: "LINKEDIN_CLIENT_ID",
    clientSecretVar: "LINKEDIN_CLIENT_SECRET",
    callbackUrl: "http://localhost:5000/api/auth/linkedin/callback",
    instructions: [
      "Go to LinkedIn Developers -> click 'Create App'.",
      "Fill in App details and associate with your company or test page.",
      "Under 'Auth' tab -> 'OAuth 2.0 settings', add the Authorized redirect URL below.",
      "Under 'Products' tab, request access to 'Sign In with LinkedIn using OpenID Connect'.",
      "Copy Client ID and Client Secret into your server/.env."
    ]
  }
};

export const OAuthSetupModal: React.FC<OAuthSetupModalProps> = ({
  provider,
  isOpen,
  onClose,
  onSelectEmailAuth
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const config = PROVIDER_CONFIG[provider];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim() || !clientSecretInput.trim()) {
      setSaveError("Please enter both Client ID and Client Secret.");
      return;
    }
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/auth/dev/oauth-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          clientId: clientIdInput.trim(),
          clientSecret: clientSecretInput.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to save configuration.");
      }
      // Redirect straight to official OAuth provider!
      window.location.href = `/api/auth/${provider}`;
    } catch (err: any) {
      setSaveError(err.message || "Failed to save credentials.");
      setSaving(false);
    }
  };

  const envSnippet = `${config.clientIdVar}="your_${provider}_client_id"
${config.clientSecretVar}="your_${provider}_client_secret"
${provider.toUpperCase()}_CALLBACK_URL="${config.callbackUrl}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15171A]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E6E2D8] rounded-2xl shadow-2xl overflow-hidden text-[#15171A]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6E2D8] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F2EDE4] border border-[#E0DACF] flex items-center justify-center">
              {config.icon}
            </div>
            <div>
              <h3 className="font-serif font-semibold text-base text-[#15171A]">{config.title}</h3>
              <p className="text-xs text-[#707582]">Follow these steps or activate instantly below</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#15171A] hover:bg-[#F2EDE4] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick Notice */}
          <div className="p-3 bg-[#F2EDE4]/70 border border-[#E0DACF] rounded-xl text-[#575A60] leading-relaxed">
            Real OAuth requires an official API key from {config.consoleName}. VibeLens does not ask for your {provider} password or use fake logins.
          </div>

          {/* Quick In-App Activation Form */}
          <form onSubmit={handleSaveAndConnect} className="p-4 rounded-xl bg-white border border-[#DDD8CD] space-y-3">
            <div className="flex items-center gap-2 text-[#15171A] font-semibold text-xs pb-1 border-b border-[#E6E2D8]">
              <KeyRound size={14} className="text-[#8C8983]" />
              <span>Instant Activation (Saves to server/.env)</span>
            </div>

            {saveError && (
              <div className="p-2 rounded-lg bg-[#FFF1F0] border border-[#FFA39E] text-[11px] text-[#CF1322]">
                {saveError}
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono uppercase text-[#707582]">{config.clientIdVar}</label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder={`Paste your ${provider} Client ID`}
                className="w-full px-3 py-2 rounded-lg border border-[#DDD8CD] bg-[#FAF8F5] text-xs outline-hidden focus:border-[#15171A] font-mono"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono uppercase text-[#707582]">{config.clientSecretVar}</label>
              <input
                type="password"
                value={clientSecretInput}
                onChange={(e) => setClientSecretInput(e.target.value)}
                placeholder={`Paste your ${provider} Client Secret`}
                className="w-full px-3 py-2 rounded-lg border border-[#DDD8CD] bg-[#FAF8F5] text-xs outline-hidden focus:border-[#15171A] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-[#15171A] hover:bg-[#252833] text-white font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving & Connecting to {provider}...</span>
                </>
              ) : (
                <span>Save & Connect with {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
              )}
            </button>
          </form>

          {/* Steps */}
          <div className="space-y-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#8C8983]">
              How to get your credentials
            </span>
            <ol className="list-decimal list-inside space-y-1.5 text-[#252833] bg-white p-3.5 rounded-xl border border-[#E6E2D8]">
              {config.instructions.map((step, idx) => (
                <li key={idx} className="leading-normal">
                  <span className="font-sans text-[11px]">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Authorized Redirect URI */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#8C8983]">
                Authorized Callback URL
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(config.callbackUrl, "callback")}
                className="text-[11px] font-medium text-[#15171A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedField === "callback" ? (
                  <>
                    <Check size={12} className="text-[#389E0D]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy URL
                  </>
                )}
              </button>
            </div>
            <code className="block p-2.5 bg-white border border-[#E6E2D8] rounded-xl font-mono text-[11px] text-[#15171A] select-all break-all">
              {config.callbackUrl}
            </code>
          </div>

          {/* External link button */}
          <div className="pt-1">
            <a
              href={config.consoleUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#DDD8CD] hover:border-[#8C8983] text-[#15171A] font-medium text-xs shadow-sm hover:shadow transition"
            >
              <span>Open {config.consoleName}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-[#E6E2D8] bg-white text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-[#707582] hover:text-[#15171A] font-medium cursor-pointer"
          >
            Close
          </button>
          {onSelectEmailAuth && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectEmailAuth();
              }}
              className="px-4 py-2 bg-[#15171A] text-white rounded-xl font-medium hover:bg-[#2A2E35] flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Use Email Sign In (Works Instantly)</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
