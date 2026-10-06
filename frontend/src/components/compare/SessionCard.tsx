import React from "react";
import { Clock, ShieldCheck, Sparkles, ExternalLink, Calendar, Tag } from "lucide-react";
import { SessionPreview } from "./SessionPreview";

interface SessionCardProps {
  slot: "A" | "B";
  session: {
    id: string;
    type: "image" | "voice" | "body" | "fusion";
    title: string;
    timestamp: string;
    context: string;
    confidence: number;
    signalQuality: number;
    signalQualityRating: "Good" | "Fair" | "Poor";
    vibe: string;
    emotion: string;
    fileUrl?: string;
    fileName?: string;
    voiceMetrics?: any;
    bodyMetrics?: any;
    fusionMetrics?: any;
    imageMetrics?: any;
  };
  onChangeClick?: () => void;
  onViewSession?: (id: string, type: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  slot,
  session,
  onChangeClick,
  onViewSession,
}) => {
  const isA = slot === "A";

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
    } catch {
      return { date: "Unknown date", time: "" };
    }
  };

  const { date, time } = formatDate(session.timestamp);

  const getSlotHeader = () => {
    if (isA) {
      return {
        tag: "Moment A",
        subtitle: "Current / Target",
        borderAccent: "border-[#10B981]/30",
        badgeBg: "bg-[#E6F4EA] text-[#0D9488] border-[#A7F3D0]",
      };
    }
    return {
      tag: "Moment B",
      subtitle: "Previous / Baseline",
      borderAccent: "border-[#3B82F6]/30",
      badgeBg: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    };
  };

  const headerConfig = getSlotHeader();

  return (
    <div
      className={`p-6 sm:p-7 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-5 shadow-xs transition ${headerConfig.borderAccent} relative flex flex-col justify-between`}
    >
      {/* Slot Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-md border ${headerConfig.badgeBg}`}
          >
            {headerConfig.tag} • {headerConfig.subtitle}
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white border border-[#DDD7CB] text-[#575A60]">
            {session.type}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#8C8983] font-mono">
          <Clock size={12} />
          <span>
            {date} · {time}
          </span>
        </div>
      </div>

      {/* Media Preview Area */}
      <SessionPreview session={session} />

      {/* Title and Context */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#15171A] tracking-tight">
            {session.title}
          </h3>
          {onChangeClick && (
            <button
              type="button"
              onClick={onChangeClick}
              className="text-[11px] font-medium text-[#707582] hover:text-[#15171A] underline cursor-pointer shrink-0"
            >
              Change
            </button>
          )}
        </div>
        <p className="text-xs text-[#575A60] mt-1 flex items-center gap-1">
          <Tag size={12} className="text-[#8C8983] shrink-0" />
          <span>Context: {session.context || "Uncategorized session"}</span>
        </p>
      </div>

      {/* Primary Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-[#DDD7CB] text-xs">
        {/* Primary Signal / Emotion */}
        <div className="p-3 rounded-xl bg-white border border-[#DDD7CB]">
          <span className="text-[#8C8983] block text-[10px] font-mono uppercase tracking-wider">
            Primary Signal
          </span>
          <span className="font-serif text-sm font-bold text-[#15171A] truncate block mt-0.5">
            {session.emotion || "Balanced"}
          </span>
        </div>

        {/* Confidence */}
        <div className="p-3 rounded-xl bg-white border border-[#DDD7CB]">
          <span className="text-[#8C8983] block text-[10px] font-mono uppercase tracking-wider">
            Confidence
          </span>
          <span className="font-serif text-base font-bold text-[#10B981] block mt-0.5">
            {session.confidence}%
          </span>
        </div>

        {/* Vibe */}
        <div className="p-3 rounded-xl bg-white border border-[#DDD7CB]">
          <span className="text-[#8C8983] block text-[10px] font-mono uppercase tracking-wider">
            Vibe
          </span>
          <span className="font-serif text-sm font-bold text-[#15171A] truncate block mt-0.5">
            {session.vibe || "Grounded"}
          </span>
        </div>

        {/* Signal Quality */}
        <div className="p-3 rounded-xl bg-white border border-[#DDD7CB]">
          <span className="text-[#8C8983] block text-[10px] font-mono uppercase tracking-wider">
            Quality
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-serif text-sm font-bold text-[#15171A]">
              {session.signalQuality}%
            </span>
            <span
              className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                session.signalQualityRating === "Good"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : session.signalQualityRating === "Fair"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {session.signalQualityRating}
            </span>
          </div>
        </div>
      </div>

      {/* Footer link to view full session */}
      {onViewSession && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onViewSession(session.id, session.type)}
            className="text-xs text-[#707582] hover:text-[#15171A] flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <span>View Original Session</span>
            <ExternalLink size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
