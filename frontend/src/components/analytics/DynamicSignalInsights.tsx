import React from "react";
import { Sparkles, ArrowRight, Compass, ShieldCheck, HelpCircle } from "lucide-react";

interface InsightItem {
  id: string;
  category: "trend" | "pattern" | "quality" | "action";
  title: string;
  observation: string;
  supportingData: string;
  sampleSize: number;
  dateRange: string;
  metric: string;
  dataStrength: "High" | "Moderate" | "Preliminary";
  limitations: string;
  recommendedAction?: {
    label: string;
    path: string;
  };
}

interface DynamicSignalInsightsProps {
  insights: InsightItem[];
  onSelectInsight: (insight: InsightItem) => void;
  onNavigate: (path: string) => void;
}

export const DynamicSignalInsights: React.FC<DynamicSignalInsightsProps> = ({
  insights,
  onSelectInsight,
  onNavigate,
}) => {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DDD7CB] shadow-2xs space-y-5 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#A855F7]" />
            <h3 className="font-serif text-lg font-bold text-[#15171A]">
              Dynamic Signal Insights
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#8C8983]">
            {insights.length} Synthesized Patterns
          </span>
        </div>

        {/* Insight Cards List */}
        <div className="space-y-3.5">
          {insights.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8C8983]">
              No active patterns detected for this timeframe.
            </div>
          ) : (
            insights.map((ins) => (
              <div
                key={ins.id}
                onClick={() => onSelectInsight(ins)}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] transition space-y-2 cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#15171A] group-hover:text-[#10B981] transition line-clamp-1">
                    {ins.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white border border-[#DDD7CB] text-[#8C8983] shrink-0">
                    {ins.metric}
                  </span>
                </div>

                <p className="text-[11px] text-[#575A60] leading-relaxed line-clamp-2">
                  {ins.observation}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#DDD7CB]/60 text-[10px] font-mono text-[#8C8983]">
                  <span>Based on {ins.sampleSize} sessions</span>
                  <span className="text-[#15171A] font-medium group-hover:underline flex items-center gap-1">
                    <span>View Details</span>
                    <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Link to History */}
      <div className="pt-3 border-t border-[#F0EDE6]">
        <button
          type="button"
          onClick={() => onNavigate("/history")}
          className="w-full py-2.5 rounded-xl bg-[#15171A] hover:bg-[#2B2E33] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
        >
          <span>Explore All History Records</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
