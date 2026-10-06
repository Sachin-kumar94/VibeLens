import React from "react";
import { Mic, Square, Pause, Play, RotateCcw, ChevronDown, Loader2 } from "lucide-react";
import { RecorderState, InputDeviceInfo } from "../../hooks/useVoiceRecorder";

interface RecordingControlsProps {
  state: RecorderState;
  isRecording: boolean;
  isPaused: boolean;
  disabled?: boolean;
  inputDevices?: InputDeviceInfo[];
  selectedDeviceId?: string;
  onSelectDevice?: (deviceId: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  state,
  isRecording,
  isPaused,
  disabled = false,
  inputDevices = [],
  selectedDeviceId,
  onSelectDevice,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 pt-2">
      {/* Recording Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        {state === "RECORDING" || state === "PAUSED" ? (
          <>
            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={isPaused ? onResume : onPause}
              className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD8CD] hover:bg-white text-[#15171A] flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
              title={isPaused ? "Resume Recording" : "Pause Recording"}
              aria-label={isPaused ? "Resume Recording" : "Pause Recording"}
            >
              {isPaused ? (
                <Play size={18} className="ml-0.5 text-[#10B981] fill-current" />
              ) : (
                <Pause size={18} />
              )}
            </button>

            {/* Stop Recording Button */}
            <button
              type="button"
              onClick={onStop}
              className="w-16 h-16 rounded-full bg-[#15171A] hover:bg-black text-white flex items-center justify-center transition cursor-pointer shadow-md hover:scale-105 group relative active:scale-95"
              title="Stop Recording"
              aria-label="Stop Recording"
            >
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              <Square size={20} className="fill-current text-white" />
            </button>
          </>
        ) : state === "STOPPING" ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF8F5] border border-[#DDD8CD] text-xs font-semibold text-[#15171A]">
            <Loader2 size={16} className="animate-spin text-[#10B981]" />
            <span>Finalizing audio recording...</span>
          </div>
        ) : state === "ERROR" ? (
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-3 rounded-full bg-[#15171A] hover:bg-[#2A2E39] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-2 shadow-md"
          >
            <RotateCcw size={15} />
            <span>Try Again</span>
          </button>
        ) : (
          /* Start Record Button */
          <button
            type="button"
            onClick={onStart}
            disabled={disabled || state === "REQUESTING_PERMISSION"}
            className="px-8 py-3.5 rounded-full bg-[#15171A] hover:bg-[#2A2E39] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-2.5 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50"
            aria-label="Start Voice Recording"
          >
            {state === "REQUESTING_PERMISSION" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Connecting Mic...</span>
              </>
            ) : (
              <>
                <Mic size={16} />
                <span>Start Recording</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Device Selection (Optional input selection if available and not actively recording) */}
      {!isRecording && !isPaused && inputDevices.length > 1 && onSelectDevice && (
        <div className="flex items-center gap-2 text-[11px] text-[#707582]">
          <Mic size={12} className="text-[#8C8983]" />
          <span>Microphone:</span>
          <select
            value={selectedDeviceId}
            onChange={(e) => onSelectDevice(e.target.value)}
            className="bg-transparent border-b border-[#DDD8CD] text-[#15171A] font-medium py-0.5 px-1 focus:outline-hidden cursor-pointer"
          >
            {inputDevices.map((dev) => (
              <option key={dev.deviceId} value={dev.deviceId}>
                {dev.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
