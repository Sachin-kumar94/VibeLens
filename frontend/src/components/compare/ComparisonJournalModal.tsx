import React, { useState } from "react";
import { BookOpen, CheckCircle2, Sparkles, X } from "lucide-react";
import { Modal } from "../ui/Modal";
import { api } from "../../services/api";

interface ComparisonJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  onSuccess: () => void;
}

export const ComparisonJournalModal: React.FC<ComparisonJournalModalProps> = ({
  isOpen,
  onClose,
  result,
  onSuccess,
}) => {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!result) return null;

  const { sessionA, sessionB, summary } = result;

  const handleSaveToJournal = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.createJournalEntry({
        date: new Date().toISOString(),
        vibe: summary.vibeProgression,
        emotion: sessionA.emotion || "Comparative Alignment",
        confidence: sessionA.confidence || 85,
        context: `Session Delta: ${sessionB.title} vs ${sessionA.title}`,
        userNote: note.trim()
          ? `${note.trim()}\n\n[Comparison Synthesis: ${summary.mainChange} (${summary.confidenceDeltaFormatted})]`
          : `Side-by-side session comparison recorded between ${sessionB.title} and ${sessionA.title}.\n${summary.mainChange} (${summary.confidenceDeltaFormatted}).`,
        signalsObserved: [
          `Confidence shift: ${summary.confidenceDeltaFormatted}`,
          `Signal quality: ${summary.signalQualityDeltaFormatted}`,
          `Comparability: ${summary.comparisonQuality}`,
        ],
        sourceMode: "compare",
        analysisId: sessionA.id,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save reflection to Journal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Comparison to Journal"
      subtitle="Reflect on what changed between your sessions and save notes to your personal timeline."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Quick Context Card */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1 text-xs">
          <div className="flex items-center justify-between text-[#8C8983] font-mono text-[10px]">
            <span>MOMENT B → MOMENT A</span>
            <span className="text-[#10B981] font-semibold">{summary.confidenceDeltaFormatted}</span>
          </div>
          <p className="font-bold text-[#15171A]">
            {sessionB.title} → {sessionA.title}
          </p>
          <p className="text-[11px] text-[#575A60]">
            {summary.mainChange}
          </p>
        </div>

        {/* User Note Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#15171A] block">
            Personal Reflection / Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="What were you practicing or testing between these two sessions? (e.g. slowing down speech cadence, adjusting posture)..."
            className="w-full p-3 rounded-xl bg-white border border-[#DDD7CB] text-xs text-[#15171A] placeholder-[#8C8983] outline-hidden focus:border-[#15171A] resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DDD7CB]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#DDD7CB] text-xs font-medium text-[#15171A] hover:bg-[#FAF8F5] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveToJournal}
            className="px-4 py-2 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <BookOpen size={13} className="text-[#A855F7]" />
            <span>{isSubmitting ? "Saving..." : "Save to Journal"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
