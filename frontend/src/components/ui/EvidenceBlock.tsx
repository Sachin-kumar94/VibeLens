import React from "react";
import { CheckCircle2, Info } from "lucide-react";

export interface EvidenceItem {
  label: string;
  value: string;
  status?: "optimal" | "normal" | "warning";
}

export interface EvidenceBlockProps {
  title?: string;
  items: EvidenceItem[];
  className?: string;
}

export const EvidenceBlock: React.FC<EvidenceBlockProps> = ({
  title = "Observed Evidence & Geometry",
  items,
  className = "",
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3 shadow-2xs ${className}`}>
      <div className="flex items-center gap-2">
        <Info size={15} className="text-[#738A9B]" />
        <h4 className="font-serif font-bold text-sm text-[#17191A]">{title}</h4>
      </div>
      <div className="divide-y divide-[#F0EDE6] text-xs">
        {items.map((item, i) => (
          <div key={i} className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-[#81827D] font-medium">{item.label}</span>
            <div className="flex items-center gap-1.5 text-right font-mono">
              <span
                className={`font-semibold ${
                  item.status === "optimal"
                    ? "text-[#748C78]"
                    : item.status === "warning"
                    ? "text-[#C38A68]"
                    : "text-[#17191A]"
                }`}
              >
                {item.value}
              </span>
              {item.status === "optimal" && <CheckCircle2 size={13} className="text-[#748C78]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
