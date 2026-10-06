import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { LiveWaveform } from "./LiveWaveform";
import { RecordingTimer } from "./RecordingTimer";
import { RecordingControls } from "./RecordingControls";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, url: string, durationSeconds: number, mimeType?: string) => void;
  onSwitchToUpload?: () => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onSwitchToUpload,
  disabled = false,
}) => {
  const {
    state,
    isRecording,
    isPaused,
    seconds,
    maxDurationSeconds,
    errorMessage,
    mediaStream,
    inputDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder({
    maxDurationSeconds: 120,
    timesliceMs: 250,
    onRecordingComplete: (blob, url, duration, mime) => {
      onRecordingComplete(blob, url, duration, mime);
    },
  });

  // Permission blocked or error UI
  if (state === "ERROR" && errorMessage) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-4 text-xs">
        <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle size={22} className="text-amber-700" />
        </div>

        <div className="space-y-1.5 max-w-sm mx-auto">
          <h4 className="text-sm font-bold text-[#15171A]">Microphone Issue</h4>
          <p className="text-xs text-[#707582] leading-relaxed">{errorMessage}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={resetRecording}
            className="px-4 py-2 rounded-xl bg-[#15171A] hover:bg-[#2A2E39] text-white font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw size={13} />
            <span>Try Again</span>
          </button>

          {onSwitchToUpload && (
            <button
              type="button"
              onClick={onSwitchToUpload}
              className="px-4 py-2 rounded-xl bg-white border border-[#DDD8CD] font-semibold text-[#15171A] hover:bg-[#F4F1EA] transition cursor-pointer"
            >
              Use Audio Upload
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      {/* Live Waveform connected to active Web Audio MediaStream without destination loopback */}
      <LiveWaveform
        mediaStream={mediaStream}
        isRecording={isRecording}
        isPaused={isPaused}
      />

      {/* Actual Recording Timer */}
      <RecordingTimer
        seconds={seconds}
        maxSeconds={maxDurationSeconds}
        isRecording={isRecording}
        isPaused={isPaused}
      />

      {/* Recording Controls */}
      <RecordingControls
        state={state}
        isRecording={isRecording}
        isPaused={isPaused}
        disabled={disabled}
        inputDevices={inputDevices}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={setSelectedDeviceId}
        onStart={startRecording}
        onPause={pauseRecording}
        onResume={resumeRecording}
        onStop={stopRecording}
        onReset={resetRecording}
      />

      <p className="text-[11px] text-[#8C8983]">
        {isRecording
          ? "Speak naturally. Click the square button when you are finished."
          : isPaused
          ? "Recording paused. Click the play button to resume or square to finish."
          : "Microphone captures vocal prosody locally before secure processing."}
      </p>
    </div>
  );
};
