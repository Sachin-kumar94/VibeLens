import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/authApi";
import {
  GoogleIcon,
  VibeLensLogo,
} from "../common/BrandIcons";
import { OtpInput } from "./OtpInput";
import { OAuthSetupModal, type OAuthProvider } from "./OAuthSetupModal";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "login",
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialMode);
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [stage, setStage] = useState<"form" | "otp" | "success" | "forgot_password">("form");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiresInSeconds, setExpiresInSeconds] = useState(600);
  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | "github" | "linkedin" | null>(null);

  // Isolated Provider State & Errors
  const [providers, setProviders] = useState<{
    google: boolean;
    microsoft: boolean;
    github: boolean;
    linkedin: boolean;
  }>({ google: true, microsoft: false, github: false, linkedin: false });

  const [providerErrors, setProviderErrors] = useState<{
    google?: string;
    microsoft?: string;
    github?: string;
    linkedin?: string;
  }>({});
  const [setupModalProvider, setSetupModalProvider] = useState<OAuthProvider | null>(null);

  const {
    login,
    register,
    requestLoginOTP,
    verifyLoginOTP,
    requestRegisterOTP,
    verifyRegisterOTP,
    resendOTP,
  } = useAuth();

  useEffect(() => {
    setActiveTab(initialMode);
    setAuthMethod("password");
    setStage("form");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setOtp("");
    setError(null);
    setProviderErrors({});
    setResendCooldown(0);
    setExpiresInSeconds(600);
  }, [initialMode, isOpen]);

  // Fetch provider availability
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    authApi
      .getProviders()
      .then((res) => {
        if (mounted && res) {
          setProviders({
            google: Boolean(res.google),
            microsoft: Boolean(res.microsoft),
            github: Boolean(res.github),
            linkedin: Boolean(res.linkedin),
          });
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Expiration timer
  useEffect(() => {
    if (stage !== "otp" || expiresInSeconds <= 0) return;
    const timer = setInterval(() => {
      setExpiresInSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, expiresInSeconds]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maskEmail = (str: string) => {
    const parts = str.split("@");
    if (parts.length !== 2) return str;
    const namePart = parts[0];
    const masked = namePart.length > 2 ? `${namePart[0]}***${namePart.slice(-1)}` : `${namePart}*`;
    return `${masked}@${parts[1]}`;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-[#CF1322]" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-[#FAAD14]" };
    if (score === 3) return { score: 3, label: "Strong", color: "bg-[#52C41A]" };
    return { score: 4, label: "Very Strong", color: "bg-[#1890FF]" };
  };

  const strength = getPasswordStrength(password);

  const handleTabSwitch = (tab: "login" | "register") => {
    setActiveTab(tab);
    setAuthMethod("password");
    setError(null);
    setProviderErrors({});
    setStage("form");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProviderErrors({});

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setError({ message: "Enter a valid email address." });
      return;
    }
    if (!password) {
      setError({ message: "Please enter your password." });
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email: cleanEmail, password, rememberMe });
      setStage("success");
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 600);
    } catch (err: any) {
      setError({
        message: err.message || "Email or password is incorrect.",
        code: err.code,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProviderErrors({});

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setError({ message: "Please enter your full name." });
      return;
    }
    if (!cleanEmail) {
      setError({ message: "Enter a valid email address." });
      return;
    }
    if (password.length < 8) {
      setError({ message: "Password must be at least 8 characters long." });
      return;
    }
    if (password !== confirmPassword) {
      setError({ message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: cleanName,
        email: cleanEmail,
        password,
        confirmPassword,
      });
      setStage("success");
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 600);
    } catch (err: any) {
      setError({
        message: err.message || "Failed to create account.",
        code: err.code,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setProviderErrors({});

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setError({ message: "Enter a valid email address." });
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "login") {
        await requestLoginOTP(cleanEmail);
      } else {
        await requestRegisterOTP(cleanEmail, name.trim());
      }
      setStage("otp");
      setOtp("");
      setResendCooldown(60);
      setExpiresInSeconds(600);
    } catch (err: any) {
      setError({
        message: err.message || "We couldn't send the code.",
        code: err.code,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError({ message: "Please enter the complete 6-digit code." });
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      let user;
      if (activeTab === "login") {
        user = await verifyLoginOTP(cleanEmail, otp);
      } else {
        user = await verifyRegisterOTP(cleanEmail, otp, name.trim());
      }
      setStage("success");
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 700);
    } catch (err: any) {
      setError({ message: err.message || "Invalid verification code." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const purpose = activeTab === "register" ? "REGISTER" : "LOGIN";
      await resendOTP(cleanEmail, purpose, name.trim());
      setResendCooldown(60);
      setExpiresInSeconds(600);
    } catch (err: any) {
      setError({ message: err.message || "Failed to resend code." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProviderErrors({});

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setError({ message: "Enter your email address." });
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(cleanEmail);
      alert("If an account matches this email, we've sent a password reset link.");
      setStage("form");
    } catch (err: any) {
      setError({ message: err.message || "Failed to send reset link." });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "microsoft" | "github" | "linkedin") => {
    setProviderErrors((prev) => ({ ...prev, [provider]: undefined }));
    setError(null);

    if (!providers[provider]) {
      setSetupModalProvider(provider);
      return;
    }

    setOauthLoading(provider);
    window.location.href = `/api/auth/${provider}`;
  };

  const activeProviderError =
    providerErrors.google ||
    providerErrors.microsoft ||
    providerErrors.github ||
    providerErrors.linkedin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D8] shadow-[0_25px_60px_rgba(21,23,26,0.12)] space-y-4 max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#8C8983] hover:text-[#15171A] hover:bg-[#FAF8F5] transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center mb-1.5">
            <VibeLensLogo size={28} />
          </div>
          <h2 className="font-sans text-xl font-bold tracking-tight text-[#15171A]">
            {stage === "forgot_password"
              ? "Reset your password"
              : activeTab === "login"
              ? "Welcome"
              : "Create your account"}
          </h2>
          <p className="text-xs text-[#707582]">
            {stage === "forgot_password"
              ? "We'll send a secure one-time reset link to your email."
              : activeTab === "login"
              ? "Sign in to your private VibeLens account"
              : "Start your VibeLens journey."}
          </p>
        </div>

        {/* Top Navigation Tabs: [ Login ] [ Register ] */}
        {stage === "form" && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F8F6F2] border border-[#E8E4D9] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTabSwitch("login")}
              className={`py-1.5 px-3 rounded-lg transition text-center cursor-pointer ${
                activeTab === "login"
                  ? "bg-white text-[#15171A] shadow-xs"
                  : "text-[#707582] hover:text-[#15171A]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch("register")}
              className={`py-1.5 px-3 rounded-lg transition text-center cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-[#15171A] shadow-xs"
                  : "text-[#707582] hover:text-[#15171A]"
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-xs text-[#CF1322] leading-relaxed animate-in fade-in text-left space-y-1.5">
            <div>{error.message}</div>
            {error.code === "USER_NOT_FOUND" && activeTab === "login" && (
              <button
                type="button"
                onClick={() => handleTabSwitch("register")}
                className="font-semibold underline text-[#CF1322] hover:text-[#A8071A] cursor-pointer flex items-center gap-1"
              >
                <span>Create an account with this email</span>
                <ArrowRight size={12} />
              </button>
            )}
            {error.code === "EMAIL_EXISTS" && activeTab === "register" && (
              <button
                type="button"
                onClick={() => handleTabSwitch("login")}
                className="font-semibold underline text-[#CF1322] hover:text-[#A8071A] cursor-pointer flex items-center gap-1"
              >
                <span>Sign in with this email instead</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        )}

        {/* 1. PASSWORD LOGIN */}
        {stage === "form" && activeTab === "login" && authMethod === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-3.5 text-xs">
            <div className="space-y-1 text-left">
              <label htmlFor="modal-login-email" className="text-[11px] font-medium text-[#575A60]">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="modal-login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Mail size={14} className="absolute left-3 top-3 text-[#8C8983]" />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="modal-login-password" className="text-[11px] font-medium text-[#575A60]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStage("forgot_password");
                    setError(null);
                    setProviderErrors({});
                  }}
                  className="text-[11px] text-[#707582] hover:text-[#15171A] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="modal-login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Lock size={14} className="absolute left-3 top-3 text-[#8C8983]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#8C8983] hover:text-[#15171A] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5 text-left">
              <input
                id="modal-remember-device"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#DDD8CD] text-[#15171A] focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="modal-remember-device"
                className="text-[11px] text-[#575A60] cursor-pointer select-none"
              >
                Remember this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="w-full py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("otp");
                  setError(null);
                  setProviderErrors({});
                }}
                className="text-[11px] text-[#707582] hover:text-[#15171A] hover:underline cursor-pointer"
              >
                Sign in with One-Time Passcode (OTP) instead
              </button>
            </div>
          </form>
        )}

        {/* 2. EMAIL OTP LOGIN */}
        {stage === "form" && activeTab === "login" && authMethod === "otp" && (
          <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
            <div className="space-y-1 text-left">
              <label htmlFor="modal-otp-login-email" className="text-[11px] font-medium text-[#575A60]">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="modal-otp-login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Mail size={14} className="absolute left-3 top-3 text-[#8C8983]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="w-full py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send OTP</span>
              )}
            </button>

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setError(null);
                  setProviderErrors({});
                }}
                className="text-[11px] text-[#707582] hover:text-[#15171A] hover:underline cursor-pointer"
              >
                Sign in with password instead
              </button>
            </div>
          </form>
        )}

        {/* 3. PASSWORD REGISTER */}
        {stage === "form" && activeTab === "register" && authMethod === "password" && (
          <form onSubmit={handlePasswordRegister} className="space-y-3 text-xs">
            <div className="space-y-1 text-left">
              <label htmlFor="modal-register-name" className="text-[11px] font-medium text-[#575A60]">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="modal-register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <User size={14} className="absolute left-3 top-2.5 text-[#8C8983]" />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label htmlFor="modal-register-email" className="text-[11px] font-medium text-[#575A60]">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="modal-register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Mail size={14} className="absolute left-3 top-2.5 text-[#8C8983]" />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label htmlFor="modal-register-password" className="text-[11px] font-medium text-[#575A60]">
                Password
              </label>
              <div className="relative">
                <input
                  id="modal-register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Lock size={14} className="absolute left-3 top-2.5 text-[#8C8983]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#8C8983] hover:text-[#15171A] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="pt-0.5 space-y-0.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= step ? strength.color : "bg-[#E6E2D8]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#707582]">
                    <span>Password strength:</span>
                    <span className="font-semibold text-[#15171A]">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label htmlFor="modal-register-confirm" className="text-[11px] font-medium text-[#575A60]">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="modal-register-confirm"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Lock size={14} className="absolute left-3 top-2.5 text-[#8C8983]" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-[#8C8983] hover:text-[#15171A] transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="w-full py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("otp");
                  setError(null);
                  setProviderErrors({});
                }}
                className="text-[11px] text-[#707582] hover:text-[#15171A] hover:underline cursor-pointer"
              >
                Sign up with One-Time Passcode (OTP) instead
              </button>
            </div>
          </form>
        )}

        {/* 4. REGISTER: EMAIL OTP MODE */}
        {stage === "form" && activeTab === "register" && authMethod === "otp" && (
          <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
            <div className="space-y-1 text-left">
              <label htmlFor="modal-otp-reg-name" className="text-[11px] font-medium text-[#575A60]">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="modal-otp-reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <User size={14} className="absolute left-3 top-3 text-[#8C8983]" />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label htmlFor="modal-otp-reg-email" className="text-[11px] font-medium text-[#575A60]">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="modal-otp-reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Mail size={14} className="absolute left-3 top-3 text-[#8C8983]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="w-full py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Create account with Email OTP</span>
              )}
            </button>

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setError(null);
                  setProviderErrors({});
                }}
                className="text-[11px] text-[#707582] hover:text-[#15171A] hover:underline cursor-pointer"
              >
                Sign up with password instead
              </button>
            </div>
          </form>
        )}

        {/* 5. FORGOT PASSWORD VIEW */}
        {stage === "forgot_password" && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs animate-in fade-in">
            <div className="space-y-1 text-left">
              <label htmlFor="modal-forgot-email" className="text-[11px] font-medium text-[#575A60]">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="modal-forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
                />
                <Mail size={14} className="absolute left-3 top-3 text-[#8C8983]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStage("form");
                setError(null);
                setProviderErrors({});
              }}
              className="w-full text-center text-xs text-[#575A60] hover:text-[#15171A] hover:underline cursor-pointer flex items-center justify-center gap-1.5 pt-1"
            >
              <ArrowLeft size={13} />
              <span>Back to Sign in</span>
            </button>
          </form>
        )}

        {/* 6. OTP VERIFICATION SCREEN */}
        {stage === "otp" && (
          <div className="space-y-3.5 text-xs animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#DDD8CD] flex items-center justify-center mx-auto mb-1.5 text-[#15171A]">
                <Mail size={16} />
              </div>
              <h3 className="text-base font-bold text-[#15171A]">Verify your email</h3>
              <p className="text-xs text-[#707582]">
                We sent a 6-digit code to: <br />
                <span className="font-semibold text-[#15171A] font-mono">{maskEmail(email)}</span>
              </p>
            </div>

            <OtpInput
              value={otp}
              onChange={(val) => {
                setOtp(val);
                setError(null);
              }}
              onComplete={() => {}}
              disabled={loading}
              error={Boolean(error)}
            />

            <div className="flex items-center justify-between text-[11px] text-[#707582] px-1">
              <span>
                Expires in:{" "}
                <span className="font-mono font-semibold text-[#15171A]">
                  {formatTimer(expiresInSeconds)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setStage("form");
                  setError(null);
                  setOtp("");
                }}
                className="text-[#15171A] hover:underline cursor-pointer font-medium"
              >
                Change email
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{activeTab === "login" ? "Verifying..." : "Creating account..."}</span>
                </>
              ) : (
                <span>{activeTab === "login" ? "Verify & Sign In" : "Verify & Create Account"}</span>
              )}
            </button>

            <div className="text-center pt-0.5">
              {resendCooldown > 0 ? (
                <span className="text-[11px] text-[#8C8983]">
                  Resend code in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[11px] font-semibold text-[#15171A] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>Resend code</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 7. SUCCESS SCREEN */}
        {stage === "success" && (
          <div className="py-6 text-center space-y-2.5 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-[#F6FFED] border border-[#B7EB8F] flex items-center justify-center mx-auto text-[#389E0D]">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-sm font-semibold text-[#15171A]">
              {activeTab === "login" ? "Signed in successfully" : "Account created successfully"}
            </h3>
            <p className="text-xs text-[#707582]">
              Redirecting...
            </p>
          </div>
        )}

        {/* Social Auth and Toggles */}
        {stage === "form" && (
          <>
            <div className="relative py-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E6E2D8]" />
              </div>
              <div className="relative flex justify-center text-[10px] tracking-wider uppercase">
                <span className="bg-white px-2.5 text-[#8C8983] font-medium font-mono">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Provider-specific error notice */}
            {activeProviderError && (
              <div className="p-2.5 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-[11px] text-[#CF1322] text-center animate-in fade-in">
                {activeProviderError}
              </div>
            )}

            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={loading || oauthLoading !== null}
              title="Continue with Google"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#DDD8CD] hover:border-[#15171A] hover:bg-[#FAF8F5] transition font-medium text-[#15171A] cursor-pointer shadow-xs active:scale-[0.98] text-xs"
            >
              {oauthLoading === "google" ? (
                <Loader2 size={13} className="animate-spin text-[#4285F4]" />
              ) : (
                <GoogleIcon size={14} />
              )}
              <span>Continue with Google</span>
            </button>

            <div className="text-center text-xs text-[#707582]">
              {activeTab === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("register")}
                    className="font-semibold text-[#15171A] hover:underline cursor-pointer"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("login")}
                    className="font-semibold text-[#15171A] hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        )}

        <p className="text-[10px] text-center text-[#8C8983] leading-tight">
          Your account and personal signal history stay private.
        </p>
      </div>

      {setupModalProvider && (
        <OAuthSetupModal
          provider={setupModalProvider}
          isOpen={true}
          onClose={() => setSetupModalProvider(null)}
          onSelectEmailAuth={() => {
            setSetupModalProvider(null);
            setAuthMethod("otp");
          }}
        />
      )}
    </div>
  );
};
