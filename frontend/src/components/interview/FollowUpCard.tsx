import React from "react";
import { MessageSquare, ArrowRight, Play, Sparkles, SkipForward } from "lucide-react";
import { InterviewQuestionItem } from "../../services/interviewApi";

interface FollowUpCardProps {
  followUpNumber: number; // 1 or 2
  followUpQuestion: InterviewQuestionItem;
  onAcceptFollowUp: () => void;
  onSkipFollowUp: () => void;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  followUpNumber,
  followUpQuestion,
  onAcceptFollowUp,
  onSkipFollowUp,
}) => {
  return (
    <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DDD7CB]/70 pb-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#786D9D]/10 text-[#786D9D] text-xs font-semibold tracking-wide uppercase">
          <Sparkles size={13} />
          <span>Follow-Up Probe #{followUpNumber}</span>
        </div>
        <span className="text-xs font-mono text-[#7D7971]">Target: 45–75s</span>
      </div>

      {/* Spoken Transition & Question */}
      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-wider text-[#7D7971]">
          Generated from your previous response:
        </p>
        <div className="p-5 bg-white border border-[#DDD7CB] rounded-2xl text-lg sm:text-xl font-serif font-bold text-[#15171A] leading-snug">
          "{followUpQuestion.question}"
        </div>
      </div>

      {/* Contextual Rationale */}
      {followUpQuestion.whyThisQuestion && (
        <div className="text-xs text-[#575A60] bg-white border border-[#DDD7CB] rounded-xl p-3.5 leading-relaxed">
          <span className="font-semibold text-[#15171A] block mb-0.5">Focus Area:</span>
          {followUpQuestion.whyThisQuestion}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-[#DDD7CB]">
        <button
          onClick={onSkipFollowUp}
          className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#7D7971] hover:text-[#15171A] border border-[#DDD7CB] hover:bg-white transition cursor-pointer flex items-center gap-1.5"
        >
          <SkipForward size={13} />
          <span>Skip to Next Question</span>
        </button>

        <button
          onClick={onAcceptFollowUp}
          className="px-6 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <span>Answer Follow-up</span>
          <Play size={13} className="fill-current" />
        </button>
      </div>
    </div>
  );
};
