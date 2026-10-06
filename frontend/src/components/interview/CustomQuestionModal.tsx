import React, { useState } from "react";
import { X, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { INTERVIEW_CATEGORIES } from "./InterviewCategoryTabs";
import { TARGET_ROLES, DIFFICULTIES } from "./InterviewSetupModal";

interface CustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomQuestion: (question: {
    question: string;
    category: string;
    role: string;
    difficulty: string;
    criteria: string;
    timeTargetMin: number;
    timeTargetMax: number;
  }) => Promise<void>;
}

export const CustomQuestionModal: React.FC<CustomQuestionModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomQuestion,
}) => {
  const [questionText, setQuestionText] = useState("");
  const [category, setCategory] = useState<string>("Product & Architecture");
  const [role, setRole] = useState<string>("Software Engineer");
  const [difficulty, setDifficulty] = useState<string>("Intermediate");
  const [criteria, setCriteria] = useState("");
  const [timeMin, setTimeMin] = useState(60);
  const [timeMax, setTimeMax] = useState(90);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || questionText.trim().length < 8) {
      setError("Please enter a question prompt of at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSaveCustomQuestion({
        question: questionText.trim(),
        category,
        role,
        difficulty,
        criteria: criteria.trim() || "Clear thesis statement, trade-off analysis, concrete real-world examples.",
        timeTargetMin: Number(timeMin),
        timeTargetMax: Number(timeMax),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15171A]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#8C8983] hover:text-[#15171A] hover:bg-[#DDD7CB]/40 cursor-pointer"
        >
          <X size={16} />
        </button>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7D7971] block">
            Custom Question Bank
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#15171A]">
            Create Practice Prompt
          </h3>
          <p className="text-xs text-[#575A60] mt-1">
            Add a specialized question tailored to your upcoming interviews and competencies.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#15171A] block">Question Text *</label>
            <textarea
              required
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. How do you design an offline-first mobile sync engine while handling concurrent writes?"
              className="w-full p-3 rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#15171A] block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
              >
                {INTERVIEW_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#15171A] block">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#15171A] block">Target Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
            >
              {TARGET_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#15171A] block">Key Evaluator Criteria</label>
            <input
              type="text"
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="e.g. CRDT vs Operational Transforms, local storage compaction, edge cases."
              className="w-full p-2.5 rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#15171A] block">Min Time (Seconds)</label>
              <input
                type="number"
                min={30}
                max={300}
                value={timeMin}
                onChange={(e) => setTimeMin(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#15171A] block">Max Time (Seconds)</label>
              <input
                type="number"
                min={30}
                max={300}
                value={timeMax}
                onChange={(e) => setTimeMax(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-white border border-[#DDD7CB] focus:outline-none focus:border-[#15171A]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#DDD7CB] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#575A60] hover:text-[#15171A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#15171A] text-white font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#252833] transition disabled:opacity-50"
            >
              <Plus size={13} />
              <span>{isSubmitting ? "Saving..." : "Save to Question Bank"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
