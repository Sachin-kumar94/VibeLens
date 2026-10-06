import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface VoiceProcessingProps {
  onComplete?: () => void;
}

export const VoiceProcessing: React.FC<VoiceProcessingProps> = ({ onComplete }) => {
  const steps = [
    "Preparing audio sample...",
    "Checking acoustic quality & signal headroom...",
    "Detecting speech cadence & pauses...",
    "Analyzing vocal fundamental frequencies & resonance...",
    "Interpreting prosody, emotion & tone...",
    "Synthesizing personal voice intelligence profile...",
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        if (onComplete) onComplete();
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / steps.length) * 100));

  return (
    <div className="p-8 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs space-y-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] text-[#15171A] flex items-center justify-center mx-auto border border-[#DDD8CD] animate-pulse">
        <Sparkles size={22} className="text-[#10B981]" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-[#15171A] tracking-tight">
          Analyzing Your Voice
        </h3>
        <p className="text-xs text-[#707582]">
          Deconstructing vocal harmonics, speech tempo, and emotional intonation...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 max-w-sm mx-auto">
        <div className="h-2 w-full bg-[#F4F1EA] rounded-full overflow-hidden border border-[#E8E4DA]">
          <div
            className="h-full bg-[#10B981] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-[#8C8983]">
          <span>Processing acoustic data</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Progressive Step List */}
      <div className="space-y-2 max-w-sm mx-auto text-left pt-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs transition-opacity ${
                isDone
                  ? "text-[#059669] font-medium"
                  : isCurrent
                  ? "text-[#15171A] font-semibold"
                  : "text-[#8C8983] opacity-40"
              }`}
            >
              {isDone ? (
                <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
              ) : isCurrent ? (
                <Loader2 size={14} className="text-[#15171A] animate-spin shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-[#DDD8CD] shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
