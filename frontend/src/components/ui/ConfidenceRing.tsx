import React from "react";

interface ConfidenceRingProps {
  score: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  color?: "violet" | "blue" | "cyan" | "warm";
  label?: string;
  showPercent?: boolean;
}

export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
  score,
  size = 56,
  strokeWidth = 3.5,
  color = "violet",
  label,
  showPercent = true,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const colorMap = {
    violet: "#7C5CFC",
    blue: "#4FA7FF",
    cyan: "#56D9E8",
    warm: "#E8A46B",
  };

  const strokeColor = colorMap[color];

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {showPercent && (
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#F4F1EA]">
            {normalizedScore}%
          </div>
        )}
      </div>
      {label && <span className="text-[10px] font-mono text-[#B8B7BF] uppercase tracking-wider">{label}</span>}
    </div>
  );
};
