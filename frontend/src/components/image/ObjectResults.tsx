import React from "react";
import { DetectedObject } from "../../services/imageAnalysisApi";
import { Box } from "lucide-react";

interface ObjectResultsProps {
  objects: DetectedObject[];
}

export const ObjectResults: React.FC<ObjectResultsProps> = ({ objects }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#858881]">
        <Box size={14} className="text-[#17191A]" />
        <span>Identified Physical Objects</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {objects.map((obj) => (
          <div
            key={obj.name}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#DDD8CD]/80 shadow-2xs"
          >
            <span className="text-xs font-semibold text-[#17191A]">{obj.name}</span>
            <span className="text-[11px] font-mono text-[#555A58] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#DDD8CD]/50">
              {obj.confidence}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
