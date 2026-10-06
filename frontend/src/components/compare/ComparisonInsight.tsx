import React from "react";
import { Sparkles, Compass } from "lucide-react";

interface ComparisonInsightProps {
  insight: string;
}

export const ComparisonInsight: React.FC<ComparisonInsightProps> = ({ insight }) => {
  if (!insight) return null;

  return (
    <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-2 shadow-2xs">
      <div className="flex items-center gap-2">
        <Compass size={16} className="text-[#10B981]" />
        <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-[#15171A]">
          Comparison Insight
        </h4>
      </div>
      <p className="font-serif text-base sm:text-lg text-[#15171A] leading-relaxed">
        "{insight}"
      </p>
      <p className="text-[11px] text-[#8C8983]">
        Synthesized from measurable delta distributions across visual, acoustic, and postural channels.
      </p>
    </div>
  );
};
