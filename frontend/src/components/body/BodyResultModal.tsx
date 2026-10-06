import React, { useState } from "react";
import {
  X,
  Sparkles,
  Presentation,
  Trash2,
  Download,
  Calendar,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  CheckCircle2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { BodyAnalysisResponse } from "../../services/bodyAnalysisApi";
import { BodyEvidence } from "./BodyEvidence";
import { BodyCoaching } from "./BodyCoaching";

interface BodyResultModalProps {
  analysis: BodyAnalysisResponse;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onNavigate?: (path: string) => void;
}

export const BodyResultModal: React.FC<BodyResultModalProps> = ({
  analysis,
  isOpen,
  onClose,
  onDelete,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<"evidence" | "coach">("evidence");
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this body analysis?")) {
      if (onDelete) onDelete(analysis.id);
      onClose();
    }
  };

  const handleExportSummary = () => {
    const summaryText = `VibeLens Body Language Analysis Report
Date: ${new Date(analysis.timestamp).toLocaleString()}
Title: ${analysis.title}
Mode: ${analysis.captureMode}
----------------------------------------
Posture: ${analysis.posture.state} (${analysis.posture.score}/100)
Gaze: ${analysis.gaze.direction} (${analysis.gaze.score}/100)
Gestures: ${analysis.gestures.activity} (${analysis.gestures.openness})
Engagement: ${analysis.engagement.level} (${analysis.engagement.score}/100)
Movement Stability: ${analysis.movementStability.stability} (${analysis.movementStability.score}/100)
Model Confidence: ${analysis.confidence}%
Signal Quality: ${analysis.signalQuality.score}%
----------------------------------------
Observations:
${analysis.observations.map((o) => `• ${o}`).join("\n")}
----------------------------------------
Coaching Highlights:
What Went Well:
${analysis.coach.whatWentWell.map((w) => `• ${w}`).join("\n")}
What to Improve:
${analysis.coach.whatToImprove.map((w) => `• ${w}`).join("\n")}
Next Practice:
${analysis.coach.nextPractice.map((w) => `• ${w}`).join("\n")}
`;

    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibelens_body_report_${analysis.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#E6E2D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#E8E4DA] flex items-center justify-between gap-4 bg-[#FAF8F5]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#15171A] text-white text-[10px] font-mono font-semibold uppercase">
                {analysis.captureMode}
              </span>
              <span className="text-xs text-[#707582] flex items-center gap-1 font-mono">
                <Calendar size={12} />
                {new Date(analysis.timestamp).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#15171A]">{analysis.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSummary}
              className="p-2 rounded-xl text-[#707582] hover:text-[#15171A] hover:bg-white border border-transparent hover:border-[#DDD8CD] transition cursor-pointer"
              title="Export Report Summary"
            >
              <Download size={16} />
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-xl text-[#707582] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                title="Delete Analysis"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#707582] hover:text-[#15171A] hover:bg-white border border-transparent hover:border-[#DDD8CD] transition cursor-pointer"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Grid: Portrait Image (Left) + Detail Tabs (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Portrait Snapshot */}
            <div className="md:col-span-5 flex flex-col items-center space-y-3">
              <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-[#121316] border border-[#DDD8CD] shadow-sm">
                {analysis.imageUrl ? (
                  <img
                    src={analysis.imageUrl}
                    alt="Body Analysis Snapshot"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    Portrait image archive
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-mono">
                  9:16 Portrait
                </div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate("/history");
                  }}
                  className="w-full max-w-[280px] py-2 rounded-xl border border-[#DDD8CD] hover:bg-[#F4F1EA] text-xs font-semibold text-[#15171A] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>View in History Archive</span>
                </button>
              )}
            </div>

            {/* Right Column: Tabbed Evidence & Coaching */}
            <div className="md:col-span-7 space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 p-1 bg-[#F4F1EA] rounded-xl border border-[#DDD8CD] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("evidence")}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "evidence"
                      ? "bg-white text-[#15171A] shadow-xs"
                      : "text-[#707582] hover:text-[#15171A]"
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Signals & Evidence</span>
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
                  <Presentation size={13} />
                  <span>Presentation Coach</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "evidence" && (
                <BodyEvidence
                  evidence={analysis.evidence}
                  signalQuality={analysis.signalQuality}
                />
              )}

              {activeTab === "coach" && (
                <BodyCoaching
                  coach={analysis.coach}
                  onNavigateToPresentationCoach={
                    onNavigate
                      ? () => {
                          onClose();
                          onNavigate("/presentation-coach");
                        }
                      : undefined
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
