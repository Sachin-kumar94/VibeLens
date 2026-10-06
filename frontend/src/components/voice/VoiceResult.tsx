import React, { useState } from "react";
import {
  X,
  Download,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Trash2,
  Share2,
  ShieldCheck,
  FileText,
  Clock,
  TrendingUp,
  HelpCircle,
  BarChart2
} from "lucide-react";
import { VoiceAnalysisData } from "../../services/voiceAnalysisApi";
import { AudioPlayer } from "./AudioPlayer";
import { EmotionBreakdown } from "./EmotionBreakdown";
import { VoiceEvidence } from "./VoiceEvidence";
import { VoiceTimeline } from "./VoiceTimeline";
import { TranscriptPanel } from "./TranscriptPanel";
import { CommunicationCoach } from "./CommunicationCoach";

export interface VoiceResultProps {
  analysis: VoiceAnalysisData;
  audioUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeAgain?: () => void;
  onDelete?: (id?: string) => Promise<void> | void;
}

export const VoiceResult: React.FC<VoiceResultProps> = ({
  analysis,
  audioUrl,
  isOpen,
  onClose,
  onAnalyzeAgain,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "transcript" | "coach">("overview");
  const [isSaved, setIsSaved] = useState(true); // default saved by backend
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleExportReport = () => {
    const reportText = `# VibeLens Voice Signal Analysis Report
Session: ${analysis.title}
Date: ${new Date(analysis.timestamp).toLocaleString()}
Modality: Acoustic Signal Intelligence (${analysis.isDemo ? "Demo Insight" : "AI Analyzed"})

==================================================
PRIMARY VOCAL METRICS
==================================================
Primary Emotion: ${analysis.primaryEmotion} (${analysis.primaryEmotionConfidence}%)
Tone: ${analysis.tone}
Vocal Energy: ${analysis.energy} (${analysis.energyScore}/100)
Speaking Pace: ${analysis.wordsPerMinute} WPM (${analysis.speakingRate})
Pause Frequency: ${analysis.pauseFrequency} pauses/min
Average Pitch: ${analysis.pitchHz} Hz (Variation: ${analysis.pitchVariation})
Loudness: ${analysis.loudness}
Clarity Index: ${analysis.clarity}% (${analysis.clarityRating})
Acoustic Signal Quality: ${analysis.signalQualityScore}% (${analysis.signalQuality})
AI Interpretation Confidence: ${analysis.confidence}%

==================================================
EVIDENCE & OBSERVATIONS
==================================================
${analysis.evidence.observedSignals.map((s) => `- ${s}`).join("\n")}

Interpretation:
"${analysis.evidence.aiInterpretation}"

Rationale:
${analysis.evidence.whyThisResult}

==================================================
COMMUNICATION COACHING
==================================================
What Went Well:
${analysis.coach.whatWentWell.map((w) => `+ ${w}`).join("\n")}

Opportunities for Growth:
${analysis.coach.whatToImprove.map((i) => `* ${i}`).join("\n")}

Presentation Delivery Advice:
${analysis.coach.presentationAdvice}

Interview Practice Advice:
${analysis.coach.interviewAdvice}

==================================================
DISCLAIMER
==================================================
VibeLens vocal analytics provide non-diagnostic behavioural and communicative feedback.
Measurements are estimated from acoustic prosody and signal processing algorithms.
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VibeLens-Voice-Analysis-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSeek = (seconds: number) => {
    setSeekTime(seconds);
    // Reset seek state after small delay so subsequent clicks can re-trigger
    setTimeout(() => setSeekTime(null), 100);
  };

  const confirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(analysis.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl border border-[#E6E2D8] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#15171A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#F4F1EA] flex items-center justify-between shrink-0 bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#15171A] tracking-tight">
                Detailed Voice Analysis
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  analysis.isDemo
                    ? "bg-[#F4F1EA] text-[#707582] border border-[#DDD8CD]"
                    : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                }`}
              >
                {analysis.isDemo ? "Demo Insight" : "AI Analyzed"}
              </span>
            </div>
            <p className="text-xs text-[#707582] mt-0.5">
              Recorded session: {analysis.fileName} • {analysis.duration}s duration
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportReport}
              className="p-2 rounded-xl text-[#575A60] hover:text-[#15171A] hover:bg-white transition cursor-pointer border border-transparent hover:border-[#DDD8CD]"
              title="Export Report"
            >
              <Download size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#575A60] hover:text-[#15171A] hover:bg-white transition cursor-pointer border border-transparent hover:border-[#DDD8CD]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Audio Player */}
          {audioUrl && (
            <AudioPlayer
              audioUrl={audioUrl}
              analysisId={analysis.id}
              fileName={analysis.fileName}
              fileSize={analysis.fileSize}
              duration={analysis.duration}
              mimeType={analysis.mimeType}
              externalSeekTime={seekTime}
            />
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F4F1EA] rounded-xl border border-[#DDD8CD] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-white text-[#15171A] shadow-xs"
                  : "text-[#707582] hover:text-[#15171A]"
              }`}
            >
              <BarChart2 size={13} />
              <span>Signals & Evidence</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "timeline"
                  ? "bg-white text-[#15171A] shadow-xs"
                  : "text-[#707582] hover:text-[#15171A]"
              }`}
            >
              <Clock size={13} />
              <span>Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "transcript"
                  ? "bg-white text-[#15171A] shadow-xs"
                  : "text-[#707582] hover:text-[#15171A]"
              }`}
            >
              <FileText size={13} />
              <span>Transcript</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("coach")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "coach"
                  ? "bg-white text-[#15171A] shadow-xs"
                  : "text-[#707582] hover:text-[#15171A]"
              }`}
            >
              <TrendingUp size={13} />
              <span>Coach</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <EmotionBreakdown emotions={analysis.emotionDistribution} />
              <VoiceEvidence
                evidence={analysis.evidence}
                confidence={analysis.confidence}
                signalQualityScore={analysis.signalQualityScore}
              />
            </div>
          )}

          {activeTab === "timeline" && (
            <VoiceTimeline
              timeline={analysis.timeline}
              segments={analysis.speechSegments}
              onSeek={handleSeek}
            />
          )}

          {activeTab === "transcript" && (
            <TranscriptPanel
              transcript={analysis.transcript}
              fillerWords={analysis.fillerWords}
              onSeek={handleSeek}
            />
          )}

          {activeTab === "coach" && (
            <CommunicationCoach coach={analysis.coach} />
          )}

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] text-xs text-[#707582] leading-relaxed">
            <span className="font-semibold text-[#15171A] block mb-0.5">
              Privacy & Retention
            </span>
            Your recording is stored securely with your VibeLens account. You can permanently delete this recording and its analysis data anytime.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#F4F1EA] bg-[#FAF8F5] shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSaved(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD8CD] font-semibold text-[#15171A] hover:bg-[#F4F1EA] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <BookmarkCheck size={14} className="text-[#10B981]" />
              <span>{isSaved ? "Saved to History" : "Save Analysis"}</span>
            </button>

            {onAnalyzeAgain && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAnalyzeAgain();
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD8CD] font-semibold text-[#15171A] hover:bg-[#F4F1EA] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw size={14} />
                <span>Analyze Again</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-rose-600 font-medium">Delete permanently?</span>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD8CD] text-[#15171A] hover:bg-[#F4F1EA] transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl text-[#707582] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Delete this analysis"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white font-semibold cursor-pointer transition shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
