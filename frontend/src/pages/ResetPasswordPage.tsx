import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { authApi } from "../services/authApi";

interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Extract token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token") || "";

  // Password strength calculation
  const getStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["bg-[#CF1322]", "bg-[#FAAD14]", "bg-[#52C41A]", "bg-[#1890FF]"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing or invalid. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword: password, confirmPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] relative flex items-center justify-center p-6 overflow-hidden">
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E6E2D8] shadow-[0_20px_50px_rgba(21,23,26,0.06)] space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A855F7] p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-[#15171A]">
              VibeLens
            </span>
          </div>
          <h1 className="font-sans text-2xl font-bold text-[#15171A]">
            Set new password
          </h1>
          <p className="text-xs text-[#707582]">
            Please enter and confirm your new secure password.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-xs text-[#CF1322] flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-12 h-12 rounded-full bg-[#F6FFED] border border-[#B7EB8F] flex items-center justify-center mx-auto text-[#52C41A]">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#15171A]">Password updated successfully</p>
              <p className="text-xs text-[#707582]">
                Your credentials have been updated and previous sessions invalidated.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("/login")}
              className="w-full py-3 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Continue to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5 text-left">
              <label htmlFor="new-password" className="text-[11px] font-medium text-[#575A60]">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  name="new-password"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-2.5 text-[#8C8983] hover:text-[#15171A] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          step <= strength ? strengthColors[strength - 1] : "bg-[#E6E2D8]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-[#707582]">
                    <span>Strength:</span>
                    <span className="font-semibold text-[#15171A]">
                      {strengthLabels[strength - 1] || "Too short"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="confirm-password" className="text-[11px] font-medium text-[#575A60]">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Reset password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
