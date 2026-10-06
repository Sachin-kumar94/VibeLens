import React, { useState, useEffect } from "react";
import { aiApi, ExplainResponse } from "../../services/aiApi";

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "score" | "why_wrong" | "concept" | "recommendation" | "result_question";
  contextText: string;
  questionText?: string;
  candidateAnswer?: string;
  category?: string;
  score?: number;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({
  isOpen,
  onClose,
  type,
  contextText,
  questionText,
  candidateAnswer,
  category,
  score,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contextText) {
      loadExplanation();
    }
  }, [isOpen, contextText, score]);

  const loadExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.explain({
        type,
        contextText,
        questionText,
        candidateAnswer,
        category,
        score,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load explanation.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              💡
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#15171A]">
                {type === "score" || type === "result_question"
                  ? "Assessment Explanation"
                  : type === "why_wrong"
                  ? "Why Was This Answer Flawed?"
                  : "Pedagogical Explanation"}
              </h2>
              <p className="text-xs text-[#6B7280]">
                Transparent, evidence-based reasoning from VibeLens AI Coach
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Question / Context Reference */}
          {questionText && (
            <div className="p-3.5 bg-white border border-[#E5E0D8] rounded-xl text-xs space-y-1">
              <span className="font-semibold text-gray-500 uppercase tracking-wider block">
                Target Question
              </span>
              <p className="text-gray-800 font-medium">{questionText}</p>
            </div>
          )}

          {candidateAnswer && (
            <div className="p-3.5 bg-white border border-[#E5E0D8] rounded-xl text-xs space-y-1">
              <span className="font-semibold text-gray-500 uppercase tracking-wider block">
                Candidate's Answer
              </span>
              <p className="text-gray-700 italic">"{candidateAnswer}"</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600">
                Synthesizing deep diagnostic explanation...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
              <button onClick={loadExplanation} className="block mt-2 underline font-semibold">
                Retry
              </button>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              {/* Main Explanation */}
              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-serif font-bold text-[#15171A]">
                  {result.title}
                </h3>
                <div className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {result.explanation}
                </div>
              </div>

              {/* Key Takeaways */}
              {result.keyTakeaways?.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 shadow-sm space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <span>📌</span> Key Conceptual Takeaways
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-950 list-disc list-inside">
                    {result.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Citations if available */}
              {result.citations && result.citations.length > 0 && (
                <div className="p-3.5 bg-white border border-[#E5E0D8] rounded-xl text-xs space-y-2">
                  <span className="font-semibold text-gray-600 uppercase tracking-wider block">
                    Grounded Note References
                  </span>
                  <div className="space-y-1.5">
                    {result.citations.map((c, idx) => (
                      <div key={idx} className="text-emerald-800 font-medium">
                        • {c.documentName} — Page {c.page} ({c.section})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Immediate Suggested Action */}
              {result.suggestedAction && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">Next Recommended Practice:</span>
                    <span>{result.suggestedAction}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#E5E0D8] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#15171A] text-white rounded-lg text-xs font-medium hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
