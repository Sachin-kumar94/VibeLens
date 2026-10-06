import React, { useState } from "react";
import { Mic, Camera, ArrowRight } from "lucide-react";

interface HeroInteractiveCommandBarProps {
  onSubmit?: (prompt: string) => void;
  onSelectTab?: (tab: string) => void;
  shiftX?: number;
  shiftY?: number;
  isReducedMotion?: boolean;
  className?: string;
}

export const HeroInteractiveCommandBar: React.FC<HeroInteractiveCommandBarProps> = ({
  onSubmit,
  onSelectTab,
  shiftX = 0,
  shiftY = 0,
  isReducedMotion = false,
  className = "",
}) => {
  const [query, setQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      if (onSubmit) onSubmit(query);
      else if (onSelectTab) onSelectTab("image-analysis");
    }
  };

  return (
    <div
      className={`w-full max-w-[660px] mx-auto select-none will-change-transform ${className}`}
      style={{
        transform: isReducedMotion
          ? undefined
          : `translate3d(${shiftX * 0.6}px, ${shiftY * 0.6}px, 0)`,
        transition: "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      <div className="h-14 sm:h-16 px-4 rounded-2xl transition-all duration-200 hover:shadow-md flex items-center gap-3 bg-white border border-[#DDD7CB] shadow-[0_2px_12px_rgba(21,23,26,0.04)]">
        {/* Left Quiet Observation Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#F7F4EE] border border-[#E6E1D6] flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#708C74]" />
          <span className="text-[11px] font-mono text-[#25282C] font-medium tracking-wide hidden sm:inline">
            Observation
          </span>
        </div>

        {/* Input Field with Editorial Typography */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Observe a moment, reflect on a dialogue, or explore signals..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-[#15171A] placeholder-[#8C8983] outline-none font-sans font-normal"
        />

        {/* Multimodal Quick Access Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Image Signal"
            onClick={() => onSelectTab && onSelectTab("image-analysis")}
            className="w-9 h-9 rounded-xl hover:bg-[#F7F4EE] border border-transparent hover:border-[#DDD7CB] text-[#8C8983] hover:text-[#15171A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Camera size={16} />
          </button>

          <button
            type="button"
            title="Voice Signal"
            onClick={() => onSelectTab && onSelectTab("voice")}
            className="w-9 h-9 rounded-xl hover:bg-[#F7F4EE] border border-transparent hover:border-[#DDD7CB] text-[#8C8983] hover:text-[#15171A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Mic size={16} />
          </button>

          <button
            type="button"
            title="Observe"
            onClick={() => {
              if (query.trim()) {
                if (onSubmit) onSubmit(query);
                else if (onSelectTab) onSelectTab("image-analysis");
              } else if (onSelectTab) {
                onSelectTab("image-analysis");
              }
            }}
            className="w-9 h-9 rounded-xl bg-[#15171A] hover:bg-[#25282C] text-[#F7F4EE] flex items-center justify-center transition shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
