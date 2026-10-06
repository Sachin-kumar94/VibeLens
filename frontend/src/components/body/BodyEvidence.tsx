import React from "react";
import { CheckCircle2, ShieldCheck, Eye, Activity, Sparkles, HelpCircle } from "lucide-react";
import { BodyAnalysisResponse } from "../../services/bodyAnalysisApi";

interface BodyEvidenceProps {
  evidence: BodyAnalysisResponse["evidence"];
  signalQuality: BodyAnalysisResponse["signalQuality"];
}

export const BodyEvidence: React.FC<BodyEvidenceProps> = ({ evidence, signalQuality }) => {
  return (
    <div className="space-y-6">
      {/* Evidence Summary Header */}
      <div>
        <h4 className="text-sm font-bold text-[#15171A] flex items-center gap-2">
          <Sparkles size={15} className="text-emerald-600" />
          <span>Why this result?</span>
        </h4>
        <p className="text-xs text-[#707582] mt-0.5">
          Observable anatomical signals and kinematic coordinates measured during analysis.
        </p>
      </div>

      {/* Key Triangulation Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {evidence.keyPoints?.map((pt, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-1">
            <span className="text-[11px] font-medium text-[#707582] block">{pt.label}</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#15171A]">{pt.value}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  pt.status === "optimal"
                    ? "bg-emerald-500"
                    : pt.status === "acceptable"
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Observed Anatomical Signals List */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-3">
        <span className="text-xs font-semibold text-[#15171A] block">Observed Movement Signals</span>
        <ul className="space-y-2 text-xs text-[#575A60]">
          {evidence.observedSignals?.map((sig, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{sig}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Technical Quality & Visibility Context */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] space-y-3">
        <span className="text-xs font-semibold text-[#15171A] block">Technical Quality Parameters</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-[#8C8983] block">Framing</span>
            <span className="font-medium text-[#15171A]">{signalQuality.framing}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8C8983] block">Person Visibility</span>
            <span className="font-medium text-[#15171A]">{signalQuality.personVisibility}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8C8983] block">Lighting</span>
            <span className="font-medium text-[#15171A]">{signalQuality.lighting}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8C8983] block">Signal Score</span>
            <span className="font-mono font-semibold text-emerald-700">{signalQuality.score}%</span>
          </div>
        </div>
      </div>

      {/* Non-Medical Disclaimer Banner */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <HelpCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
        <span>
          VibeLens evaluates observable non-verbal communication and presentation posture. It does not provide medical posture assessment, orthopedic evaluation, or psychological diagnoses.
        </span>
      </div>
    </div>
  );
};
