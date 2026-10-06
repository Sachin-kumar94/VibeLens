import React, { useState } from "react";
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Code,
  Video,
  Music,
  CheckCircle2,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { CoachingEvaluation, SavedPresentationSession } from "../../services/presentationCoachApi";

interface PresentationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Partial<SavedPresentationSession>;
  evaluation: CoachingEvaluation;
  videoBlob: Blob | null;
  audioBlob: Blob | null;
}

export const PresentationExportModal: React.FC<PresentationExportModalProps> = ({
  isOpen,
  onClose,
  session,
  evaluation,
  videoBlob,
  audioBlob,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const data = {
      product: "VibeLens Presentation Practice Report",
      generatedAt: new Date().toISOString(),
      session: {
        title: session.title,
        context: session.context,
        durationSeconds: session.duration,
        targetPaceMin: session.targetPaceMin,
        targetPaceMax: session.targetPaceMax,
        measuredPaceWpm: session.pace,
        pauseCount: session.pauseCount,
        avgPauseDuration: session.avgPauseDuration,
        fillerCount: session.fillerCount,
        cameraEngagement: session.cameraEngagement,
        postureAlignment: session.posture,
        signalQuality: session.signalQuality,
        transcript: session.transcript,
      },
      evaluation: {
        deliveryScore: evaluation.deliveryScore,
        visualPresenceScore: evaluation.visualPresenceScore,
        vocalDeliveryScore: evaluation.vocalDeliveryScore,
        signalQualityScore: evaluation.signalQualityScore,
        overallScore: evaluation.overallScore,
        recommendations: evaluation.recommendations,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        practicePlan: evaluation.practicePlan,
      },
      disclaimer:
        "Presentation feedback is based on observable audio, video and interaction signals and is intended for practice, not psychological or medical assessment.",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const rows = [
      ["Metric", "Value", "Target", "Status"],
      ["Session Title", `"${session.title || "Presentation Rehearsal"}"`, "-", "Completed"],
      ["Context", `"${session.context || "General"}"`, "-", "Completed"],
      ["Duration (seconds)", session.duration || 0, session.targetDuration || 300, "Completed"],
      ["Speaking Pace (WPM)", session.pace || 0, `${session.targetPaceMin || 140}-${session.targetPaceMax || 150}`, evaluation.paceStatus],
      ["Pause Count", session.pauseCount || 0, "-", "Completed"],
      ["Average Pause (s)", (session.avgPauseDuration || 0).toFixed(1), "-", "Completed"],
      ["Camera Engagement (%)", session.cameraEngagement || 0, "80%+", "Measured"],
      ["Posture Alignment (%)", session.posture || 0, "80%+", "Measured"],
      ["Overall Score", evaluation.overallScore, "-", "Evaluated"],
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation-metrics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadVideo = () => {
    if (!videoBlob) return;
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation-rehearsal-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation-audio-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#FAF8F5] rounded-2xl border border-[#DDD7CB] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD7CB] bg-white">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-[#10B981]" />
            <h3 className="font-serif font-bold text-base text-[#15171A]">
              Export Presentation Report
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#8C8983] hover:text-[#15171A] transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Format Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-4 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#15171A] text-left transition flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-[#FAF8F5] text-[#15171A] group-hover:bg-[#15171A] group-hover:text-white transition">
                <Printer size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#15171A] block">PDF / Print</span>
                <span className="text-[11px] text-[#575A60] block mt-0.5">
                  Clean printable report with diagnostics & tips
                </span>
              </div>
            </button>

            {/* CSV Data */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="p-4 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#15171A] text-left transition flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-[#FAF8F5] text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#15171A] block">CSV Spreadsheet</span>
                <span className="text-[11px] text-[#575A60] block mt-0.5">
                  Raw pacing, pause, and kinematic scores
                </span>
              </div>
            </button>

            {/* JSON Schema */}
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="p-4 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#15171A] text-left transition flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-[#FAF8F5] text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <Code size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#15171A] block">Full JSON</span>
                <span className="text-[11px] text-[#575A60] block mt-0.5">
                  Complete machine-readable payload
                </span>
              </div>
            </button>

            {/* Recorded Media Download */}
            {videoBlob && (
              <button
                type="button"
                onClick={handleDownloadVideo}
                className="p-4 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#15171A] text-left transition flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-[#FAF8F5] text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition">
                  <Video size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#15171A] block">Download Video</span>
                  <span className="text-[11px] text-[#575A60] block mt-0.5">
                    Original .webm recording
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Ethical Disclaimer */}
          <div className="p-3.5 rounded-xl bg-white border border-[#DDD7CB] text-[11px] text-[#575A60] flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-[#10B981] shrink-0 mt-0.5" />
            <span>
              Presentation feedback is based on observable audio, video, and pacing signals and is intended for rehearsal practice, not psychological or medical assessment.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DDD7CB] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#575A60] hover:text-[#15171A] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
