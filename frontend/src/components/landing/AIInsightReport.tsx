import React from "react";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

export const AIInsightReport: React.FC = () => {
  return (
    <section className="py-24 bg-[#F5F1E8] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            Read like an executive report.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            No synthetic theatrical displays. Findings are presented with clarity,
            structured evidence, and responsible confidence bounds.
          </p>
        </div>

        {/* Professional Editorial Report Card */}
        <div className="max-w-4xl mx-auto bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 sm:p-12 shadow-[0_2px_12px_rgba(21,23,26,0.03)] font-sans space-y-8">
          
          {/* Report Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#E6E1D6] pb-6 gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C8983]">
                Observation Report #8492-B
              </div>
              <h3 className="font-serif text-2xl text-[#15171A] mt-1">
                Moment Analysis Synthesis
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#8C8983]">Timestamp: 10:42 AM</span>
              <span className="px-3 py-1 rounded-full bg-[#708C74]/15 text-[#708C74] text-xs font-medium">
                Verified Coherence
              </span>
            </div>
          </div>

          {/* Section 1: Observed Signals */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#8C8983]">
              Observed Signals
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                <div className="text-xs text-[#8C8983]">Facial Expression</div>
                <div className="text-sm font-semibold text-[#15171A] mt-1">Relaxed expression</div>
                <div className="text-[11px] text-[#708C74] mt-0.5">Gentle brow, open gaze</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                <div className="text-xs text-[#8C8983]">Vocal Resonance</div>
                <div className="text-sm font-semibold text-[#15171A] mt-1">Positive vocal tone</div>
                <div className="text-[11px] text-[#6D8192] mt-0.5">Natural inflection, steady pace</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6]">
                <div className="text-xs text-[#8C8983]">Physical Posture</div>
                <div className="text-sm font-semibold text-[#15171A] mt-1">Open posture</div>
                <div className="text-[11px] text-[#C88A63] mt-0.5">Relaxed shoulders, attentive lean</div>
              </div>
            </div>
          </div>

          {/* Section 2: Interpretation */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#8C8983]">
              Interpretation
            </h4>
            <div className="p-5 rounded-xl bg-[#F7F4EE] border border-[#E6E1D6] space-y-2">
              <p className="text-base font-serif text-[#15171A] leading-relaxed">
                “The moment appears calm and socially engaged.”
              </p>
              <p className="text-xs text-[#8C8983] leading-relaxed">
                Acoustic prosody and kinesic markers suggest comfortable cognitive focus without performance anxiety or verbal hesitation.
              </p>
            </div>
          </div>

          {/* Section 3: Confidence & Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-[#E6E1D6] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono text-[#8C8983]">Estimated Confidence</div>
                <div className="text-lg font-serif text-[#15171A] mt-0.5">High (92%)</div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#708C74]" />
            </div>

            <div className="p-4 rounded-xl border border-[#E6E1D6] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono text-[#8C8983]">Signal Concordance</div>
                <div className="text-lg font-serif text-[#15171A] mt-0.5">Aligned Across All 3 Channels</div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#6D8192]" />
            </div>
          </div>

          {/* Responsible AI Disclaimer */}
          <div className="border-t border-[#E6E1D6] pt-4 text-[11px] text-[#8C8983] flex items-center gap-2">
            <AlertCircle size={13} className="text-[#8C8983] shrink-0" />
            <span>
              Observed pattern estimation only. VibeLens does not draw medical or definitive psychological diagnoses.
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
