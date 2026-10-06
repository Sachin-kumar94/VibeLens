import React from "react";
import {
  CheckCircle2,
  Clock,
  Activity,
  Mic,
  Video,
  Info,
  Layers,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { InterviewAnswerItem } from "../../services/interviewApi";

interface InterviewLiveDiagnosticsProps {
  currentAnswer: InterviewAnswerItem | null;
  isEvaluating: boolean;
  saveStatus: "not_saved" | "saving" | "saved" | "error";
  targetTimeMin: number;
  targetTimeMax: number;
}

export const InterviewLiveDiagnostics: React.FC<InterviewLiveDiagnosticsProps> = ({
  currentAnswer,
  isEvaluating,
  saveStatus,
  targetTimeMin,
  targetTimeMax,
}) => {
  const evaluation = currentAnswer?.evaluation;

  const getSaveBadge = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
            Saving...
          </span>
        );
      case "saved":
        return (
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
            ✓ Saved
          </span>
        );
      case "error":
        return (
          <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            Save Failed
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono text-[#7D7971] bg-white px-2 py-0.5 rounded-full border border-[#DDD7CB]">
            Not Saved
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-5 shadow-2xs">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#DDD7CB]/70 pb-3">
        <h3 className="text-sm font-bold text-[#15171A] flex items-center gap-1.5">
          <Activity size={15} className="text-[#71889C]" />
          <span>Interview Diagnostic Report</span>
        </h3>
        {getSaveBadge()}
      </div>

      {isEvaluating ? (
        <div className="py-20 text-center text-xs text-[#575A60] space-y-3 flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#15171A] border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <span className="font-bold text-[#15171A] block">Evaluating response structure...</span>
            <p className="text-[11px] text-[#7D7971]">
              Analyzing thesis, WPM tempo, phrase boundaries, and observable delivery signals.
            </p>
          </div>
        </div>
      ) : evaluation ? (
        <div className="space-y-5 animate-in fade-in">
          {/* Primary Response Score Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] flex items-center justify-between shadow-2xs">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-[#7D7971]">
                <span>Response Practice Score</span>
                <span title="Weighted composite score derived from question rubric weights">(?)</span>
              </div>
              <span className="text-3xl sm:text-4xl font-bold font-serif text-[#15171A] block mt-0.5">
                {evaluation.overallScore}
                <span className="text-xs font-sans text-[#7D7971] font-normal"> / 100</span>
              </span>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg font-serif ${
                evaluation.overallScore >= 80
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {evaluation.overallScore >= 80 ? <CheckCircle2 size={24} /> : <Sparkles size={22} />}
            </div>
          </div>

          {/* Sub-Score Breakdown Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] text-[#7D7971] block font-mono" title="Logical framework and thesis clarity">
                STRUCTURE
              </span>
              <span className="font-bold text-sm text-[#15171A]">
                {evaluation.structureScore}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] text-[#7D7971] block font-mono" title="Alignment with question keywords and criteria">
                RELEVANCE
              </span>
              <span className="font-bold text-sm text-[#15171A]">
                {evaluation.relevanceScore}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] text-[#7D7971] block font-mono" title="Sentence length and articulation clarity">
                CLARITY
              </span>
              <span className="font-bold text-sm text-[#15171A]">
                {evaluation.clarityScore}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] text-[#7D7971] block font-mono" title="Speaking tempo, pauses, and minimal fillers">
                DELIVERY
              </span>
              <span className="font-bold text-sm text-[#15171A]">
                {evaluation.deliveryScore}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] text-[#7D7971] block font-mono" title="Tangible metrics and concrete trade-off examples">
                EVIDENCE
              </span>
              <span className="font-bold text-sm text-[#15171A]">
                {evaluation.evidenceScore}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] text-[#7D7971] block font-mono">TEMPO</span>
              <span className="font-bold text-sm text-[#10B981]">
                {currentAnswer?.wpm || 0} WPM
              </span>
            </div>
          </div>

          {/* Delivery Telemetry Strip */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 text-xs">
            <span className="font-bold text-[#15171A] text-[11px] block font-mono uppercase tracking-wide">
              Observable Signal Telemetry
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#7D7971] block">Answer Duration:</span>
                <span className="font-mono font-semibold text-[#15171A]">
                  {Math.round(currentAnswer?.duration || 0)}s{" "}
                  <span className="text-[10px] text-[#8C8983]">
                    ({currentAnswer?.duration && currentAnswer.duration >= targetTimeMin && currentAnswer.duration <= targetTimeMax ? "In Target" : "Off Target"})
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[#7D7971] block">Pause Pattern:</span>
                <span className="font-mono font-semibold text-[#15171A]">
                  {currentAnswer?.pauseCount || 0} pauses (avg {(currentAnswer?.avgPauseDuration || 0).toFixed(1)}s)
                </span>
              </div>
              <div>
                <span className="text-[#7D7971] block">Filler Hesitations:</span>
                <span className="font-mono font-semibold text-[#15171A]">
                  {currentAnswer?.fillerCount || 0} ({currentAnswer?.fillerRate || 0}%)
                </span>
              </div>
              <div>
                <span className="text-[#7D7971] block">Camera Alignment:</span>
                <span className="font-mono font-semibold text-[#15171A]">
                  {currentAnswer?.cameraFacingSignal || "Unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* Evaluator Assessment Quote */}
          {evaluation.feedback && (
            <div className="p-3.5 rounded-2xl bg-white border border-[#DDD7CB] space-y-1.5 text-xs text-[#575A60]">
              <span className="font-bold text-[#15171A] text-[11px] block flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#10B981]" />
                <span>Evaluator Synthesis</span>
              </span>
              <p className="leading-relaxed text-xs">{evaluation.feedback}</p>
            </div>
          )}
        </div>
      ) : (
        /* Standby State */
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3 text-xs text-[#575A60]">
          <div className="flex items-center gap-2 text-[#15171A] font-bold">
            <Info size={14} className="text-[#71889C]" />
            <span>Ready for Recorded Response</span>
          </div>
          <p className="leading-relaxed">
            Record your answer via microphone (and camera if enabled). The simulator will transcribe speech, measure conversational WPM tempo, evaluate thesis structure, and extract actionable feedback.
          </p>
          <div className="pt-2 border-t border-[#DDD7CB]/70 space-y-1.5 text-[11px] text-[#7D7971]">
            <div className="flex items-center justify-between">
              <span>Rubric Baseline</span>
              <span className="font-mono">Structure / Relevance / Clarity</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Target Duration</span>
              <span className="font-mono">{targetTimeMin}–{targetTimeMax} seconds</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
