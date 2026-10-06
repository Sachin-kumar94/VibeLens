import React, { useState } from "react";
import { aiApi, QuizResponse, QuizQuestionItem } from "../../services/aiApi";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle?: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle = "Study Material",
}) => {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("Intermediate");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    try {
      const res = await aiApi.generateQuiz(documentId, 5, difficulty);
      setQuiz(res);
    } catch (err: any) {
      setError(err?.message || "Failed to generate quiz from this document.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIdx,
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) correct++;
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const currentQ = quiz?.questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🎯
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#15171A]">
                AI Quiz Mode — {documentTitle}
              </h2>
              <p className="text-xs text-[#6B7280]">
                Multiple-choice mastery test grounded in document concepts
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
          {!quiz && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-2xl">
                📝
              </div>
              <h3 className="text-base font-serif font-semibold text-[#15171A] mb-2">
                Generate a 5-Question Quiz from {documentTitle}
              </h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto mb-6">
                VibeLens will extract core technical patterns from the text and generate a timed mastery quiz with detailed explanations and page citations.
              </p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-xs font-medium text-gray-700">Difficulty:</span>
                {["Easy", "Intermediate", "Advanced"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      difficulty === d
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 border-[#E5E0D8] hover:bg-gray-50"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
              >
                Generate Quiz Now →
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600">
                Scanning document chunks and synthesizing questions...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {quiz && currentQ && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-xs text-gray-600 pb-2 border-b border-[#E5E0D8]">
                <span>
                  Question {currentIndex + 1} of {quiz.questions.length}
                </span>
                <span className="font-semibold text-blue-700">
                  Topic: {currentQ.topic}
                </span>
              </div>

              {/* Question Text */}
              <div className="bg-white border border-[#E5E0D8] rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-[#15171A] leading-relaxed">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === oIdx;
                  const isCorrect = isSubmitted && currentQ.answerIndex === oIdx;
                  const isWrongSelected = isSubmitted && isSelected && !isCorrect;

                  let borderStyle = "border-[#E5E0D8] bg-white hover:border-blue-400";
                  if (isSelected && !isSubmitted) {
                    borderStyle = "border-blue-600 bg-blue-50 text-blue-900";
                  } else if (isCorrect) {
                    borderStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                  } else if (isWrongSelected) {
                    borderStyle = "border-red-500 bg-red-50 text-red-900";
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${borderStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback after submission */}
              {isSubmitted && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                  <div className="font-semibold text-blue-900 flex items-center justify-between">
                    <span>Explanation & Citation</span>
                    <span className="text-[11px] text-blue-700">{currentQ.citation}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Final Score Banner */}
              {isSubmitted && (
                <div className="p-4 bg-white border border-[#E5E0D8] rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Overall Mastery Score</span>
                    <span className="text-2xl font-bold font-serif text-[#15171A]">
                      {calculateScore()}%
                    </span>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Retake / New Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls */}
        {quiz && (
          <div className="px-6 py-4 bg-white border-t border-[#E5E0D8] flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 border border-[#D1D5DB] rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {currentIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((p) => Math.min(quiz.questions.length - 1, p + 1))}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Next →
                </button>
              ) : (
                !isSubmitted && (
                  <button
                    onClick={() => setIsSubmitted(true)}
                    className="px-5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Submit Quiz & Review Answers
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
