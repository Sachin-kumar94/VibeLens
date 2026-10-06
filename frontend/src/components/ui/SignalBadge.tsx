import React from "react";

export type SignalType = "image" | "voice" | "body" | "fusion" | "insight" | "neutral";

interface SignalBadgeProps {
  type: SignalType;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({
  type,
  label,
  size = "md",
  className = "",
}) => {
  const configs: Record<SignalType, { bg: string; text: string; border: string; defaultLabel: string }> = {
    image: {
      bg: "bg-[#7C5CFC]/15",
      text: "text-[#7C5CFC]",
      border: "border-[#7C5CFC]/30",
      defaultLabel: "Visual Signal",
    },
    voice: {
      bg: "bg-[#4FA7FF]/15",
      text: "text-[#4FA7FF]",
      border: "border-[#4FA7FF]/30",
      defaultLabel: "Acoustic Signal",
    },
    body: {
      bg: "bg-[#56D9E8]/15",
      text: "text-[#56D9E8]",
      border: "border-[#56D9E8]/30",
      defaultLabel: "Kinesic Signal",
    },
    fusion: {
      bg: "bg-gradient-to-r from-[#7C5CFC]/20 to-[#56D9E8]/20",
      text: "text-[#F4F1EA]",
      border: "border-[#7C5CFC]/40",
      defaultLabel: "Multimodal Fusion",
    },
    insight: {
      bg: "bg-[#E8A46B]/15",
      text: "text-[#E8A46B]",
      border: "border-[#E8A46B]/30",
      defaultLabel: "Behavioral Insight",
    },
    neutral: {
      bg: "bg-white/[0.06]",
      text: "text-[#B8B7BF]",
      border: "border-white/[0.12]",
      defaultLabel: "Signal",
    },
  };

  const config = configs[type] || configs.neutral;
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-wide ${config.bg} ${config.text} ${config.border} ${padding} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace("text-", "bg-")}`} />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
