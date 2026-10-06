import React, { useEffect, useState } from "react";
import { Check, Loader2, Sparkles, Layers } from "lucide-react";

export interface FusionProcessingViewProps {
  onStepComplete?: () => void;
}

const STEPS = [
  "Analyzing visual signals...",
  "Reviewing vocal patterns...",
  "Reviewing body movement...",
  "Comparing cross-modal signals...",
  "Evaluating agreement...",
  "Building combined insight...",
];

export const FusionProcessingView: React.FC<FusionProcessingViewProps> = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-12 px-6 rounded-3xl bg-white border border-[#E6E2D8] shadow-sm flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-2xl bg-[#15171A] text-white flex items-center justify-center shadow-lg">
        <Layers size={26} className="text-[#A855F7] animate-spin" />
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-base font-bold text-[#15171A]">
          Synthesizing Multimodal Signals
        </h3>
        <p className="text-xs text-[#707582]">
          Normalizing and correlating visual, vocal, and kinetic inputs.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="w-full max-w-[340px] space-y-2 pt-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 p-2 rounded-xl text-xs transition-all duration-200 ${
                isCurrent
                  ? "bg-[#FAF8F5] border border-[#DDD8CD] font-semibold text-[#15171A]"
                  : isDone
                  ? "text-[#10B981] font-medium"
                  : "text-[#8C8983] opacity-40"
              }`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                {isDone ? (
                  <Check size={14} className="text-[#10B981]" />
                ) : isCurrent ? (
                  <Loader2 size={13} className="text-[#A855F7] animate-spin" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#DDD8CD]" />
                )}
              </div>
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
