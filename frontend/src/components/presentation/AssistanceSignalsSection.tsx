import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Info,
  Clock,
  Eye,
  AlertCircle,
  Lock,
  Download,
  Trash2,
  FileCheck,
} from "lucide-react";
import { PresentationIntegrityEventItem } from "../../services/presentationCoachApi";

interface AssistanceSignalsSectionProps {
  events: PresentationIntegrityEventItem[];
  faceVisiblePercentage?: number;
  multipleFacesObserved?: boolean;
  audioInterruptionCount?: number;
  onSaveRecording?: () => void;
  onSaveAnalysisOnly?: () => void;
  onDeleteRecording?: () => void;
  hasRecording?: boolean;
}

export const AssistanceSignalsSection: React.FC<AssistanceSignalsSectionProps> = ({
  events = [],
  faceVisiblePercentage = 95,
  multipleFacesObserved = false,
  audioInterruptionCount = 0,
  onSaveRecording,
  onSaveAnalysisOnly,
  onDeleteRecording,
  hasRecording = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Compute summary stats
  const focusChanges = events.filter(
    (e) => e.type === "WINDOW_BLUR" || e.type === "TAB_HIDDEN" || e.type === "FOCUS_LOST"
  ).length;

  const fullscreenExits = events.filter((e) => e.type === "FULLSCREEN_EXIT").length;

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="rounded-2xl bg-white border border-[#DDD7CB] overflow-hidden shadow-2xs transition-all">
      {/* Collapsed Header / Trigger Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]/80 transition select-none"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-center text-[#8C8983]">
            <ShieldCheck size={16} className="text-[#575A60]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#15171A] font-bold">
                Assistance & Integrity Signals
              </h3>
              <span className="text-[10px] font-mono text-[#8C8983] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#DDD7CB]">
                {events.length} observable event{events.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-[#575A60] mt-0.5">
              Observable session events that may affect rehearsal quality. Secondary diagnostic summary.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8C8983]">
          <span>{isExpanded ? "Collapse" : "View signals"}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 pt-2 border-t border-[#DDD7CB] space-y-6">
          {/* Observable Event Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] uppercase block">Focus Changes</span>
              <span className="text-lg font-bold font-serif text-[#15171A] mt-0.5 block">
                {focusChanges}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Tab or window unfocused
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] uppercase block">Fullscreen Exits</span>
              <span className="text-lg font-bold font-serif text-[#15171A] mt-0.5 block">
                {fullscreenExits}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Display mode changes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] uppercase block">Face Visible</span>
              <span className="text-lg font-bold font-serif text-[#10B981] mt-0.5 block">
                {faceVisiblePercentage}%
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Session duration
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] uppercase block">Multiple Faces</span>
              <span className="text-lg font-bold font-serif text-[#15171A] mt-0.5 block">
                {multipleFacesObserved ? "Observed" : "None"}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                In-frame co-presence
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] uppercase block">Audio Gaps</span>
              <span className="text-lg font-bold font-serif text-[#15171A] mt-0.5 block">
                {audioInterruptionCount}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Hardware interruptions
              </span>
            </div>
          </div>

          {/* Educational Note & Disclaimer */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#15171A] flex items-center gap-1.5">
                <Info size={14} className="text-[#3B82F6]" />
                Why am I seeing this?
              </span>
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-[11px] font-mono text-[#8C8983] hover:text-[#15171A] underline cursor-pointer"
              >
                {showExplanation ? "Hide explanation" : "Read guideline"}
              </button>
            </div>
            <p className="text-xs text-[#575A60] leading-relaxed">
              These are observable session events recorded by browser sensors during your rehearsal.
              They can occur accidentally (such as checking presentation slides, adjusting camera angle, or receiving system notifications).
              They do <strong>not</strong> establish cheating, dishonesty, or AI-generated delivery.
            </p>
            {showExplanation && (
              <div className="pt-2 border-t border-[#DDD7CB] text-xs text-[#575A60] space-y-1.5 animate-fade-in">
                <p>
                  <strong>Session Integrity Philosophy:</strong> VibeLens is a practice tool engineered to help you rehearse with confidence.
                  Observable events are logged purely to contextualize visual feedback and acoustic continuity metrics.
                </p>
                <p>
                  We do not produce speculative AI-detection percentages or cheating verdicts, as web camera streams and browser events cannot reliably infer human intention.
                </p>
              </div>
            )}
          </div>

          {/* Observable Event Log Table */}
          {events.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8C8983] block">
                Observable Event Log
              </span>
              <div className="border border-[#DDD7CB] rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DDD7CB] bg-[#FAF8F5] text-[#8C8983] font-mono text-[10px] uppercase">
                      <th className="py-2 px-3">Event Type</th>
                      <th className="py-2 px-3">Timestamp</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD7CB]/60">
                    {events.map((evt, idx) => (
                      <tr key={evt.id || idx} className="hover:bg-[#FAF8F5]/60 transition">
                        <td className="py-2 px-3 font-semibold text-[#15171A] font-mono">
                          {evt.type.replace(/_/g, " ")}
                        </td>
                        <td className="py-2 px-3 text-[#575A60] font-mono">
                          {formatSec(evt.timestamp)}
                        </td>
                        <td className="py-2 px-3 text-[#575A60] font-mono">
                          {evt.duration ? `${evt.duration}s` : "Instantaneous"}
                        </td>
                        <td className="py-2 px-3 text-[#8C8983] font-mono text-[11px]">
                          {evt.source || "client_sensor"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-3 text-xs text-[#575A60] bg-[#FAF8F5] rounded-xl border border-[#DDD7CB] text-center font-mono">
              No off-target or interruption events recorded during this session.
            </div>
          )}

          {/* Privacy & User Control Actions */}
          <div className="p-4 rounded-xl bg-white border border-[#DDD7CB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-[#575A60]">
              <Lock size={15} className="text-[#10B981] shrink-0" />
              <span>
                Camera and microphone were active only during the rehearsal session. Recordings and analysis belong to your account.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {hasRecording && onSaveRecording && (
                <button
                  type="button"
                  onClick={onSaveRecording}
                  className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download size={12} />
                  <span>Save Recording</span>
                </button>
              )}

              {onSaveAnalysisOnly && (
                <button
                  type="button"
                  onClick={onSaveAnalysisOnly}
                  className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileCheck size={12} />
                  <span>Save Analysis Only</span>
                </button>
              )}

              {hasRecording && onDeleteRecording && (
                <button
                  type="button"
                  onClick={onDeleteRecording}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Delete Media</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
