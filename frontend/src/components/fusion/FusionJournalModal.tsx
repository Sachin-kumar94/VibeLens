import React, { useState } from "react";
import { X, BookOpen, Check, AlertCircle, Loader2 } from "lucide-react";
import { api } from "../../services/api";

export interface FusionJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  onSuccess: () => void;
}

export const FusionJournalModal: React.FC<FusionJournalModalProps> = ({
  isOpen,
  onClose,
  result,
  onSuccess,
}) => {
  const [userNote, setUserNote] = useState(
    `Synthesized multimodal session for ${result?.context || "presentation"} with ${
      result?.agreementScore || 88
    }% consistency.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !result) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const fusionId = result.id || result.fusionRecordId;
      if (fusionId) {
        await api.addFusionToJournal(fusionId, userNote);
      } else {
        await api.createJournalEntry({
          vibe: result.overallVibe || "Unified Communication",
          emotion: `${result.agreementScore || 88}% Cross-Modal Consistency`,
          confidence: result.confidence || 88,
          context: result.context || "Multimodal Session",
          userNote,
          sourceMode: "fusion",
          signalsObserved: result.convergentSignals || ["Cross-Modal Alignment Verified"],
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save journal entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[460px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E6E2D8] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#A855F7]" />
            <h3 className="text-sm font-semibold text-[#15171A]">Add to Vibe Journal</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#707582] hover:text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD8CD] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#15171A]">{result.title}</span>
              <span className="font-mono text-[#059669] font-bold">
                {result.agreementScore}% Agreement
              </span>
            </div>
            <p className="text-[11px] text-[#707582]">
              Context: {result.context || "General"} · Modalities: {result.modalityCount || 3}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#15171A]">
              Personal Reflection Note
            </label>
            <textarea
              rows={4}
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Add your thoughts or takeaways from this session..."
              className="w-full bg-[#FAF8F5] border border-[#DDD8CD] rounded-xl p-3 text-xs text-[#15171A] outline-hidden focus:border-[#15171A] transition resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E6E2D8] bg-[#FAF8F5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#525866] hover:bg-[#EAE5D9] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            <span>Save to Journal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
