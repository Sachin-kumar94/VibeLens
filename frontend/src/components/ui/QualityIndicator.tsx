import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface QualityIndicatorProps {
  rating: "Good" | "Fair" | "Poor";
  details?: {
    lighting?: string;
    noiseLevel?: string;
    faceVisibility?: string;
    framing?: string;
  };
  className?: string;
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({
  rating,
  details,
  className = "",
}) => {
  const configs = {
    Good: {
      color: "text-[#34D399]",
      bg: "bg-[#34D399]/10",
      border: "border-[#34D399]/30",
      icon: CheckCircle2,
      label: "Signal Quality: Optimal",
    },
    Fair: {
      color: "text-[#FBBF24]",
      bg: "bg-[#FBBF24]/10",
      border: "border-[#FBBF24]/30",
      icon: AlertTriangle,
      label: "Signal Quality: Moderate",
    },
    Poor: {
      color: "text-[#F87171]",
      bg: "bg-[#F87171]/10",
      border: "border-[#F87171]/30",
      icon: AlertCircle,
      label: "Signal Quality: Constrained",
    },
  };

  const config = configs[rating] || configs.Good;
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-xl border ${config.bg} ${config.border} space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={config.color} />
          <span className={`text-xs font-mono font-bold tracking-wide ${config.color}`}>
            {config.label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#B8B7BF] uppercase">Pre-check</span>
      </div>

      {details && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06] text-[11px] font-mono text-[#B8B7BF]">
          {details.lighting && (
            <div>
              Lighting: <span className="text-[#F4F1EA]">{details.lighting}</span>
            </div>
          )}
          {details.faceVisibility && (
            <div>
              Face: <span className="text-[#F4F1EA]">{details.faceVisibility}</span>
            </div>
          )}
          {details.noiseLevel && (
            <div>
              Noise: <span className="text-[#F4F1EA]">{details.noiseLevel}</span>
            </div>
          )}
          {details.framing && (
            <div>
              Framing: <span className="text-[#F4F1EA]">{details.framing}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
