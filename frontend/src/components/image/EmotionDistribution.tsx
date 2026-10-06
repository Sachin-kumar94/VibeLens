import React from "react";
import { EmotionSignal } from "../../services/imageAnalysisApi";
import { Smile, Info } from "lucide-react";

interface EmotionDistributionProps {
  primaryEmotion: string;
  confidence: number;
  explanation: string;
  distribution: EmotionSignal[];
}

export const EmotionDistribution: React.FC<EmotionDistributionProps> = ({
  primaryEmotion,
  confidence,
  explanation,
  distribution,
}) => {
  return (
    <div className="space-y-5">
      {/* Primary Emotion Highlight */}
      <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#DDD8CD]/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#858881]">
            <Smile size={14} className="text-[#A97858]" />
            <span>Primary Observed Emotion</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#30483E] px-2.5 py-0.5 rounded-full bg-[#EBF3EE] border border-[#C8DFD2]">
            {confidence}% Signal Estimate
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-serif font-bold text-[#17191A] tracking-tight">
          {primaryEmotion}
        </div>

        <p className="text-xs sm:text-[13px] text-[#555A58] leading-relaxed font-sans">
          {explanation}
        </p>
      </div>

      {/* Emotion Signal Distribution Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#17191A]">
            Affective Signal Distribution
          </span>
          <span className="text-[11px] text-[#858881] font-mono flex items-center gap-1">
            <Info size={12} />
            <span>Multi-modal signal estimates</span>
          </span>
        </div>

        <div className="space-y-2.5">
          {distribution.map((sig) => (
            <div key={sig.emotion} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#17191A]">{sig.emotion}</span>
                <span className="font-mono text-[#555A58] font-semibold">{sig.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#EFE9DE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#30483E] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${sig.score}%` }}
                />
              </div>
              {sig.label && (
                <div className="text-[10px] text-[#858881] italic">{sig.label}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
