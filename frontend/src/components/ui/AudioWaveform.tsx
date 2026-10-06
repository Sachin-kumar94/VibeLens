import React from "react";

interface AudioWaveformProps {
  isActive?: boolean;
  barCount?: number;
  height?: number;
  color?: "blue" | "cyan" | "violet";
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive = true,
  barCount = 36,
  height = 40,
  color = "blue",
  className = "",
}) => {
  const colorMap = {
    blue: "bg-[#4FA7FF]",
    cyan: "bg-[#56D9E8]",
    violet: "bg-[#7C5CFC]",
  };

  // Pre-generate deterministic varied heights
  const bars = Array.from({ length: barCount }, (_, i) => {
    const sin = Math.sin((i / barCount) * Math.PI * 2);
    const cos = Math.cos((i / barCount) * Math.PI * 4);
    const base = 0.2 + 0.6 * Math.abs(sin * 0.7 + cos * 0.3);
    return Math.max(0.15, Math.min(1.0, base));
  });

  return (
    <div className={`flex items-center gap-[3px] select-none ${className}`} style={{ height }}>
      {bars.map((factor, idx) => (
        <div
          key={idx}
          className={`w-[3px] rounded-full transition-all duration-300 ${colorMap[color]}`}
          style={{
            height: isActive ? `${factor * height}px` : "4px",
            opacity: isActive ? 0.4 + factor * 0.6 : 0.2,
            animation: isActive
              ? `wavePulse ${1.2 + (idx % 5) * 0.2}s ease-in-out infinite alternate ${
                  (idx % 7) * 0.1
                }s`
              : "none",
          }}
        />
      ))}
    </div>
  );
};
