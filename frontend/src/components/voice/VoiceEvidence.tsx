import React from "react";
import { HelpCircle, Check, ShieldCheck, Sparkles } from "lucide-react";

interface VoiceEvidenceProps {
  evidence: {
    observedSignals: string[];
    aiInterpretation: string;
    confidenceRationale: string;
    whyThisResult: string;
  };
  confidence: number;
  signalQualityScore: number;
}

export const VoiceEvidence: React.FC<VoiceEvidenceProps> = ({
  evidence,
  confidence,
  signalQualityScore,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-2.5">
        <h4 className="font-bold text-[#15171A] uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5">
          <HelpCircle size={14} className="text-[#15171A]" />
          <span>Why This Result?</span>
        </h4>
        <span className="text-[10px] text-[#8C8983] font-mono">Evidence & Transparency</span>
      </div>

      {/* Observed vocal signals */}
      <div className="space-y-2">
        <span className="text-[#707582] font-semibold text-[11px] uppercase tracking-wider block">
          Observed Vocal Signals
        </span>
        <ul className="space-y-1.5">
          {evidence.observedSignals.map((signal, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[#575A60] leading-relaxed">
              <span className="w-4 h-4 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Careful interpretation statement */}
      <div className="p-3 rounded-xl bg-white border border-[#E8E4DA] text-[#15171A] leading-relaxed italic">
        &ldquo;{evidence.aiInterpretation}&rdquo;
      </div>

      <p className="text-[11px] text-[#707582] leading-relaxed">
        {evidence.whyThisResult}
      </p>

      {/* Confidence vs Quality breakdown */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E4DA]">
        <div className="p-2.5 rounded-xl bg-white border border-[#E8E4DA] space-y-0.5">
          <div className="flex items-center gap-1 text-[#8C8983] text-[10px] uppercase font-mono">
            <Sparkles size={11} className="text-[#A855F7]" />
            <span>AI Confidence</span>
          </div>
          <span className="text-sm font-bold font-mono text-[#15171A]">{confidence}%</span>
          <p className="text-[10px] text-[#8C8983] leading-tight">
            How strongly the model supports this interpretation based on learned prosody patterns.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-[#E8E4DA] space-y-0.5">
          <div className="flex items-center gap-1 text-[#8C8983] text-[10px] uppercase font-mono">
            <ShieldCheck size={11} className="text-[#10B981]" />
            <span>Signal Quality</span>
          </div>
          <span className="text-sm font-bold font-mono text-[#059669]">{signalQualityScore}%</span>
          <p className="text-[10px] text-[#8C8983] leading-tight">
            Microphone input clarity, low background noise, and dynamic vocal headroom.
          </p>
        </div>
      </div>
    </div>
  );
};
