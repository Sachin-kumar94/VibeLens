import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  HelpCircle,
  Lock,
} from "lucide-react";
import { IntegrityEvent, IntegritySummary } from "../../hooks/useIntegritySignals";

interface IntegritySignalsPanelProps {
  summary?: IntegritySummary;
  events?: IntegrityEvent[];
  faceVisiblePercent?: number;
}

export const IntegritySignalsPanel: React.FC<IntegritySignalsPanelProps> = ({
  summary,
  events = [],
  faceVisiblePercent = 95,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWhyHelp, setShowWhyHelp] = useState(false);

  const activeSummary: IntegritySummary = summary || {
    eventCount: events.length,
    focusChanges: events.filter((e) => e.type === "WINDOW_BLUR" || e.type === "PAGE_HIDDEN" || e.type === "TAB_SWITCH").length,
    pageHiddenSeconds: 0,
    pasteEvents: events.filter((e) => e.type === "PASTE_DURING_ANSWER").length,
    copyEvents: events.filter((e) => e.type === "COPY_DURING_ANSWER").length,
    fullscreenExits: events.filter((e) => e.type === "FULLSCREEN_EXIT").length,
    interruptions: events.filter((e) => e.type === "CAMERA_LOST" || e.type === "MICROPHONE_DISCONNECTED" || e.type === "NETWORK_INTERRUPT").length,
    networkLossCount: events.filter((e) => e.type === "NETWORK_INTERRUPT").length,
    totalEvents: events.length,
  };

  const hasMultipleFaces = events.some((e) => e.type === "MULTIPLE_FACES_DETECTED");

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "TAB_SWITCH":
        return "Tab Switch (Window Focus Regained)";
      case "PAGE_HIDDEN":
        return "Browser Tab Hidden";
      case "WINDOW_BLUR":
        return "Window Focus Shifted";
      case "PASTE_DURING_ANSWER":
        return "Text Paste Event";
      case "COPY_DURING_ANSWER":
        return "Text Copy Event";
      case "FULLSCREEN_EXIT":
        return "Fullscreen Mode Exited";
      case "CAMERA_LOST":
        return "Camera Disconnected";
      case "MICROPHONE_DISCONNECTED":
        return "Microphone Disconnected";
      case "NETWORK_INTERRUPT":
        return "Network Interruption";
      case "MULTIPLE_FACES_DETECTED":
        return "Multiple faces visible for part of the session";
      default:
        return type.replace(/_/g, " ");
    }
  };

  return (
    <div className="bg-white border border-[#DDD7CB] rounded-2xl p-4 text-xs space-y-3">
      {/* Header - Collapsed by default per Req 45 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-left cursor-pointer group"
        >
          {activeSummary.focusChanges === 0 && activeSummary.interruptions === 0 ? (
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          )}
          <div>
            <span className="font-serif font-semibold text-[#15171A] group-hover:text-[#525E50] transition-colors block">
              Assistance & Integrity Signals
            </span>
            <span className="text-[11px] text-[#7D7971] block">
              Observable session events that may affect practice-session quality.
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-lg hover:bg-[#FAF8F5] text-[#7D7971] cursor-pointer transition"
          aria-label={isOpen ? "Collapse panel" : "Expand panel"}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="pt-2 border-t border-[#DDD7CB]/70 space-y-4 animate-in fade-in">
          {/* Signal Summary Metrics Table per Req 46 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
              <span className="text-[#575A60]">Focus changes</span>
              <strong className="font-mono text-[#15171A]">{activeSummary.focusChanges}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
              <span className="text-[#575A60]">Fullscreen exits</span>
              <strong className="font-mono text-[#15171A]">{activeSummary.fullscreenExits}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
              <span className="text-[#575A60]">Face visible</span>
              <strong className="font-mono text-[#15171A]">{faceVisiblePercent}%</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
              <span className="text-[#575A60]">Multiple faces</span>
              <strong className="font-mono text-[#15171A]">
                {hasMultipleFaces ? "Detected" : "None"}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
              <span className="text-[#575A60]">Audio interruptions</span>
              <strong className="font-mono text-[#15171A]">{activeSummary.interruptions}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-between">
              <span className="text-[#575A60]">Paste events</span>
              <strong className="font-mono text-[#15171A]">{activeSummary.pasteEvents}</strong>
            </div>
          </div>

          {/* Important Disclaimer per Req 47 */}
          <div className="flex items-start space-x-2 text-[11px] text-[#7D7971] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#DDD7CB]/70">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#7D7971]" />
            <p className="leading-relaxed">
              These are observable interaction signals, not a determination of cheating or AI use.
            </p>
          </div>

          {/* Why am I seeing this? Help toggle per Req 48 & 49 */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setShowWhyHelp(!showWhyHelp)}
              className="text-[11px] font-semibold text-[#525E50] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle size={12} />
              <span>{showWhyHelp ? "Hide explanation" : "Why am I seeing this?"}</span>
            </button>

            {showWhyHelp && (
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1.5 text-[11px] text-[#575A60] leading-relaxed animate-in fade-in">
                <p>• Tab switches may happen accidentally during multitasking.</p>
                <p>• Camera or microphone loss can result from hardware or browser permissions.</p>
                <p>• Multiple faces can occur if another person briefly enters your background.</p>
                <p>• These events are recorded solely to help you observe distractions and do not prove misconduct.</p>
                <p className="pt-1 text-[#7D7971] flex items-center gap-1">
                  <Lock size={11} />
                  <span>Camera & mic are active only during recording. All signals belong to your account and can be deleted.</span>
                </p>
              </div>
            )}
          </div>

          {/* Detailed Event Log if any events exist */}
          {events.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7D7971] block">
                Recorded Event Log ({events.length})
              </span>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 bg-[#FAF8F5] border border-[#DDD7CB]/60 rounded-lg text-[11px]"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-[#7D7971]" />
                      <span className="font-mono text-[#7D7971]">{formatSec(evt.timestamp)}</span>
                      <span className="text-[#15171A]">{getEventLabel(evt.type)}</span>
                    </div>
                    {evt.duration !== undefined && evt.duration > 0 && (
                      <span className="font-mono text-[10px] text-[#7D7971]">
                        {evt.duration.toFixed(1)}s
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
