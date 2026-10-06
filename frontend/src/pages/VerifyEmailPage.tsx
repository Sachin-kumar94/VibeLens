import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { authApi } from "../services/authApi";
import { useAuth } from "../context/AuthContext";

interface VerifyEmailPageProps {
  onNavigate: (path: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token") || "";

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Missing verification token. Please check the link from your email.");
        setLoading(false);
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setSuccess(true);
        await refreshUser();
      } catch (err: any) {
        setError(err.message || "Email verification failed or token has expired.");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token, refreshUser]);

  return (
    <div className="min-h-screen bg-[#F8F6F2] relative flex items-center justify-center p-6 overflow-hidden">
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E6E2D8] shadow-[0_20px_50px_rgba(21,23,26,0.06)] space-y-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A855F7] p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.35)]">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-[#15171A]">
            VibeLens
          </span>
        </div>

        {loading ? (
          <div className="py-8 space-y-4">
            <Loader2 size={32} className="animate-spin text-[#A855F7] mx-auto" />
            <p className="text-xs text-[#707582]">Verifying your email address...</p>
          </div>
        ) : success ? (
          <div className="py-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#F6FFED] border border-[#B7EB8F] flex items-center justify-center mx-auto text-[#52C41A]">
              <CheckCircle2 size={30} />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-sans text-xl font-bold text-[#15171A]">Email Verified</h1>
              <p className="text-xs text-[#707582] leading-relaxed">
                Your email address has been confirmed. Your VibeLens account is fully active and secured.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("/dashboard")}
              className="w-full py-3 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#FFF1F0] border border-[#FFA39E] flex items-center justify-center mx-auto text-[#CF1322]">
              <AlertCircle size={30} />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-sans text-xl font-bold text-[#15171A]">Verification Failed</h1>
              <p className="text-xs text-[#CF1322] leading-relaxed">{error}</p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate("/login")}
                className="w-full py-3 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Go to Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
