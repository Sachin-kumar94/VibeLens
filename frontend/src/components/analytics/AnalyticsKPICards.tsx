import React from "react";
import {
  TrendingUp,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Layers,
  Heart,
  Compass,
} from "lucide-react";

interface AnalyticsKPICardsProps {
  summary: {
    totalAnalyses: number;
    totalAnalysesDelta: number;
    totalAnalysesDeltaPercent: number;
    averageConfidence: number | null;
    confidenceDelta: number;
    topEmotion: string;
    topEmotionCount: number;
    topEmotionPercentage: number;
    topVibe: string;
    topVibeCount: number;
    topVibePercentage: number;
  };
  onNavigate: (path: string) => void;
  onScrollToEmotion?: () => void;
}

export const AnalyticsKPICards: React.FC<AnalyticsKPICardsProps> = ({
  summary,
  onNavigate,
  onScrollToEmotion,
}) => {
  const {
    totalAnalyses,
    totalAnalysesDelta,
    averageConfidence,
    confidenceDelta,
    topEmotion,
    topEmotionPercentage,
    topVibe,
    topVibePercentage,
  } = summary;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Total Analyses */}
      <div
        onClick={() => onNavigate("/history")}
        className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DDD7CB] shadow-2xs hover:border-[#8C8983] transition space-y-2 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C8983] block">
            Total Analyses
          </span>
          <div className="relative group/tooltip">
            <Info size={13} className="text-[#8C8983] hover:text-[#15171A]" />
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover/tooltip:block w-48 p-2 rounded-lg bg-[#15171A] text-white text-[10px] leading-tight z-20 shadow-md">
              Total number of recorded sessions in the selected timeframe. Click to view history archive.
            </div>
          </div>
        </div>

        <div className="font-serif text-3xl sm:text-4xl font-bold text-[#15171A] tracking-tight">
          {totalAnalyses}
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-[#575A60]">
          {totalAnalysesDelta > 0 ? (
            <span className="text-[#10B981] flex items-center font-bold">
              <ArrowUpRight size={13} /> +{totalAnalysesDelta}
            </span>
          ) : totalAnalysesDelta < 0 ? (
            <span className="text-rose-600 flex items-center font-bold">
              <ArrowDownRight size={13} /> {totalAnalysesDelta}
            </span>
          ) : (
            <span className="text-[#8C8983] flex items-center">
              <Minus size={13} /> 0
            </span>
          )}
          <span>vs previous period</span>
        </div>
      </div>

      {/* 2. Average Confidence */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DDD7CB] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C8983] block">
            Avg. Confidence
          </span>
          <div className="relative group/tooltip">
            <Info size={13} className="text-[#8C8983] hover:text-[#15171A]" />
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover/tooltip:block w-52 p-2 rounded-lg bg-[#15171A] text-white text-[10px] leading-tight z-20 shadow-md">
              Arithmetic mean of estimated signal confidence scores across all valid sessions in this period.
            </div>
          </div>
        </div>

        <div className="font-serif text-3xl sm:text-4xl font-bold text-[#10B981] tracking-tight">
          {averageConfidence !== null ? `${averageConfidence}%` : "Not enough data"}
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-[#575A60]">
          {confidenceDelta > 0 ? (
            <span className="text-[#10B981] flex items-center font-bold">
              <ArrowUpRight size={13} /> +{confidenceDelta} pp
            </span>
          ) : confidenceDelta < 0 ? (
            <span className="text-rose-600 flex items-center font-bold">
              <ArrowDownRight size={13} /> {confidenceDelta} pp
            </span>
          ) : (
            <span className="text-[#8C8983] flex items-center">
              <Minus size={13} /> 0 pp
            </span>
          )}
          <span>vs prior period</span>
        </div>
      </div>

      {/* 3. Top Emotion */}
      <div
        onClick={onScrollToEmotion}
        className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DDD7CB] shadow-2xs hover:border-[#8C8983] transition space-y-2 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C8983] block">
            Top Emotion
          </span>
          <div className="relative group/tooltip">
            <Info size={13} className="text-[#8C8983] hover:text-[#15171A]" />
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover/tooltip:block w-48 p-2 rounded-lg bg-[#15171A] text-white text-[10px] leading-tight z-20 shadow-md">
              Most frequently detected emotional affect signal across active captures in this window.
            </div>
          </div>
        </div>

        <div className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A] tracking-tight truncate">
          {topEmotion !== "None" ? topEmotion : "No data"}
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#575A60]">
          {topEmotionPercentage > 0 ? (
            <span>
              Observed in <strong className="font-mono text-[#15171A]">{topEmotionPercentage}%</strong> of sessions
            </span>
          ) : (
            <span>Awaiting session data</span>
          )}
        </div>
      </div>

      {/* 4. Top Vibe */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DDD7CB] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C8983] block">
            Top Vibe
          </span>
          <div className="relative group/tooltip">
            <Info size={13} className="text-[#8C8983] hover:text-[#15171A]" />
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover/tooltip:block w-48 p-2 rounded-lg bg-[#15171A] text-white text-[10px] leading-tight z-20 shadow-md">
              Dominant composite presence descriptor extracted from cross-modal telemetry.
            </div>
          </div>
        </div>

        <div className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A] tracking-tight truncate">
          {topVibe !== "None" ? topVibe : "No data"}
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#575A60]">
          {topVibePercentage > 0 ? (
            <span>
              Primary presence in <strong className="font-mono text-[#15171A]">{topVibePercentage}%</strong>
            </span>
          ) : (
            <span>Awaiting baseline calibration</span>
          )}
        </div>
      </div>
    </div>
  );
};
