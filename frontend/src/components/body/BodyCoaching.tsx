import React from "react";
import { CheckCircle2, ArrowUpRight, Target, Presentation, ArrowRight } from "lucide-react";
import { BodyAnalysisResponse } from "../../services/bodyAnalysisApi";

interface BodyCoachingProps {
  coach: BodyAnalysisResponse["coach"];
  onNavigateToPresentationCoach?: () => void;
}

export const BodyCoaching: React.FC<BodyCoachingProps> = ({
  coach,
  onNavigateToPresentationCoach,
}) => {
  return (
    <div className="space-y-6">
      {/* Coaching Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E8E4DA]">
        <div>
          <h4 className="text-sm font-bold text-[#15171A] flex items-center gap-2">
            <Presentation size={15} className="text-emerald-600" />
            <span>Presentation & Delivery Coach</span>
          </h4>
          <p className="text-xs text-[#707582] mt-0.5">
            Practical recommendations to elevate executive poise and speaking presence.
          </p>
        </div>

        {onNavigateToPresentationCoach && (
          <button
            type="button"
            onClick={onNavigateToPresentationCoach}
            className="px-3.5 py-1.5 rounded-xl bg-[#15171A] hover:bg-[#2A2E39] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 self-start shadow-2xs"
          >
            <span>Open Rehearsal Coach</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* 3 Structured Columns: What Went Well, What to Improve, Next Practice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* What Went Well */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>What Went Well</span>
          </div>
          <ul className="space-y-2 text-xs text-emerald-950/80">
            {coach.whatWentWell?.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What to Improve */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
            <ArrowUpRight size={14} className="text-amber-600" />
            <span>Areas to Polish</span>
          </div>
          <ul className="space-y-2 text-xs text-amber-950/80">
            {coach.whatToImprove?.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Practice Drill */}
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <Target size={14} className="text-blue-600" />
            <span>Recommended Drill</span>
          </div>
          <ul className="space-y-2 text-xs text-blue-950/80">
            {coach.nextPractice?.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary Note */}
      {coach.presentationPresence && (
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] text-xs text-[#575A60]">
          <span className="font-semibold text-[#15171A] block mb-0.5">Overall Presentation Presence</span>
          <p>{coach.presentationPresence}</p>
        </div>
      )}
    </div>
  );
};
