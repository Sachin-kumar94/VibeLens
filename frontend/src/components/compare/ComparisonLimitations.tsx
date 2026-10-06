import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";

interface ComparisonLimitationsProps {
  limitations: string[];
}

export const ComparisonLimitations: React.FC<ComparisonLimitationsProps> = ({ limitations }) => {
  return (
    <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-4 shadow-2xs">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} className="text-[#8C8983]" />
        <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-[#15171A]">
          Methodological Limitations & Context Guardrails
        </h4>
      </div>

      <div className="space-y-2 text-xs text-[#575A60]">
        {limitations.map((limitation, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C8983] shrink-0 mt-1.5" />
            <span>{limitation}</span>
          </div>
        ))}
        <div className="flex items-start gap-2 pt-1 border-t border-[#DDD7CB]/70 text-[#707582] text-[11px]">
          <AlertCircle size={13} className="shrink-0 mt-0.5 text-[#8C8983]" />
          <span>
            VibeLens metrics reflect observable, estimated sensory features (prosody, gaze, kinesics) and are not a measure of psychological character, truthfulness, or clinical state.
          </span>
        </div>
      </div>
    </div>
  );
};
