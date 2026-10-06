import React from "react";
import {
  Activity,
  Volume2,
  Camera,
  UserCheck,
  Clock,
  Eye,
  AlertCircle,
} from "lucide-react";

interface LiveSignalsPanelProps {
  elapsedSeconds: number;
  targetTimeMin: number;
  targetTimeMax: number;
  wpm: number;
  speechActivity: "Speaking" | "Pause" | "Silence";
  audioLevel: number;
  framingStatus?: "Good" | "Fair" | "Poor" | string;
  postureSignal?: string;
  cameraFacingSignal?: string;
  hasVisualData: boolean;
}

export const LiveSignalsPanel: React.FC<LiveSignalsPanelProps> = ({
  elapsedSeconds,
  targetTimeMin,
  targetTimeMax,
  wpm,
  speechActivity,
  audioLevel,
  framingStatus = "Good",
  postureSignal = "Upright",
  cameraFacingSignal = "Good",
  hasVisualData,
}) => {
  // Pacing evaluation (no good/bad label)
  const getPaceState = () => {
    if (elapsedSeconds < 5 || wpm === 0) {
      return { text: "Insufficient data", color: "text-[#73716B] bg-[#FAF8F5]" };
    }
    if (wpm >= 125 && wpm <= 165) {
      return { text: "Within target", color: "text-emerald-700 bg-emerald-50" };
    }
    if (wpm > 165) {
      return { text: "Above target", color: "text-amber-700 bg-amber-50" };
    }
    return { text: "Below target", color: "text-blue-700 bg-blue-50" };
  };

  const paceState = getPaceState();

  // Duration adherence
  const isWithinDuration = elapsedSeconds >= targetTimeMin && elapsedSeconds <= targetTimeMax;
  const isPastMax = elapsedSeconds > targetTimeMax;

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-xl p-4 shadow-sm space-y-3.5 text-xs">
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2.5">
        <span className="font-serif font-semibold text-[#15171A] flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-[#525E50]" />
          <span>Live Signal Monitor</span>
        </span>
        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
          <Clock className="w-3 h-3 text-[#73716B]" />
          <span className={`font-semibold ${isPastMax ? "text-amber-600" : isWithinDuration ? "text-emerald-600" : "text-[#15171A]"}`}>
            {formatSec(elapsedSeconds)}
          </span>
          <span className="text-[#A3A099]">/</span>
          <span className="text-[#73716B]">{formatSec(targetTimeMin)}–{formatSec(targetTimeMax)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Speaking Pace */}
        <div className="p-2.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] flex flex-col justify-between">
          <span className="text-[11px] text-[#73716B]">Tempo (Pace)</span>
          <div className="mt-1">
            <span className="font-mono font-semibold text-sm text-[#15171A]">
              {wpm > 0 ? `${wpm} WPM` : "— WPM"}
            </span>
            <span className={`block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded w-fit ${paceState.color}`}>
              {paceState.text}
            </span>
          </div>
        </div>

        {/* Audio Activity */}
        <div className="p-2.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#73716B]">Audio Level</span>
            <Volume2 className="w-3 h-3 text-[#73716B]" />
          </div>
          <div className="mt-1">
            <span className="font-semibold text-xs text-[#15171A]">{speechActivity}</span>
            <div className="mt-1.5 w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#525E50] transition-all duration-75"
                style={{ width: `${Math.min(100, audioLevel)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Framing & Lighting */}
        <div className="p-2.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#73716B]">Framing</span>
            <Camera className="w-3 h-3 text-[#73716B]" />
          </div>
          <div className="mt-1">
            <span className="font-semibold text-xs text-[#15171A]">
              {hasVisualData ? framingStatus : "Audio Mode"}
            </span>
            <span className="block mt-0.5 text-[10px] text-[#73716B]">
              {hasVisualData ? "Portrait Alignment" : "Camera off"}
            </span>
          </div>
        </div>

        {/* Posture & Gaze */}
        <div className="p-2.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#73716B]">Presence</span>
            <UserCheck className="w-3 h-3 text-[#73716B]" />
          </div>
          <div className="mt-1">
            <span className="font-semibold text-xs text-[#15171A]">
              {hasVisualData ? postureSignal : "Audio Only"}
            </span>
            <span className="block mt-0.5 text-[10px] text-[#73716B]">
              {hasVisualData ? `Gaze: ${cameraFacingSignal}` : "Speech only"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
