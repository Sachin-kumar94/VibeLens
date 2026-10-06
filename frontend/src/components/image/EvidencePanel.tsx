import React from "react";
import { HelpCircle, CheckCircle2 } from "lucide-react";

interface EvidencePanelProps {
  evidence: {
    expression: string;
    visualContext: string;
    colorTone: string;
    composition: string;
    details?: string;
  };
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence }) => {
  const points = [
    { title: "Facial & Physical Expression", description: evidence.expression },
    { title: "Environmental Context", description: evidence.visualContext },
    { title: "Color & Atmospheric Tone", description: evidence.colorTone },
    { title: "Spatial Composition", description: evidence.composition },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#858881]">
        <HelpCircle size={14} className="text-[#30483E]" />
        <span>Evidence & Grounding &bull; Why this result?</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {points.map((p) => (
          <div
            key={p.title}
            className="p-4 rounded-2xl bg-white border border-[#DDD8CD]/80 space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#17191A]">
              <CheckCircle2 size={13} className="text-[#30483E] flex-shrink-0" />
              <span>{p.title}</span>
            </div>
            <p className="text-xs text-[#555A58] leading-relaxed pl-5 font-sans">
              {p.description}
            </p>
          </div>
        ))}
      </div>

      {evidence.details && (
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD8CD]/60 text-xs text-[#555A58] leading-relaxed italic">
          &ldquo;{evidence.details}&rdquo;
        </div>
      )}
    </div>
  );
};
