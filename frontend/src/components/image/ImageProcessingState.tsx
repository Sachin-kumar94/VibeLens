import React, { useState, useEffect } from "react";
import { Loader2, Check, X } from "lucide-react";

interface ImageProcessingStateProps {
  onCancel?: () => void;
}

const STEPS = [
  "Preparing image...",
  "Checking visual quality...",
  "Reviewing facial and visual signals...",
  "Understanding scene context...",
  "Identifying objects...",
  "Building insight...",
  "Synthesizing report...",
];

export const ImageProcessingState: React.FC<ImageProcessingStateProps> = ({ onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 900);
    return () => clearInterval(stepInterval);
  }, []);

  const progressPercent = Math.min(95, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <div className="rounded-3xl border border-[#DDD8CD] bg-white p-8 sm:p-10 space-y-7 shadow-sm text-center select-none animate-fadeIn">
      {/* Central Spinner */}
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[#EFE9DE]" />
        <Loader2 className="w-12 h-12 text-[#17191A] animate-spin" strokeWidth={1.75} />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#17191A] tracking-tight">
          Analyzing Visual Signals
        </h3>
        <p className="text-xs sm:text-sm text-[#555A58]">
          Please hold on while VibeLens decodes visual nuances and affective signals.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto space-y-2">
        <div className="flex justify-between text-[11px] font-mono text-[#858881]">
          <span>{STEPS[currentStepIndex]}</span>
          <span>{progressPercent}% &bull; {secondsElapsed}s</span>
        </div>
        <div className="h-1.5 w-full bg-[#EFE9DE] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#30483E] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Sequential Checklist */}
      <div className="max-w-sm mx-auto space-y-2 text-left pt-2 border-t border-[#DDD8CD]/50">
        {STEPS.slice(0, 5).map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step}
              className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                isDone
                  ? "text-[#30483E]"
                  : isCurrent
                  ? "text-[#17191A] font-semibold"
                  : "text-[#858881]/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] border ${
                  isDone
                    ? "bg-[#30483E] border-[#30483E] text-white"
                    : isCurrent
                    ? "border-[#17191A] text-[#17191A] animate-pulse"
                    : "border-[#DDD8CD] text-transparent"
                }`}
              >
                {isDone ? <Check size={10} strokeWidth={3} /> : "•"}
              </div>
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full border border-[#DDD8CD] text-[#555A58] hover:text-[#17191A] hover:border-[#17191A] text-xs font-medium transition cursor-pointer"
          >
            Cancel Analysis
          </button>
        </div>
      )}
    </div>
  );
};
