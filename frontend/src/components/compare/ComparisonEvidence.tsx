import React from "react";
import { CheckCircle2, HelpCircle } from "lucide-react";

interface ComparisonEvidenceProps {
  evidence: string[];
}

export const ComparisonEvidence: React.FC<ComparisonEvidenceProps> = ({ evidence }) => {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DDD7CB] space-y-4 shadow-xs">
      <div className="flex items-center gap-2">
        <HelpCircle size={17} className="text-[#15171A]" />
        <h4 className="font-serif text-xl font-bold text-[#15171A]">
          Why is this different?
        </h4>
      </div>
      <p className="text-xs text-[#575A60]">
        Observable signal drivers extracted from feature extractions and sensory calibrations:
      </p>

      <ul className="space-y-2.5 pt-1">
        {evidence.map((item, idx) => (
          <li
            key={idx}
            className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs text-[#15171A] flex items-start gap-2.5 leading-relaxed"
          >
            <CheckCircle2 size={15} className="text-[#10B981] shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
