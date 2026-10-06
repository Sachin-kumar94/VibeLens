import React from "react";
import { Check, Settings, FileText, Briefcase, BookOpen, Layers } from "lucide-react";

interface InterviewSourceSelectorProps {
  sources: {
    hasResume: boolean;
    hasJd: boolean;
    hasStudyMaterials: boolean;
    hasStandard: boolean;
  };
  onOpenManageSources: () => void;
}

export const InterviewSourceSelector: React.FC<InterviewSourceSelectorProps> = ({
  sources,
  onOpenManageSources,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#DDD7CB] shadow-2xs text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold text-[#15171A] flex items-center gap-1.5">
          <Layers size={13} className="text-[#7D7971]" />
          <span>Active Sources:</span>
        </span>

        {/* Resume pill */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition ${
            sources.hasResume
              ? "bg-[#E8F8F5] border-[#A3E4D7] text-[#117A65]"
              : "bg-[#FAF8F5] border-[#E5E0D5] text-[#8C8983]"
          }`}
        >
          <FileText size={11} />
          <span>Resume</span>
          {sources.hasResume && <Check size={11} className="stroke-[2.5]" />}
        </div>

        {/* JD pill */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition ${
            sources.hasJd
              ? "bg-[#EBF5FB] border-[#AED6F1] text-[#1B4F72]"
              : "bg-[#FAF8F5] border-[#E5E0D5] text-[#8C8983]"
          }`}
        >
          <Briefcase size={11} />
          <span>Job Description</span>
          {sources.hasJd && <Check size={11} className="stroke-[2.5]" />}
        </div>

        {/* Study Materials pill */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition ${
            sources.hasStudyMaterials
              ? "bg-[#F4ECF7] border-[#D7BDE2] text-[#6C3483]"
              : "bg-[#FAF8F5] border-[#E5E0D5] text-[#8C8983]"
          }`}
        >
          <BookOpen size={11} />
          <span>Study Materials</span>
          {sources.hasStudyMaterials && <Check size={11} className="stroke-[2.5]" />}
        </div>

        {/* Standard bank pill */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition ${
            sources.hasStandard
              ? "bg-[#FEF9E7] border-[#F9E79F] text-[#7D6608]"
              : "bg-[#FAF8F5] border-[#E5E0D5] text-[#8C8983]"
          }`}
        >
          <Layers size={11} />
          <span>Standard Bank</span>
          {sources.hasStandard && <Check size={11} className="stroke-[2.5]" />}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenManageSources}
        className="px-3 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F2EFE9] border border-[#DDD7CB] text-[#15171A] font-medium flex items-center gap-1.5 transition cursor-pointer text-xs"
      >
        <Settings size={12} className="text-[#575A60]" />
        <span>Manage Sources</span>
      </button>
    </div>
  );
};
