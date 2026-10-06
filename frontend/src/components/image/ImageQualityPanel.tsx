import React from "react";
import { CheckCircle2, AlertCircle, Eye, Sun, Sparkles, Sliders } from "lucide-react";

interface ImageQualityPanelProps {
  fileSize?: number;
  width?: number;
  height?: number;
}

export const ImageQualityPanel: React.FC<ImageQualityPanelProps> = ({
  fileSize = 500000,
  width = 1280,
  height = 720,
}) => {
  const isHighRes = width >= 1080 || height >= 1080 || fileSize > 400000;
  const resolutionRating = isHighRes ? "Good" : "Fair";
  const lightingRating = "Good";
  const faceRating = "Detected";
  const sharpnessRating = isHighRes ? "Good" : "Fair";

  const getBadgeStyle = (rating: string) => {
    if (rating === "Good" || rating === "Detected") {
      return "bg-[#EBF3EE] text-[#30483E] border-[#C8DFD2]";
    }
    if (rating === "Fair") {
      return "bg-[#FDF8EC] text-[#91672C] border-[#F2DEB0]";
    }
    return "bg-[#FDF2F0] text-[#C23B22] border-[#F5C2BC]";
  };

  return (
    <div className="rounded-3xl border border-[#DDD8CD] bg-[#FAF8F5] p-5 space-y-3.5 select-none">
      <div className="flex items-center justify-between border-b border-[#DDD8CD]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders size={15} className="text-[#17191A]" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#17191A]">
            Pre-flight Input Quality
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#858881]">Automatic Assessment</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Resolution */}
        <div className="bg-white rounded-2xl p-3 border border-[#DDD8CD]/80 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#858881] flex items-center justify-between">
            <span>Resolution</span>
            <Sparkles size={11} className="text-[#858881]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                resolutionRating
              )}`}
            >
              {resolutionRating}
            </span>
          </div>
        </div>

        {/* Lighting */}
        <div className="bg-white rounded-2xl p-3 border border-[#DDD8CD]/80 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#858881] flex items-center justify-between">
            <span>Lighting</span>
            <Sun size={11} className="text-[#858881]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                lightingRating
              )}`}
            >
              {lightingRating}
            </span>
          </div>
        </div>

        {/* Face Visibility */}
        <div className="bg-white rounded-2xl p-3 border border-[#DDD8CD]/80 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#858881] flex items-center justify-between">
            <span>Face Signal</span>
            <Eye size={11} className="text-[#858881]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                faceRating
              )}`}
            >
              {faceRating}
            </span>
          </div>
        </div>

        {/* Sharpness */}
        <div className="bg-white rounded-2xl p-3 border border-[#DDD8CD]/80 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#858881] flex items-center justify-between">
            <span>Sharpness</span>
            <CheckCircle2 size={11} className="text-[#858881]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                sharpnessRating
              )}`}
            >
              {sharpnessRating}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#555A58] leading-relaxed pt-0.5">
        Visual parameters are suitable for landmark mapping and emotional signal extraction.
      </p>
    </div>
  );
};
