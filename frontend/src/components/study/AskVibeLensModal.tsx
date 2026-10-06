import React, { useState } from "react";
import { aiApi, AskVibeLensResponse, StudyCitation } from "../../services/aiApi";

interface AskVibeLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  documentId?: string;
  documentTitle?: string;
}

export const AskVibeLensModal: React.FC<AskVibeLensModalProps> = ({
  isOpen,
  onClose,
  initialQuestion = "",
  documentId,
  documentTitle,
}) => {
  const [query, setQuery] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskVibeLensResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ q: string; a: AskVibeLensResponse }>>([]);

  if (!isOpen) return null;

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.askStudyAssistant({
        message: q,
        documentId,
      });
      setResponse(res);
      setHistory((prev) => [...prev, { q, a: res }]);
      setQuery("");
    } catch (err: any) {
      setError(err?.message || "Failed to get an answer from VibeLens Study Assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedClick = (suggested: string) => {
    setQuery(suggested);
    handleAsk(suggested);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#15171A] flex items-center gap-2">
                Ask VibeLens — Personal Study Assistant
                {documentTitle && (
                  <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Grounded in: {documentTitle}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#6B7280]">
                Grounded in your uploaded study notes, books, and verified citations
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

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {history.length === 0 && !response && !loading && (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-2xl">
                📖
              </div>
              <h3 className="text-base font-serif font-semibold text-[#15171A] mb-1">
                Ask anything from your uploaded study materials
              </h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto mb-6">
                VibeLens will retrieve the exact page and section citations from your PDFs to explain concepts, solve doubts, and suggest interview questions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto text-left">
                {[
                  "Explain normalization and 3NF trade-offs",
                  "What is B-Tree index write overhead?",
                  "Explain this like I'm a beginner",
                  "Give me 3 tough interview questions on this topic",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedClick(prompt)}
                    className="p-2.5 text-xs bg-white border border-[#E5E0D8] rounded-xl text-[#374151] hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-900 transition-all text-left flex items-center justify-between"
                  >
                    <span>"{prompt}"</span>
                    <span className="text-emerald-600">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation stream */}
          {history.map((item, idx) => (
            <div key={idx} className="space-y-4">
              {/* Question bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-[#15171A] text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm font-medium shadow-sm">
                  {item.q}
                </div>
              </div>

              {/* Answer card */}
              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {item.a.keyConcept}
                  </span>
                  {item.a.sourceDocumentNames?.length > 0 && (
                    <span className="text-xs text-[#6B7280]">
                      Sources: {item.a.sourceDocumentNames.join(", ")}
                    </span>
                  )}
                </div>

                <div className="text-sm text-[#1F2937] leading-relaxed whitespace-pre-wrap font-sans">
                  {item.a.answer}
                </div>

                {/* Grounded Citations */}
                {item.a.citations?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#F0EBE1]">
                    <h4 className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>📌</span> Verified Note Citations
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.a.citations.map((cite: StudyCitation, cIdx: number) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs space-y-1"
                        >
                          <div className="font-semibold text-emerald-800 flex items-center justify-between">
                            <span>{cite.citation}</span>
                            <span className="text-[10px] text-gray-500">{cite.section}</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2 italic">
                            "{cite.text.slice(0, 120)}..."
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Questions */}
                {item.a.relatedQuestions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#F0EBE1]">
                    <span className="text-xs font-semibold text-gray-700 block mb-2">
                      Recommended Follow-up Questions:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.a.relatedQuestions.map((rq, rqIdx) => (
                        <button
                          key={rqIdx}
                          onClick={() => handleSuggestedClick(rq)}
                          className="text-xs bg-emerald-50/70 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors text-left"
                        >
                          + {rq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-4 bg-white border border-[#E5E0D8] rounded-2xl shadow-sm text-sm text-gray-600 animate-pulse">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>VibeLens is retrieving relevant chunks and synthesizing your grounded answer...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#E5E0D8]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your study notes or interview topics..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-[#FAF8F5]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Ask</span>
              <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
