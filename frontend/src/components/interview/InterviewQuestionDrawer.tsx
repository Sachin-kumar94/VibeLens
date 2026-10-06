import React from "react";
import { X, CheckCircle2, Circle, Clock, ArrowRight, SkipForward } from "lucide-react";
import { InterviewQuestionItem } from "../../services/interviewApi";

interface InterviewQuestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: InterviewQuestionItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  answeredQuestionIds: Set<string>;
  onSkipQuestion: () => void;
}

export const InterviewQuestionDrawer: React.FC<InterviewQuestionDrawerProps> = ({
  isOpen,
  onClose,
  questions,
  currentIndex,
  onSelectIndex,
  answeredQuestionIds,
  onSkipQuestion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15171A]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DDD7CB]/70 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7D7971]">
              Session Roadmap
            </span>
            <h3 className="font-serif text-xl font-bold text-[#15171A]">
              Interview Questions ({questions.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#15171A] hover:bg-[#DDD7CB]/40 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {questions.map((q, idx) => {
            const isCompleted = answeredQuestionIds.has(q.id);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => {
                  onSelectIndex(idx);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  isCurrent
                    ? "bg-[#15171A] text-white border-[#15171A] shadow-md"
                    : isCompleted
                    ? "bg-emerald-50/50 border-emerald-200 text-[#15171A] hover:bg-emerald-50"
                    : "bg-white border-[#DDD7CB] text-[#575A60] hover:border-[#8C8983]"
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className={isCurrent ? "text-[#10B981]" : "text-emerald-600"} />
                  ) : (
                    <Circle size={16} className={isCurrent ? "text-white/60" : "text-[#8C8983]"} />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
                    <span>Q{idx + 1} · {q.category}</span>
                    <span>{q.difficulty}</span>
                  </div>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isCurrent ? "text-white font-medium" : "text-[#15171A]"}`}>
                    "{q.question}"
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#DDD7CB] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSkipQuestion();
              onClose();
            }}
            className="text-xs text-[#575A60] hover:text-[#15171A] flex items-center gap-1.5 cursor-pointer py-1.5"
          >
            <SkipForward size={13} />
            <span>Skip Current Question</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#15171A] text-white text-xs font-semibold cursor-pointer hover:bg-[#252833]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
