import React from "react";
import { DetectedColor } from "../../services/imageAnalysisApi";
import { Palette } from "lucide-react";

interface ColorPaletteProps {
  colors: DetectedColor[];
  colorTone: string;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, colorTone }) => {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#858881]">
          <Palette size={14} className="text-[#A97858]" />
          <span>Extracted Chromatic Palette</span>
        </div>
        <span className="text-xs font-mono font-semibold text-[#17191A] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#DDD8CD]">
          Tone: {colorTone}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {colors.map((c) => (
          <div
            key={c.hex}
            className="p-2.5 rounded-2xl bg-white border border-[#DDD8CD]/80 shadow-2xs space-y-2 text-center"
          >
            <div
              className="w-full h-10 rounded-xl border border-black/10 shadow-inner"
              style={{ backgroundColor: c.hex }}
            />
            <div>
              <div className="text-[11px] font-bold text-[#17191A] truncate">{c.name}</div>
              <div className="text-[10px] font-mono text-[#858881] uppercase">{c.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
