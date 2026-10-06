import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle2,
  Lock,
  Smartphone,
  Globe,
  Trash2,
  AlertCircle,
  Key,
  LogOut,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { authApi, ActiveSession } from "../services/authApi";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface SettingsPageProps {
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, onLogout }) => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete Account modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Ephemeral mode
  const [ephemeralMode, setEphemeralMode] = useState(false);
  const [sensoryFeedback, setSensoryFeedback] = useState(true);

  // Load sessions and profile preferences
  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await authApi.getSessions();
      setSessions(res.sessions || []);
    } catch {
      // Non-blocking
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    api.getProfile().then((p) => {
      if (p?.preferences) {
        setEphemeralMode(!!p.preferences.privateMode);
        setSensoryFeedback(p.preferences.sensoryFeedback !== false);
      }
    }).catch(() => {});
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authApi.revokeSession(sessionId);
      await loadSessions();
    } catch (err: any) {
      alert(err.message || "Failed to revoke session");
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Are you sure you want to sign out of all devices? You will need to sign in again.")) {
      return;
    }
    try {
      await authApi.logoutAll();
      if (onLogout) onLogout();
      else onNavigate("/");
    } catch (err: any) {
      alert(err.message || "Failed to sign out of all devices");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (newPassword.length < 8) {
      setPwMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      setPwMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwMessage({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      await authApi.deleteAccount(deletePassword);
      if (onLogout) onLogout();
      else onNavigate("/");
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account. Please verify your password.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#DDD7CB] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#15171A]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C8983]">
              Security & Preferences
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#15171A] tracking-tight">
            Account Governance
          </h1>
          <p className="text-sm sm:text-base text-[#575A60] mt-2 max-w-xl">
            Manage your active sessions, authentication credentials, connected providers, and data retention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogoutAll}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E2D8] hover:border-[#15171A] text-xs font-semibold text-[#15171A] transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <LogOut size={13} />
            <span>Sign Out All Devices</span>
          </button>
          <button
            type="button"
            onClick={() => (onLogout ? onLogout() : onNavigate("/"))}
            className="px-3.5 py-2 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-xs font-semibold text-[#CF1322] hover:bg-[#CF1322] hover:text-white transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Section 1: Active Sessions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E2D8] space-y-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA]">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-[#15171A]" />
              <h2 className="font-sans text-base font-bold text-[#15171A]">
                Active Sessions
              </h2>
            </div>
            <button
              type="button"
              onClick={loadSessions}
              className="text-xs text-[#707582] hover:text-[#15171A] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} className={sessionsLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D8] gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D8] flex items-center justify-center text-[#15171A]">
                    <Globe size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#15171A]">
                        {session.browser} on {session.os}
                      </span>
                      {session.isCurrent && (
                        <span className="text-[10px] font-mono text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F] px-2 py-0.5 rounded-full font-semibold">
                          Current Device
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#707582] block mt-0.5">
                      Last active: {new Date(session.lastActive).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-xs font-medium text-[#CF1322] hover:underline cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Connected Accounts */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E2D8] space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F4F1EA]">
            <Key size={16} className="text-[#15171A]" />
            <h2 className="font-sans text-base font-bold text-[#15171A]">
              Connected Providers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-xl gap-4">
            {/* Google */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D8] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#EA4335]">Google</span>
                <span className="text-[10px] font-mono text-[#707582] bg-white px-2 py-0.5 rounded-md border border-[#E6E2D8]">
                  OAuth 2.0
                </span>
              </div>
              <p className="text-[11px] text-[#707582]">
                Official Google Identity SSO integration.
              </p>
              <a
                href="/api/auth/google"
                className="block text-center w-full py-2 rounded-xl bg-white border border-[#DDD8CD] hover:border-[#15171A] text-xs font-semibold text-[#15171A] transition"
              >
                Connect Google
              </a>
            </div>
          </div>
        </div>

        {/* Section 3: Change Password */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E2D8] space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F4F1EA]">
            <Lock size={16} className="text-[#15171A]" />
            <h2 className="font-sans text-base font-bold text-[#15171A]">
              Change Password
            </h2>
          </div>

          {pwMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                pwMessage.type === "success"
                  ? "bg-[#F6FFED] border border-[#B7EB8F] text-[#52C41A]"
                  : "bg-[#FFF1F0] border border-[#FFA39E] text-[#CF1322]"
              }`}
            >
              {pwMessage.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{pwMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
            <div className="space-y-1.5 text-left">
              <label htmlFor="current-pw" className="text-[11px] font-medium text-[#575A60]">
                Current password
              </label>
              <input
                id="current-pw"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="new-pw" className="text-[11px] font-medium text-[#575A60]">
                New password
              </label>
              <input
                id="new-pw"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="confirm-pw" className="text-[11px] font-medium text-[#575A60]">
                Confirm new password
              </label>
              <input
                id="confirm-pw"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CD] bg-[#FAF8F5] text-xs text-[#15171A] outline-hidden focus:border-[#15171A] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="px-5 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
            >
              {pwLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>

        {/* Section 4: Privacy & Ephemeral Mode */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E2D8] space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F4F1EA]">
            <Shield size={16} className="text-[#15171A]" />
            <h2 className="font-sans text-base font-bold text-[#15171A]">
              Privacy & Ephemerality
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-[#15171A] text-sm block">
                  Ephemeral RAM-Only Mode
                </span>
                <p className="text-[#575A60] mt-0.5">
                  Process camera and microphone input strictly in memory without recording audio files to disk.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const nextVal = !ephemeralMode;
                  setEphemeralMode(nextVal);
                  try {
                    await api.updateProfile({ preferences: { privateMode: nextVal } });
                  } catch (e) {}
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  ephemeralMode ? "bg-[#15171A]" : "bg-[#DDD7CB]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    ephemeralMode ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#F4F1EA]">
              <div>
                <span className="font-semibold text-[#15171A] text-sm block">
                  Sensory Biofeedback
                </span>
                <p className="text-[#575A60] mt-0.5">
                  Real-time subtle visual indicators during webcam and voice coaching.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const nextVal = !sensoryFeedback;
                  setSensoryFeedback(nextVal);
                  try {
                    await api.updateProfile({ preferences: { sensoryFeedback: nextVal } });
                  } catch (e) {}
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  sensoryFeedback ? "bg-[#15171A]" : "bg-[#DDD7CB]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    sensoryFeedback ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Danger Zone (Delete Account) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFF1F0]/50 border border-[#FFA39E] space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-[#CF1322]" />
            <h2 className="font-sans text-base font-bold text-[#CF1322]">
              Delete VibeLens Account
            </h2>
          </div>
          <p className="text-xs text-[#575A60] leading-relaxed">
            Permanently delete your account and all associated multimodal analyses, journal entries, and baseline metrics from the database. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#CF1322] hover:bg-[#A8071A] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E6E2D8] shadow-2xl space-y-5">
            <h3 className="font-sans text-lg font-bold text-[#15171A]">
              Confirm Account Deletion
            </h3>
            <p className="text-xs text-[#707582] leading-relaxed">
              Please enter your password to confirm that you wish to erase your account and all signal history permanently.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-xs text-[#CF1322]">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                type="password"
                placeholder="Your current password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CD] text-xs text-[#15171A] outline-hidden focus:border-[#CF1322]"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD8CD] text-xs font-semibold text-[#15171A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl bg-[#CF1322] text-white text-xs font-semibold hover:bg-[#A8071A] disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
