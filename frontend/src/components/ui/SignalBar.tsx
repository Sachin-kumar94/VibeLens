import React from "react";

interface SignalBarProps {
  label: string;
  value: number; // 0 - 100
  color?: "violet" | "blue" | "cyan" | "warm" | "pink";
  showValue?: boolean;
  unit?: string;
  className?: string;
}

export const SignalBar: React.FC<SignalBarProps> = ({
  label,
  value,
  color = "violet",
  showValue = true,
  unit = "%",
  className = "",
}) => {
  const normalized = Math.min(100, Math.max(0, value));

  const colors = {
    violet: "bg-[#7C5CFC]",
    blue: "bg-[#4FA7FF]",
    cyan: "bg-[#56D9E8]",
    warm: "bg-[#E8A46B]",
    pink: "bg-[#E77BB7]",
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#B8B7BF] font-medium">{label}</span>
        {showValue && (
          <span className="font-mono font-bold text-[#F4F1EA]">
            {normalized}
            {unit}
          </span>
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};
