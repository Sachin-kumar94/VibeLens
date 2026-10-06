import React from "react";
import { ArrowLeftRight, History, RotateCcw } from "lucide-react";

interface ComparisonHeaderProps {
  onOpenHistory: () => void;
  onSwapSessions: () => void;
  onReset: () => void;
  canSwap: boolean;
  hasSelection: boolean;
}

export const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({
  onOpenHistory,
  onSwapSessions,
  onReset,
  canSwap,
  hasSelection,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#DDD7CB] gap-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#15171A]" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C8983]">
            SIDE-BY-SIDE SIGNAL COMPARISON
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#15171A] tracking-tight">
          Compare your sessions
        </h1>
        <p className="text-sm sm:text-base text-[#575A60] mt-2 max-w-xl">
          See how your visual, vocal and behavioral signals changed between two moments.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {canSwap && (
          <button
            type="button"
            onClick={onSwapSessions}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:bg-[#F2ECE1]"
            title="Swap Moment A and Moment B"
          >
            <ArrowLeftRight size={13} className="text-[#8C8983]" />
            <span>↔ Swap A & B</span>
          </button>
        )}

        {hasSelection && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-xl bg-transparent border border-transparent hover:border-[#DDD7CB] text-xs font-medium text-[#707582] hover:text-[#15171A] transition flex items-center gap-1.5 cursor-pointer"
            title="Reset selected comparison"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenHistory}
          className="px-4 py-2.5 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <History size={14} className="text-[#10B981]" />
          <span>Select from History</span>
        </button>
      </div>
    </div>
  );
};
