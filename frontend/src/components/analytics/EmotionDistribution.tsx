import React from "react";
import { Smile, Heart } from "lucide-react";

interface EmotionItem {
  emotion: string;
  count: number;
  percentage: number;
}

interface EmotionDistributionProps {
  emotions: EmotionItem[];
  totalAnalyses: number;
}

export const EmotionDistribution: React.FC<EmotionDistributionProps> = ({
  emotions,
  totalAnalyses,
}) => {
  const getEmotionColor = (emotion: string) => {
    const e = emotion.toLowerCase();
    if (e.includes("calm") || e.includes("serene")) return "#10B981";
    if (e.includes("focus") || e.includes("attentive")) return "#3B82F6";
    if (e.includes("happ") || e.includes("joy")) return "#F59E0B";
    if (e.includes("neutr") || e.includes("ground")) return "#8C8983";
    if (e.includes("confid") || e.includes("assert")) return "#A855F7";
    return "#64748B";
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DDD7CB] shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EDE6]">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#15171A]">
            Estimated Emotion Distribution
          </h3>
          <p className="text-xs text-[#575A60] mt-0.5">
            Based on {totalAnalyses} saved analyses in the selected timeframe.
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#8C8983] uppercase">
          Dominant Affect Telemetry
        </span>
      </div>

      {emotions.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8C8983]">
          No emotion signals detected yet. Complete a scan to populate.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Segmented Color Bar */}
          <div className="w-full h-3 rounded-full bg-[#FAF8F5] border border-[#DDD7CB] overflow-hidden flex">
            {emotions.map((item) => (
              <div
                key={item.emotion}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: getEmotionColor(item.emotion),
                }}
                title={`${item.emotion}: ${item.percentage}% (${item.count})`}
                className="h-full transition-all duration-300"
              />
            ))}
          </div>

          {/* Emotion Items Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {emotions.map((item) => {
              const color = getEmotionColor(item.emotion);
              return (
                <div
                  key={item.emotion}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-bold text-[#15171A] truncate">
                      {item.emotion}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                    <span className="text-[#8C8983]">{item.count} sessions</span>
                    <span className="font-bold text-[#15171A]">{item.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
