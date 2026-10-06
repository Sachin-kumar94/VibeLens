import React, { useState } from "react";
import { aiApi, FlashcardItem } from "../../services/aiApi";

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle?: string;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle = "Study Material",
}) => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    try {
      const res = await aiApi.generateFlashcards(documentId, 8);
      setCards(res);
    } catch (err: any) {
      setError(err?.message || "Failed to generate flashcards from this document.");
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIndex];

  const handleRate = (status: "NEEDS_PRACTICE" | "LEARNING" | "MASTERED") => {
    if (!currentCard) return;
    setRatings((prev) => ({ ...prev, [currentCard.id]: status }));
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🗂️
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#15171A]">
                AI Flashcards — {documentTitle}
              </h2>
              <p className="text-xs text-[#6B7280]">
                High-yield technical concept flashcards with quick recall checks
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
        <div className="flex-1 p-6 flex flex-col justify-center items-center overflow-y-auto">
          {cards.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <h3 className="text-base font-serif font-semibold text-[#15171A] mb-2">
                Generate 8 Interactive Flashcards
              </h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto mb-6">
                Extracts definitions, architectural patterns, and interview trade-offs directly from {documentTitle}.
              </p>
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
              >
                Generate Flashcards Now →
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600">
                Extracting core concepts and formatting flashcards...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs w-full">
              {error}
            </div>
          )}

          {currentCard && !loading && (
            <div className="w-full space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {currentCard.topic || "Core Concept"}
                </span>
              </div>

              {/* Flashcard Area */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[220px] bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-md cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between select-none relative group"
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center justify-between">
                  <span>{isFlipped ? "Concept / Answer" : "Question / Term"}</span>
                  <span className="text-amber-600 group-hover:underline">
                    {isFlipped ? "Click to view front" : "Click to flip ↷"}
                  </span>
                </div>

                <div className="my-auto py-4 text-center">
                  {!isFlipped ? (
                    <h3 className="text-base font-serif font-bold text-[#15171A] leading-relaxed">
                      {currentCard.front}
                    </h3>
                  ) : (
                    <div className="text-sm text-gray-800 leading-relaxed font-sans text-left">
                      {currentCard.back}
                    </div>
                  )}
                </div>

                {currentCard.citation && (
                  <div className="pt-3 border-t border-[#F0EBE1] text-[11px] text-gray-500 flex items-center justify-between">
                    <span>Citation:</span>
                    <span className="font-medium text-amber-800">{currentCard.citation}</span>
                  </div>
                )}
              </div>

              {/* Rating Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRate("NEEDS_PRACTICE")}
                  className="p-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-800 text-xs font-medium transition-colors"
                >
                  ⚠️ Needs Practice
                </button>
                <button
                  onClick={() => handleRate("LEARNING")}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-800 text-xs font-medium transition-colors"
                >
                  ⚡ Learning
                </button>
                <button
                  onClick={() => handleRate("MASTERED")}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition-colors"
                >
                  ✓ Mastered
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {cards.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-[#E5E0D8] flex items-center justify-between">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex((p) => Math.max(0, p - 1));
              }}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 border border-[#D1D5DB] rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">
              Space / Click to Flip
            </span>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex((p) => Math.min(cards.length - 1, p + 1));
              }}
              disabled={currentIndex === cards.length - 1}
              className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
