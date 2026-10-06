import React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Target,
  Compass,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { CoachingEvaluation, SavedPresentationSession } from "../../services/presentationCoachApi";

interface CoachingPanelProps {
  evaluation: CoachingEvaluation;
  currentPace?: number;
  pastSessions?: SavedPresentationSession[];
}

export const CoachingPanel: React.FC<CoachingPanelProps> = ({
  evaluation,
  currentPace = 0,
  pastSessions = [],
}) => {
  const { recommendations, strengths = [], improvements = [], practicePlan } = evaluation;

  // Max 3 strengths & Max 3 improvements per Section 38
  const displayedStrengths = strengths.slice(0, 3);
  const displayedImprovements = improvements.slice(0, 3);

  // Calculate Personal Baseline (Sections 41 & 42)
  const validPastPaces = pastSessions
    .map((s) => s.pace)
    .filter((p) => typeof p === "number" && p > 40);

  const hasSufficientBaseline = validPastPaces.length >= 3;
  const typicalPace =
    validPastPaces.length > 0
      ? Math.round(validPastPaces.reduce((a, b) => a + b, 0) / validPastPaces.length)
      : null;

  const paceDifference =
    typicalPace !== null && currentPace > 0 ? currentPace - typicalPace : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8983]">
              Targeted Coaching & Guidance
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#15171A]">
            Rehearsal Feedback & Action Plan
          </h2>
        </div>
      </div>

      {/* Sections 38 & 39: What Went Well & What to Improve (Max 3 each) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What went well */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DDD7CB]">
            <CheckCircle2 size={16} className="text-[#10B981]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#15171A] font-bold">
              What Went Well
            </h3>
            <span className="text-[10px] font-mono text-[#8C8983] ml-auto">
              ({displayedStrengths.length} observed)
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-[#575A60]">
            {displayedStrengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0 mt-1.5" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
            {displayedStrengths.length === 0 && (
              <li className="text-xs text-[#8C8983] italic">
                Pacing and framing maintained consistent baseline stability.
              </li>
            )}
          </ul>
        </div>

        {/* What to improve */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DDD7CB]">
            <Target size={16} className="text-[#8B5CF6]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#15171A] font-bold">
              What to Improve
            </h3>
            <span className="text-[10px] font-mono text-[#8C8983] ml-auto">
              ({displayedImprovements.length} targeted)
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-[#575A60]">
            {displayedImprovements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0 mt-1.5" />
                <span className="leading-relaxed">{imp}</span>
              </li>
            ))}
            {displayedImprovements.length === 0 && (
              <li className="text-xs text-[#8C8983] italic">
                Continue practicing with slightly varied target pacing to expand dynamic range.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Section 40: Practice Plan — Next Rehearsal Goals */}
      {practicePlan && (
        <div className="p-6 rounded-2xl bg-[#15171A] text-white space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-[#10B981]" />
              <h3 className="font-serif text-base font-bold">
                Next Rehearsal Goals
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded-full">
              Recommended Focus
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#10B981] uppercase block">
                1. Target Pacing Drill
              </span>
              <p className="text-white/90 font-medium">
                {practicePlan.nextTargetPace || "Maintain pace close to target range."}
              </p>
              <p className="text-[11px] text-white/60">
                {practicePlan.focusCue || "Focus on steady breath cadence between key ideas."}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#3B82F6] uppercase block">
                2. Strategic Pauses
              </span>
              <p className="text-white/90 font-medium">
                {practicePlan.pauseExercise || "Use deliberate 2-second pauses after major claims."}
              </p>
              <p className="text-[11px] text-white/60">
                Allows complex ideas to settle with your audience.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#8B5CF6] uppercase block">
                3. Centered Posture
              </span>
              <p className="text-white/90 font-medium">
                {practicePlan.postureReminder || "Keep upper body centered with relaxed shoulders."}
              </p>
              <p className="text-[11px] text-white/60">
                Preserves stable framing and confident non-verbal presence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sections 41 & 42: Personal Baseline Comparison */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CB]">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-[#575A60]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#15171A] font-bold">
              Personal Baseline Comparison
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#8C8983]">
            {validPastPaces.length} recorded session{validPastPaces.length === 1 ? "" : "s"}
          </span>
        </div>

        {hasSufficientBaseline && typicalPace !== null ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="text-[10px] font-mono text-[#8C8983] block uppercase">Typical Pace</span>
                <span className="text-base font-bold text-[#15171A] mt-0.5 block">
                  {typicalPace} WPM
                </span>
                <span className="text-[10px] text-[#575A60] block mt-0.5">
                  Historical average
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="text-[10px] font-mono text-[#8C8983] block uppercase">Current Session</span>
                <span className="text-base font-bold text-[#15171A] mt-0.5 block">
                  {currentPace > 0 ? `${currentPace} WPM` : "N/A"}
                </span>
                <span className="text-[10px] text-[#575A60] block mt-0.5">
                  This rehearsal
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="text-[10px] font-mono text-[#8C8983] block uppercase">Difference</span>
                <span
                  className={`text-base font-bold mt-0.5 block ${
                    paceDifference !== null && Math.abs(paceDifference) <= 5
                      ? "text-[#10B981]"
                      : "text-[#15171A]"
                  }`}
                >
                  {paceDifference !== null
                    ? `${paceDifference > 0 ? `+${paceDifference}` : paceDifference} WPM`
                    : "0 WPM"}
                </span>
                <span className="text-[10px] text-[#575A60] block mt-0.5">
                  From typical baseline
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="text-[10px] font-mono text-[#8C8983] block uppercase">Sample Size</span>
                <span className="text-base font-bold text-[#15171A] mt-0.5 block">
                  {validPastPaces.length} Rehearsals
                </span>
                <span className="text-[10px] text-[#575A60] block mt-0.5">
                  Stored sessions
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#575A60]">
              Pacing differences are natural adjustments depending on whether you are presenting a fast-paced project demo, an executive pitch, or a deliberate keynote.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs text-[#575A60] flex items-start gap-3">
            <Compass size={16} className="text-[#8C8983] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#15171A] block mb-0.5">
                No personal baseline yet
              </span>
              Complete a few rehearsals to build a personalized reference based on your actual speech habits.
            </div>
          </div>
        )}
      </div>

      {/* Prioritized Detailed Drill Cards */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C8983] block">
            Observed Behavioral Drills
          </span>
          {recommendations.slice(0, 3).map((rec, index) => (
            <div
              key={rec.id || index}
              className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3 shadow-2xs hover:border-[#8C8983] transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#15171A] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#15171A] text-white flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  {rec.category}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    rec.priority === "High"
                      ? "text-rose-700 bg-rose-100"
                      : rec.priority === "Medium"
                      ? "text-amber-700 bg-amber-100"
                      : "text-[#10B981] bg-[#10B981]/10"
                  }`}
                >
                  {rec.priority} Priority
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#8C8983] tracking-wider block">
                  Observed Signal
                </span>
                <p className="text-sm font-semibold text-[#15171A] leading-snug">
                  {rec.observation}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#8C8983] tracking-wider block">
                  Why It Matters
                </span>
                <p className="text-xs text-[#575A60] leading-relaxed">
                  {rec.whyItMatters}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-start gap-3">
                <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-[#15171A]">
                  <span className="font-bold text-[#15171A] block mb-0.5">Practice Drill:</span>
                  {rec.practiceTip}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
