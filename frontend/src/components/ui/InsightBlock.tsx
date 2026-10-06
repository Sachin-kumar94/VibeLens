import React from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";

export interface InsightBlockProps {
  category?: string;
  title: string;
  quote: string;
  actionTip?: string;
  deltaPercent?: number;
  metric?: string;
  onExplore?: () => void;
  className?: string;
}

export const InsightBlock: React.FC<InsightBlockProps> = ({
  category = "Equilibrium",
  title,
  quote,
  actionTip,
  deltaPercent,
  metric,
  onExplore,
  className = "",
}) => {
  return (
    <div
      className={`p-6 rounded-2xl bg-white border border-[#DDD7CB] space-y-4 shadow-2xs text-left ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#786D9D]/15 text-[#786D9D] flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-[#17191A]">{title}</h4>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#81827D] block">
              {category}
            </span>
          </div>
        </div>
        {deltaPercent !== undefined && (
          <span className="text-[11px] font-mono text-[#748C78] bg-[#748C78]/10 px-2.5 py-0.5 rounded-full border border-[#748C78]/20 font-semibold">
            {deltaPercent >= 0 ? `+${deltaPercent}%` : `${deltaPercent}%`} {metric || "Shift"}
          </span>
        )}
      </div>

      <blockquote className="font-serif italic text-sm text-[#17191A] leading-relaxed border-l-2 border-[#786D9D]/40 pl-3.5">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {actionTip && (
        <div className="pt-2 border-t border-[#F0EDE6] text-xs text-[#81827D] flex items-start gap-2">
          <span className="font-semibold text-[#17191A] shrink-0">Action Tip:</span>
          <span className="leading-relaxed">{actionTip}</span>
        </div>
      )}

      {onExplore && (
        <button
          type="button"
          onClick={onExplore}
          className="text-xs font-semibold text-[#17191A] hover:text-[#748C78] flex items-center gap-1 transition cursor-pointer"
        >
          <span>Deepen insight</span>
          <ArrowUpRight size={13} />
        </button>
      )}
    </div>
  );
};
