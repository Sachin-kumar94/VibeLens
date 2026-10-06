import React from "react";
import { Briefcase, Users, UserCheck, Video, BookOpen, Globe, PenTool } from "lucide-react";

export interface ContextSelectorProps {
  context: string;
  onChange: (context: string) => void;
  customContext: string;
  onCustomChange: (custom: string) => void;
}

const PRESET_CONTEXTS = [
  { id: "Presentation", label: "Presentation", icon: Briefcase },
  { id: "Meeting", label: "Meeting", icon: Users },
  { id: "Interview Practice", label: "Interview Practice", icon: UserCheck },
  { id: "Content Creation", label: "Content Creation", icon: Video },
  { id: "Daily Reflection", label: "Daily Reflection", icon: BookOpen },
  { id: "General", label: "General", icon: Globe },
  { id: "Custom", label: "Custom Context", icon: PenTool },
];

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  context,
  onChange,
  customContext,
  onCustomChange,
}) => {
  const isCustom = context === "Custom";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#15171A]">
          Interaction Context
        </label>
        <span className="text-[11px] text-[#8C8983]">
          Optional contextual frame for signal synthesis
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {PRESET_CONTEXTS.map((item) => {
          const Icon = item.icon;
          const isSelected = context === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                isSelected
                  ? "bg-[#15171A] text-white border-[#15171A] shadow-xs"
                  : "bg-white text-[#525866] border-[#E6E2D8] hover:bg-[#FAF8F5] hover:text-[#15171A]"
              }`}
            >
              <Icon size={13} className={isSelected ? "text-[#A855F7]" : "text-[#8C8983]"} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {isCustom && (
        <div className="pt-1">
          <input
            type="text"
            value={customContext}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="e.g. Team town hall, product launch keynote, technical review..."
            className="w-full bg-[#FAF8F5] border border-[#DDD8CD] rounded-xl px-3.5 py-2 text-xs text-[#15171A] outline-hidden focus:border-[#15171A] transition"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};
