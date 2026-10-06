import React from "react";
import { Plus } from "lucide-react";

export const INTERVIEW_CATEGORIES = [
  "Executive Leadership",
  "Product & Architecture",
  "Behavioral Resilience",
  "Technical Fundamentals",
  "Project Discussion",
  "Problem Solving",
  "Communication",
  "HR / General",
  "System Design",
  "Custom",
] as const;

interface InterviewCategoryTabsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  questionCounts: Record<string, number>;
  onOpenCustomModal: () => void;
}

export const InterviewCategoryTabs: React.FC<InterviewCategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  questionCounts,
  onOpenCustomModal,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#DDD7CB]/70 pb-3">
      {/* Scrollable Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => onSelectCategory("All")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
            activeCategory === "All"
              ? "bg-[#15171A] text-white border-[#15171A]"
              : "bg-[#FAF8F5] border-[#DDD7CB] text-[#575A60] hover:text-[#15171A] hover:border-[#8C8983]"
          }`}
        >
          All Prompts
        </button>

        {INTERVIEW_CATEGORIES.map((cat) => {
          const count = questionCounts[cat] || 0;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#15171A] text-white border-[#15171A]"
                  : "bg-[#FAF8F5] border-[#DDD7CB] text-[#575A60] hover:text-[#15171A] hover:border-[#8C8983]"
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#DDD7CB]/60 text-[#575A60]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add Custom Question Button */}
      <button
        type="button"
        onClick={onOpenCustomModal}
        className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#15171A] text-xs font-semibold text-[#15171A] flex items-center gap-1.5 cursor-pointer shadow-2xs transition hover:bg-[#FAF8F5]"
      >
        <Plus size={13} />
        <span className="hidden sm:inline">Add Custom Question</span>
        <span className="sm:hidden">Custom</span>
      </button>
    </div>
  );
};
