import React from "react";
import { TrendingUp, ArrowRight, ShieldAlert, Sparkles, Scale, Info, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface ComparisonSummaryProps {
  summary: {
    mainChange: string;
    confidenceDelta: number;
    confidenceDeltaFormatted: string;
    signalQualityDelta: number;
    signalQualityDeltaFormatted: string;
    contextComparison: string;
    dateComparison: string;
    vibeProgression: string;
    comparisonQuality: "High comparability" | "Moderate comparability" | "Limited comparability";
    comparisonQualityExplanation: string;
  };
  sessionA: {
    title: string;
    confidence: number;
    signalQuality: number;
    vibe: string;
    type: string;
  };
  sessionB: {
    title: string;
    confidence: number;
    signalQuality: number;
    vibe: string;
    type: string;
  };
}

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({
  summary,
  sessionA,
  sessionB,
}) => {
  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case "High comparability":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Moderate comparability":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-300";
    }
  };

  const isConfidencePositive = summary.confidenceDelta > 0;
  const isConfidenceZero = summary.confidenceDelta === 0;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDD7CB] space-y-6 shadow-xs">
      {/* Header with Title and Comparability Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0EDE6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#8C8983]">
              Session Delta Synthesis
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#15171A]">
            Comparison Summary
          </h2>
          <p className="text-xs text-[#575A60] mt-0.5">
            Mathematical delta calculated between Moment B (Baseline) and Moment A (Target).
          </p>
        </div>

        {/* Comparability indicator (Section 40 & 41) */}
        <div className="flex flex-col sm:items-end">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-mono uppercase font-bold px-2.5 py-1 rounded-md border ${getQualityBadgeColor(
                summary.comparisonQuality
              )}`}
            >
              {summary.comparisonQuality}
            </span>
          </div>
          <p className="text-[10px] text-[#8C8983] mt-1 max-w-[220px] sm:text-right">
            {summary.comparisonQualityExplanation}
          </p>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Confidence Delta (Clear Percentage Points notation) */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983] block">
              Confidence Shift
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-sm font-mono text-[#707582]">{sessionB.confidence}%</span>
              <ArrowRight size={12} className="text-[#8C8983]" />
              <span className="text-lg font-mono font-bold text-[#15171A]">{sessionA.confidence}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DDD7CB]/70 flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#575A60]">Net Delta:</span>
            <div className="flex items-center gap-1">
              {isConfidencePositive ? (
                <ArrowUpRight size={14} className="text-[#10B981]" />
              ) : isConfidenceZero ? (
                <Minus size={14} className="text-[#8C8983]" />
              ) : (
                <ArrowDownRight size={14} className="text-rose-600" />
              )}
              <span
                className={`text-sm font-serif font-bold ${
                  isConfidencePositive
                    ? "text-[#10B981]"
                    : isConfidenceZero
                    ? "text-[#575A60]"
                    : "text-rose-600"
                }`}
              >
                {summary.confidenceDeltaFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Signal Quality Delta */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983] block">
              Signal Quality
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-sm font-mono text-[#707582]">{sessionB.signalQuality}%</span>
              <ArrowRight size={12} className="text-[#8C8983]" />
              <span className="text-lg font-mono font-bold text-[#15171A]">{sessionA.signalQuality}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DDD7CB]/70 flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#575A60]">Integrity:</span>
            <span className="text-sm font-serif font-bold text-[#15171A]">
              {summary.signalQualityDeltaFormatted}
            </span>
          </div>
        </div>

        {/* 3. Vibe Progression */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983] block">
              Vibe Progression
            </span>
            <div className="text-sm font-serif font-bold text-[#15171A] mt-2">
              {summary.vibeProgression}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DDD7CB]/70 flex items-center justify-between text-[11px] text-[#575A60]">
            <span>Primary affect:</span>
            <span className="font-semibold text-[#15171A]">{sessionA.vibe}</span>
          </div>
        </div>

        {/* 4. Context & Timeline */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983] block">
              Context & Date
            </span>
            <div className="text-xs font-semibold text-[#15171A] mt-1.5 line-clamp-2">
              {summary.contextComparison}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DDD7CB]/70 text-[11px] text-[#575A60]">
            <span>Timeline: </span>
            <span className="font-mono text-[#15171A]">{summary.dateComparison}</span>
          </div>
        </div>
      </div>

      {/* Main Change Banner (Section 42) */}
      <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#DDD7CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles size={16} className="text-[#A855F7] shrink-0" />
          <div>
            <span className="font-bold text-[#15171A]">Core Observed Change: </span>
            <span className="text-[#575A60]">{summary.mainChange}</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-[#8C8983] shrink-0">
          Comparing {sessionB.type} (B) → {sessionA.type} (A)
        </div>
      </div>
    </div>
  );
};
