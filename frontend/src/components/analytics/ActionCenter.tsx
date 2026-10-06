import React from "react";
import { Sparkles, ArrowRight, Activity, Layers, Columns, Mic, Camera } from "lucide-react";

interface ActionCenterProps {
  modalityMix: Array<{
    type: "image" | "voice" | "body" | "fusion" | "interview" | "presentation" | string;
    count: number;
  }>;
  totalAnalyses: number;
  onNavigate: (path: string) => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  modalityMix,
  totalAnalyses,
  onNavigate,
}) => {
  const missingBody = modalityMix.find((m) => m.type === "body")?.count === 0;
  const missingFusion = modalityMix.find((m) => m.type === "fusion")?.count === 0;
  const missingVoice = modalityMix.find((m) => m.type === "voice")?.count === 0;
  const missingImage = modalityMix.find((m) => m.type === "image")?.count === 0;

  // Decide recommendations based on actual missing modalities
  let title = "Next Best Action: Multimodal Progression";
  let description = "Compare your recorded moments to track progress or record a new session.";
  let actionLabel = "Compare Sessions";
  let actionPath = "/compare";
  let icon = <Columns size={16} className="text-[#3B82F6]" />;

  if (missingBody) {
    title = "Next Best Action: Explore Body Language";
    description = "You haven't recorded any body sessions yet. Track posture alignment, gaze consistency, and presence.";
    actionLabel = "Try Body Analysis";
    actionPath = "/body";
    icon = <Activity size={16} className="text-[#F59E0B]" />;
  } else if (missingFusion) {
    title = "Next Best Action: Multimodal Signal Fusion";
    description = "Synthesize Image, Voice, and Body in a single capture to triangulate presence concordance.";
    actionLabel = "Try Fusion Analysis";
    actionPath = "/fusion";
    icon = <Layers size={16} className="text-[#A855F7]" />;
  } else if (missingVoice) {
    title = "Next Best Action: Vocal Prosody Scan";
    description = "Record your speech pacing (WPM), pitch stability, and acoustic energy.";
    actionLabel = "Try Voice Analysis";
    actionPath = "/voice";
    icon = <Mic size={16} className="text-[#10B981]" />;
  } else if (totalAnalyses >= 2) {
    title = "Next Best Action: Side-by-Side Comparison";
    description = "You have multiple saved sessions! Compare any two moments to track your signal shifts.";
    actionLabel = "Compare Sessions";
    actionPath = "/compare";
    icon = <Columns size={16} className="text-[#10B981]" />;
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DDD7CB] shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-serif text-lg font-bold text-[#15171A]">
            Contextual Action Center
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#8C8983] uppercase">
          Adaptive Guidance
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-[#15171A]">{title}</h4>
          <p className="text-xs text-[#575A60] mt-0.5 max-w-lg">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate(actionPath)}
          className="px-4 py-2.5 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 transition"
        >
          <span>{actionLabel}</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
