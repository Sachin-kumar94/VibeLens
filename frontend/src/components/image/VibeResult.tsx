import React from "react";
import { Sparkles, Activity } from "lucide-react";

interface VibeResultProps {
  vibe: string;
  confidence: number;
  radialProfile: {
    calm: number;
    energy: number;
    confidence: number;
    warmth: number;
    focus: number;
    engagement: number;
  };
}

export const VibeResult: React.FC<VibeResultProps> = ({ vibe, confidence, radialProfile }) => {
  const dimensions = [
    { label: "Calm", value: radialProfile.calm },
    { label: "Energy", value: radialProfile.energy },
    { label: "Confidence", value: radialProfile.confidence },
    { label: "Warmth", value: radialProfile.warmth },
    { label: "Focus", value: radialProfile.focus },
    { label: "Engagement", value: radialProfile.engagement },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#DDD8CD]/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#858881]">
            <Sparkles size={14} className="text-[#A97858]" />
            <span>Estimated Visual Vibe</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#17191A] px-2.5 py-0.5 rounded-full bg-white border border-[#DDD8CD]">
            {confidence}% Concordance
          </span>
        </div>

        <div className="text-2xl font-serif font-bold text-[#17191A] tracking-tight">
          {vibe}
        </div>

        {/* 6-Dimension Signal Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {dimensions.map((dim) => (
            <div
              key={dim.label}
              className="bg-white rounded-xl p-2.5 border border-[#DDD8CD]/80 space-y-1"
            >
              <div className="flex justify-between text-[11px]">
                <span className="text-[#858881] font-medium">{dim.label}</span>
                <span className="font-mono font-bold text-[#17191A]">{dim.value}%</span>
              </div>
              <div className="h-1 w-full bg-[#EFE9DE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#30483E] rounded-full"
                  style={{ width: `${dim.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
