import React from "react";
import { Compass, MapPin } from "lucide-react";

interface SceneResultProps {
  scene: string;
  confidence: number;
  context: string[];
}

export const SceneResult: React.FC<SceneResultProps> = ({ scene, confidence, context }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#DDD8CD]/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#858881]">
            <Compass size={14} className="text-[#30483E]" />
            <span>Environmental Setting</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#17191A] px-2.5 py-0.5 rounded-full bg-white border border-[#DDD8CD]">
            {confidence}% Confidence
          </span>
        </div>

        <div className="text-xl sm:text-2xl font-serif font-bold text-[#17191A] tracking-tight">
          {scene}
        </div>

        {/* Environmental Context Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {context.map((tag) => (
            <div
              key={tag}
              className="px-3 py-1 rounded-full bg-white border border-[#DDD8CD] text-[11px] text-[#555A58] flex items-center gap-1.5 shadow-2xs font-medium"
            >
              <MapPin size={11} className="text-[#A97858]" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
