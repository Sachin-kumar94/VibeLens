import React from "react";
import { ShieldCheck, Cpu, AlertCircle, Info } from "lucide-react";

interface SignalQualityProps {
  signalQuality: "Good" | "Fair" | "Poor";
  signalQualityScore: number;
  signalQualityReasons: string[];
  aiConfidence: number;
}

export const SignalQuality: React.FC<SignalQualityProps> = ({
  signalQuality,
  signalQualityScore,
  signalQualityReasons,
  aiConfidence,
}) => {
  const getQualityBadgeColor = () => {
    if (signalQuality === "Good") return "text-[#30483E] bg-[#EBF3EE] border-[#C8DFD2]";
    if (signalQuality === "Fair") return "text-[#91672C] bg-[#FDF8EC] border-[#F2DEB0]";
    return "text-[#C23B22] bg-[#FDF2F0] border-[#F5C2BC]";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 select-none">
      {/* 1. Hardware / Signal Quality Card */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD8CD] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#17191A]">
            <ShieldCheck size={14} className="text-[#30483E]" />
            <span>Input Signal Quality</span>
          </div>
          <span
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${getQualityBadgeColor()}`}
          >
            {signalQuality} ({signalQualityScore}%)
          </span>
        </div>

        <div className="space-y-1 pt-1">
          {signalQualityReasons.map((reason, idx) => (
            <div key={idx} className="text-[11px] text-[#555A58] flex items-start gap-1.5 leading-tight">
              <span className="text-[#858881]">&bull;</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Model Confidence Card */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD8CD] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#17191A]">
            <Cpu size={14} className="text-[#A97858]" />
            <span>AI Model Confidence</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#17191A] bg-white px-2 py-0.5 rounded-full border border-[#DDD8CD]">
            {aiConfidence}% Strong
          </span>
        </div>

        <p className="text-[11px] text-[#555A58] leading-relaxed pt-1">
          Indicates internal tensor agreement across landmark vectors and semantic visual embeddings.
        </p>
      </div>
    </div>
  );
};
