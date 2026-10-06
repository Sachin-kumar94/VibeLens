import React from "react";
import { Clock } from "lucide-react";

interface RecordingTimerProps {
  seconds: number;
  maxSeconds?: number;
  isRecording: boolean;
  isPaused?: boolean;
}

export const RecordingTimer: React.FC<RecordingTimerProps> = ({
  seconds,
  maxSeconds = 120,
  isRecording,
  isPaused = false,
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isNearLimit = seconds >= maxSeconds - 15;
  const isAtLimit = seconds >= maxSeconds;

  return (
    <div className="flex flex-col items-center justify-center space-y-1">
      <div className="flex items-center gap-2 font-mono text-sm font-semibold text-[#15171A]">
        {isRecording && (
          <span
            className={`w-2 h-2 rounded-full ${
              isPaused
                ? "bg-amber-400"
                : "bg-rose-500 animate-ping"
            }`}
          />
        )}
        <span>{formatTime(seconds)}</span>
        <span className="text-[#8C8983]"> / {formatTime(maxSeconds)}</span>
      </div>

      {isNearLimit && !isAtLimit && isRecording && (
        <span className="text-[11px] text-amber-600 font-medium">
          Approaching 2-minute recording limit
        </span>
      )}

      {isAtLimit && (
        <span className="text-[11px] text-rose-600 font-medium">
          Maximum recording length reached.
        </span>
      )}
    </div>
  );
};
