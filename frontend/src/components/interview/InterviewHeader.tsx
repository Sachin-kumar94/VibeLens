import React from "react";
import { Sparkles, ArrowRight, Settings2, Video, Mic, CheckCircle2, AlertCircle } from "lucide-react";

interface InterviewHeaderProps {
  onNavigate: (path: string) => void;
  onOpenSetup: () => void;
  onOpenManageSources?: () => void;
  onOpenStudyAssistant?: () => void;
  onOpenStudyPlan?: () => void;
  hasActiveSession: boolean;
  cameraReady: boolean;
  micReady: boolean;
  selectedRole: string;
  interviewType: string;
  activeSources?: {
    hasResume: boolean;
    hasJd: boolean;
    hasStudyMaterials: boolean;
    hasStandard: boolean;
  };
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  onNavigate,
  onOpenSetup,
  onOpenManageSources,
  onOpenStudyAssistant,
  onOpenStudyPlan,
  hasActiveSession,
  cameraReady,
  micReady,
  selectedRole,
  interviewType,
  activeSources = { hasResume: true, hasJd: false, hasStudyMaterials: true, hasStandard: true },
}) => {
  return (
    <div className="flex flex-col gap-5 pb-6 border-b border-[#DDD7CB]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7D7971]">
              Realistic Practice Simulator
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#15171A] text-white text-[10px] font-mono tracking-wide">
              {selectedRole} · {interviewType}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#15171A] tracking-tight">
            Interview Practice
          </h1>
          <p className="text-sm sm:text-base text-[#575A60] mt-1.5 max-w-2xl leading-relaxed">
            Practice questions tailored to your role, experience and selected learning material.
          </p>

          {/* Live Device Readiness Indicators */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[#7D7971]">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${cameraReady ? "bg-[#10B981]" : "bg-[#DDD7CB]"}`} />
              <span>Camera: {cameraReady ? "Ready" : "Standby"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${micReady ? "bg-[#10B981]" : "bg-[#DDD7CB]"}`} />
              <span>Microphone: {micReady ? "Ready" : "Standby"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenStudyAssistant && (
            <button
              type="button"
              onClick={onOpenStudyAssistant}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold text-emerald-900 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Sparkles size={13} className="text-emerald-700" />
              <span>Ask VibeLens</span>
            </button>
          )}

          {onOpenStudyPlan && (
            <button
              type="button"
              onClick={onOpenStudyPlan}
              className="px-3.5 py-2.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-xs font-semibold text-teal-900 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <span>🗓️ 7-Day Plan</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSetup}
            className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] flex items-center gap-2 transition cursor-pointer shadow-2xs hover:bg-[#FAF8F5]"
          >
            <Settings2 size={14} className="text-[#575A60]" />
            <span>{hasActiveSession ? "Session Settings" : "Configure Simulation"}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("/presentation-coach")}
            className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-medium text-[#15171A] transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Switch to Presentation Coach</span>
            <ArrowRight size={13} className="text-[#8C8983]" />
          </button>
        </div>
      </div>

      {/* Compact Source Bar (Section 137) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5E0D5] text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[#575A60]">
          <span className="font-semibold text-[#15171A]">Using:</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${activeSources.hasResume ? "bg-[#E8F8F5] text-[#117A65] font-medium" : "text-[#8C8983]"}`}>
            Resume {activeSources.hasResume ? "✓" : ""}
          </span>
          <span className="text-[#DDD7CB]">·</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${activeSources.hasJd ? "bg-[#EBF5FB] text-[#1B4F72] font-medium" : "text-[#8C8983]"}`}>
            JD {activeSources.hasJd ? "✓" : ""}
          </span>
          <span className="text-[#DDD7CB]">·</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${activeSources.hasStudyMaterials ? "bg-[#F4ECF7] text-[#6C3483] font-medium" : "text-[#8C8983]"}`}>
            Study Materials {activeSources.hasStudyMaterials ? "✓" : ""}
          </span>
          <span className="text-[#DDD7CB]">·</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${activeSources.hasStandard ? "bg-[#FEF9E7] text-[#7D6608] font-medium" : "text-[#8C8983]"}`}>
            Standard Questions {activeSources.hasStandard ? "✓" : ""}
          </span>
        </div>

        {onOpenManageSources && (
          <button
            type="button"
            onClick={onOpenManageSources}
            className="text-[11px] font-semibold text-[#15171A] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Manage Sources</span>
            <ArrowRight size={11} className="text-[#7D7971]" />
          </button>
        )}
      </div>
    </div>
  );
};
