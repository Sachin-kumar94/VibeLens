import React, { useState, useEffect } from "react";
import { aiApi, NotesSummaryResponse } from "../../services/aiApi";

interface NotesSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle?: string;
}

export const NotesSummaryModal: React.FC<NotesSummaryModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle = "Study Material",
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<NotesSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && documentId && !summary) {
      loadSummary();
    }
  }, [isOpen, documentId]);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.generateSummary(documentId);
      setSummary(res);
    } catch (err: any) {
      setError(err?.message || "Failed to generate notes summary.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              📑
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#15171A]">
                AI Notes Summary — {documentTitle}
              </h2>
              <p className="text-xs text-[#6B7280]">
                Executive overview, key concepts, interview traps, and revision notes
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
          {loading && (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600">
                Synthesizing executive summary and extracting key concepts...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
              <button onClick={loadSummary} className="block mt-2 underline font-semibold">
                Retry
              </button>
            </div>
          )}

          {summary && !loading && (
            <div className="space-y-6 text-sm">
              {/* Executive Summary */}
              <div className="bg-white border border-[#E5E0D8] rounded-xl p-5 shadow-sm space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-purple-700 block">
                  Executive Summary
                </span>
                <p className="text-gray-800 leading-relaxed font-sans">
                  {summary.executiveSummary}
                </p>
              </div>

              {/* Key Concepts Grid */}
              {summary.keyConcepts?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-gray-600">
                    Key Concepts & Trade-offs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {summary.keyConcepts.map((kc, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-[#E5E0D8] rounded-xl p-3.5 space-y-1 shadow-sm"
                      >
                        <div className="font-semibold text-[#15171A] flex items-center justify-between">
                          <span>{kc.term}</span>
                          {kc.page && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              Page {kc.page}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{kc.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Definitions */}
              {summary.importantDefinitions?.length > 0 && (
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-4 shadow-sm space-y-2">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-gray-600">
                    Important Definitions
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside">
                    {summary.importantDefinitions.map((def, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {def}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* High-yield Interview Questions */}
              {summary.interviewQuestions?.length > 0 && (
                <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 shadow-sm space-y-2">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-purple-900 flex items-center gap-1.5">
                    <span>💡</span> High-Yield Interview Questions From This Document
                  </h3>
                  <div className="space-y-2">
                    {summary.interviewQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-purple-100 text-xs text-purple-950 font-medium"
                      >
                        {idx + 1}. {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential Traps & Revision Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summary.potentialTraps?.length > 0 && (
                  <div className="bg-red-50/50 border border-red-200 rounded-xl p-4 shadow-sm space-y-2">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-red-800">
                      ⚠️ Potential Traps
                    </h3>
                    <ul className="space-y-1.5 text-xs text-red-900 list-disc list-inside">
                      {summary.potentialTraps.map((trap, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {trap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.revisionNotes?.length > 0 && (
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 shadow-sm space-y-2">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-emerald-800">
                      ✓ Quick Revision Notes
                    </h3>
                    <ul className="space-y-1.5 text-xs text-emerald-900 list-disc list-inside">
                      {summary.revisionNotes.map((note, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#E5E0D8] flex items-center justify-between text-xs text-gray-500">
          <span>AI-generated study synthesis from uploaded PDF</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#15171A] text-white rounded-lg font-medium hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
