import React, { useState, useEffect } from "react";
import { Clock, Play, SkipForward, FileText, Lock, Sparkles } from "lucide-react";

interface PreparationTimerProps {
  initialSeconds?: number;
  onStartAnswer: () => void;
  onSkipPreparation: () => void;
  questionCriteria?: string;
  whyThisQuestion?: string;
}

export const PreparationTimer: React.FC<PreparationTimerProps> = ({
  initialSeconds = 30,
  onStartAnswer,
  onSkipPreparation,
  questionCriteria,
  whyThisQuestion,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [privateNotes, setPrivateNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onStartAnswer();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onStartAnswer]);

  const formattedTime = `00:${secondsRemaining.toString().padStart(2, "0")}`;
  const progressPercent = ((initialSeconds - secondsRemaining) / initialSeconds) * 100;

  return (
    <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDD7CB]/70 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#786D9D] mb-1">
            <Clock size={13} />
            <span>Preparation Phase</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A]">
            Take a Moment to Frame Your Answer
          </h3>
          <p className="text-xs sm:text-sm text-[#575A60] mt-1">
            Organize your opening situation, key actions, and tangible results.
          </p>
        </div>

        {/* Large Countdown Clock */}
        <div className="flex items-center gap-3 self-center sm:self-auto">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#DDD7CB]"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#15171A] transition-all duration-1000 ease-linear"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-sm font-bold text-[#15171A]">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Rationale & Criteria Highlights */}
      {(whyThisQuestion || questionCriteria) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white border border-[#DDD7CB] rounded-2xl p-4">
          {whyThisQuestion && (
            <div>
              <span className="font-semibold text-[#15171A] block mb-1">
                Interviewer Perspective
              </span>
              <p className="text-[#575A60] leading-relaxed">{whyThisQuestion}</p>
            </div>
          )}
          {questionCriteria && (
            <div>
              <span className="font-semibold text-[#15171A] block mb-1">
                Focus Rubric
              </span>
              <p className="text-[#575A60] leading-relaxed">{questionCriteria}</p>
            </div>
          )}
        </div>
      )}

      {/* Private Scratchpad Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs font-medium text-[#575A60] hover:text-[#15171A] flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText size={13} />
            <span>{showNotes ? "Hide Private Scratchpad" : "Open Private Scratchpad (Notes)"}</span>
          </button>
          <span className="text-[11px] text-[#7D7971] flex items-center gap-1">
            <Lock size={12} />
            <span>Private notes · Excluded from evaluation</span>
          </span>
        </div>

        {showNotes && (
          <textarea
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
            placeholder="Jot down quick bullet points (Situation, Action, Outcome). These notes are strictly private..."
            rows={3}
            className="w-full text-xs font-mono p-3 bg-white border border-[#DDD7CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#15171A] text-[#15171A] placeholder-[#7D7971] animate-in fade-in"
          />
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-[#DDD7CB]">
        <button
          onClick={onSkipPreparation}
          className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#575A60] hover:text-[#15171A] border border-[#DDD7CB] hover:bg-white transition cursor-pointer flex items-center gap-1.5"
        >
          <SkipForward size={13} />
          <span>Skip Preparation</span>
        </button>

        <button
          onClick={onStartAnswer}
          className="px-6 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <span>Start Answer Now</span>
          <Play size={13} className="fill-current" />
        </button>
      </div>
    </div>
  );
};
