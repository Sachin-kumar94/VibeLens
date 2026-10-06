import React from "react";

interface EmotionItem {
  emotion: string;
  score: number;
  label?: string;
}

interface EmotionBreakdownProps {
  emotions: EmotionItem[];
}

export const EmotionBreakdown: React.FC<EmotionBreakdownProps> = ({ emotions }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[#15171A] uppercase tracking-wider font-mono">
          Emotion Distribution
        </h4>
        <span className="text-[10px] text-[#8C8983] font-mono">Relative Signals</span>
      </div>

      <div className="space-y-2.5">
        {emotions.map((item, idx) => {
          // Subtle color accent based on dominant vs secondary
          const isPrimary = idx === 0;
          return (
            <div key={item.emotion} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`${
                    isPrimary ? "font-bold text-[#15171A]" : "font-medium text-[#575A60]"
                  }`}
                >
                  {item.emotion}
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#15171A]">
                  {item.score}%
                </span>
              </div>

              <div className="h-2 w-full bg-[#F4F1EA] rounded-full overflow-hidden border border-[#EFEAE1]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPrimary ? "bg-[#10B981]" : "bg-[#94A3B8]"
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>

              {item.label && (
                <p className="text-[10px] text-[#8C8983] truncate">{item.label}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
