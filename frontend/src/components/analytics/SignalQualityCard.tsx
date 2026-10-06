import React from "react";
import { ShieldCheck, Camera, Mic, Activity, Layers } from "lucide-react";

interface SignalQualityCardProps {
  signalQuality: {
    overallScore: number;
    overallRating: "Good" | "Fair" | "Poor";
    byModality: Record<string, { score: number; rating: string; count: number }>;
  };
}

export const SignalQualityCard: React.FC<SignalQualityCardProps> = ({ signalQuality }) => {
  const { overallScore, overallRating, byModality } = signalQuality;

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case "Good":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Fair":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-rose-50 text-rose-800 border-rose-200";
    }
  };

  const getModalityIcon = (mod: string) => {
    switch (mod) {
      case "image":
        return <Camera size={13} className="text-[#3B82F6]" />;
      case "voice":
        return <Mic size={13} className="text-[#10B981]" />;
      case "body":
        return <Activity size={13} className="text-[#F59E0B]" />;
      case "fusion":
        return <Layers size={13} className="text-[#A855F7]" />;
      default:
        return <ShieldCheck size={13} />;
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DDD7CB] shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#15171A]">
            Signal Quality & Capture Integrity
          </h3>
          <p className="text-xs text-[#575A60] mt-0.5">
            Sensor telemetry rating based on lighting, acoustic noise floor, and landmark visibility.
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${getRatingBadge(
            overallRating
          )}`}
        >
          {overallRating} ({overallScore}%)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["image", "voice", "body", "fusion"].map((mod) => {
          const data = byModality[mod];
          const label =
            mod === "image"
              ? "Image Lighting"
              : mod === "voice"
              ? "Acoustic Clarity"
              : mod === "body"
              ? "Pose Visibility"
              : "Fusion Consistency";

          return (
            <div
              key={mod}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#8C8983]">
                {getModalityIcon(mod)}
                <span className="truncate">{mod}</span>
              </div>

              {data ? (
                <div>
                  <div className="font-serif text-lg font-bold text-[#15171A]">
                    {data.score}%
                  </div>
                  <span className="text-[10px] text-[#575A60] font-mono block">
                    {data.rating} quality • {data.count} scans
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-[#8C8983] italic pt-1">
                  No sessions yet
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
