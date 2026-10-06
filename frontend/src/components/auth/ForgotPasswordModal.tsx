import React, { useState } from "react";
import { X, Mail, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { authApi } from "../../services/authApi";
import { VibeLensLogo } from "../common/BrandIcons";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
  initialEmail = "",
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E6E2D8] shadow-[0_24px_60px_rgba(21,23,26,0.18)] space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8C8983] hover:text-[#15171A] hover:bg-[#F8F6F2] transition cursor-pointer"
          title="Close modal"
        >
          <X size={18} />
        </button>

        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-3">
            <VibeLensLogo size={28} />
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#15171A]">
            Reset your password
          </h2>
          <p className="text-xs text-[#707582] leading-relaxed max-w-xs mx-auto">
            Enter your email address and we'll send you a single-use link to reset your credentials.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-xs text-[#CF1322] leading-relaxed">
            {error}
          </div>
        )}

        {sent ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-12 h-12 rounded-full bg-[#F6FFED] border border-[#B7EB8F] flex items-center justify-center mx-auto text-[#52C41A]">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#15171A]">Check your inbox</p>
              <p className="text-xs text-[#707582] leading-relaxed">
                If an account matches <span className="font-medium text-[#15171A]">{email}</span>, we've sent instructions to reset your password.
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5 text-left">
              <label htmlFor="reset-email" className="text-[11px] font-medium text-[#575A60]">
                Email address
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Mail size={14} className="absolute left-3 top-3.5 text-[#8C8983]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <span>Send reset link</span>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-2.5 text-xs text-[#707582] hover:text-[#15171A] font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Back to sign in</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
