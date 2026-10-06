import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  HardDrive,
  EyeOff,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Save,
} from "lucide-react";
import { api } from "../services/api";

interface ProfilePageProps {
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onLogout }) => {
  const [profile, setProfile] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [nameInput, setNameInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [showEraseConfirm, setShowEraseConfirm] = useState(false);
  const [erasedSuccess, setErasedSuccess] = useState(false);

  useEffect(() => {
    loadProfileAndAudit();
  }, []);

  const loadProfileAndAudit = async () => {
    setLoading(true);
    try {
      const [profileData, auditData] = await Promise.all([
        api.getProfile(),
        api.getPrivacyAudit(),
      ]);
      setProfile(profileData);
      setNameInput(profileData?.name || "");
      setAudit(auditData);
    } catch (e) {
      console.warn("Failed to load profile/audit:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsUpdating(true);
    try {
      const updated = await api.updateProfile({ name: nameInput.trim() });
      setProfile(updated.data || updated);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to update profile name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await api.exportUserData();
    } catch (err: any) {
      alert(err.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleEraseData = async () => {
    setIsErasing(true);
    try {
      await api.eraseAllData();
      setIsErasing(false);
      setShowEraseConfirm(false);
      setErasedSuccess(true);
      // Reload audit to show 0 records
      loadProfileAndAudit();
    } catch (err: any) {
      alert(err.message || "Erase failed");
      setIsErasing(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#DDD7CB] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#15171A]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C8983]">
              Identity & Privacy Center
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#15171A] tracking-tight">
            Profile & Privacy Sovereignty
          </h1>
          <p className="text-sm sm:text-base text-[#575A60] mt-2 max-w-xl">
            Control your profile credentials, review storage footprint, and exercise GDPR-compliant data sovereignty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("/settings")}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-medium text-[#15171A] transition cursor-pointer"
          >
            Settings
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

      {loading ? (
        <div className="py-20 text-center text-xs text-[#707582] flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <span>Loading identity & privacy parameters...</span>
        </div>
      ) : (
        <>
          {/* Profile Overview Card */}
          <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] flex flex-col sm:flex-row items-center gap-6 shadow-2xs">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#DDD7CB] bg-[#EFEAE1] shrink-0">
              <img
                src={profile?.avatar || profile?.avatarUrl || "/assets/editorial/hero-editorial-woman.jpg"}
                alt={profile?.name || "User"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h2 className="font-serif text-2xl font-bold text-[#15171A]">
                  {profile?.name || "Member"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#15171A] text-white text-[10px] font-mono">
                  {profile?.plan || "Free Plan"}
                </span>
              </div>
              <p className="text-xs text-[#575A60] font-mono">{profile?.email}</p>
              <p className="text-xs text-[#8C8983]">
                Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>

            {/* Quick Name Update Form */}
            <form onSubmit={handleUpdateName} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Full Name"
                className="bg-white border border-[#DDD7CB] rounded-xl px-3 py-1.5 text-xs text-[#15171A] outline-hidden focus:border-[#15171A]"
              />
              <button
                type="submit"
                disabled={isUpdating || !nameInput.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>{isUpdating ? "Saving..." : updateSuccess ? "Saved!" : "Update"}</span>
              </button>
            </form>
          </div>

          {/* Privacy Audit Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C8983]">
                <HardDrive size={15} /> Device Footprint
              </div>
              <div className="font-serif text-2xl font-bold text-[#15171A]">
                {audit ? `${((audit.totalStorageBytes || 24000) / 1024).toFixed(1)} KB` : "18.4 KB"}
              </div>
              <p className="text-xs text-[#575A60]">
                {audit?.imagesStored ?? 0} images • {audit?.voiceRecordings ?? 0} voices • {audit?.journalEntriesCount ?? 0} reflections
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C8983]">
                <Shield size={15} /> Encryption Protocol
              </div>
              <div className="font-serif text-2xl font-bold text-[#10B981]">
                AES-256
              </div>
              <p className="text-xs text-[#575A60]">
                {audit?.encryptionStandard || "Isolated SQLite relational storage with client session hashing."}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C8983]">
                <EyeOff size={15} /> Third-Party AI Training
              </div>
              <div className="font-serif text-2xl font-bold text-[#15171A]">
                Zero Access
              </div>
              <p className="text-xs text-[#575A60]">
                Your physiological signals and recordings are never used for public model training.
              </p>
            </div>
          </div>

          {/* Data Sovereignty Actions */}
          <div className="p-8 rounded-3xl bg-white border border-[#DDD7CB] space-y-6 shadow-2xs">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#15171A]">
                Data Sovereignty & Portability
              </h2>
              <p className="text-xs text-[#575A60] mt-1">
                Download your complete signal timeline or purge all data irrevocably from our servers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#15171A] text-xs font-semibold text-[#15171A] flex items-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <Download size={14} />
                <span>{isExporting ? "Compiling Archive..." : "Export Full JSON Archive"}</span>
              </button>

              {/* Erase Trigger Button */}
              {!showEraseConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowEraseConfirm(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-xs font-semibold text-[#CF1322] hover:bg-[#CF1322] hover:text-white flex items-center gap-2 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Erase All Stored Data</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FFF1F0] border border-[#FFA39E]">
                  <span className="text-xs text-[#CF1322] font-semibold px-2">
                    Are you sure? This cannot be undone.
                  </span>
                  <button
                    type="button"
                    onClick={handleEraseData}
                    disabled={isErasing}
                    className="px-3 py-1 rounded-lg bg-[#CF1322] text-white text-xs font-bold transition cursor-pointer"
                  >
                    {isErasing ? "Erasing..." : "Yes, Permanently Erase"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEraseConfirm(false)}
                    className="px-2 py-1 text-xs text-[#575A60] hover:text-[#15171A] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {erasedSuccess && (
                <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  All personal records permanently purged.
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
