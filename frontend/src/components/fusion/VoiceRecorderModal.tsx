import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  X,
  Square,
  Play,
  Pause,
  RotateCcw,
  Check,
  Volume2,
  Download,
  AlertCircle,
} from "lucide-react";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";

export interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (data: {
    blob: Blob;
    url: string;
    duration: number;
    mimeType: string;
  }) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onRecordingComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    state,
    seconds,
    audioBlob,
    audioUrl,
    audioDuration,
    actualMimeType,
    errorMessage,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useVoiceRecorder({
    maxDurationSeconds: 120,
  });

  // Handle audio playback updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setPlaybackTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleConfirm = () => {
    if (!audioBlob || !audioUrl) return;
    onRecordingComplete({
      blob: audioBlob,
      url: audioUrl,
      duration: audioDuration || seconds,
      mimeType: actualMimeType || "audio/webm",
    });
    onClose();
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setPlaybackTime(0);
    resetRecording();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E6E2D8] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Mic size={16} className="text-[#8B5CF6]" />
            <h3 className="text-sm font-semibold text-[#15171A]">Record Voice Signal</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#707582] hover:text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 w-full">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status & Timer */}
          <div className="text-center space-y-1">
            <div className="text-3xl font-mono font-bold text-[#15171A]">
              {audioUrl ? formatTime(playbackTime) : formatTime(seconds)}
            </div>
            <p className="text-xs text-[#707582]">
              {state === "RECORDING"
                ? "Recording in progress... speak naturally"
                : state === "PAUSED"
                ? "Recording paused"
                : audioUrl
                ? `Recorded ${formatTime(audioDuration || seconds)} of audio`
                : "Press record to capture vocal prosody"}
            </p>
          </div>

          {/* Waveform / Level Visualization */}
          <div className="w-full h-20 rounded-2xl bg-[#FAF8F5] border border-[#DDD8CD] flex items-center justify-center px-4 overflow-hidden">
            {state === "RECORDING" ? (
              <div className="flex items-center gap-1 w-full justify-center">
                {[14, 28, 44, 22, 58, 36, 68, 50, 24, 62, 40, 18, 55, 30, 48].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 bg-[#8B5CF6] rounded-full animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${idx * 70}ms`,
                    }}
                  />
                ))}
              </div>
            ) : audioUrl ? (
              <div className="flex items-center gap-1 w-full justify-center">
                {[20, 35, 45, 30, 60, 40, 70, 50, 30, 65, 45, 25, 55, 35, 40].map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 rounded-full ${
                      (playbackTime / (audioDuration || 1)) > (idx / 15)
                        ? "bg-[#8B5CF6]"
                        : "bg-[#DDD8CD]"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs text-[#8C8983] font-mono">
                Awaiting microphone activation...
              </span>
            )}
          </div>

          {/* Audio Element */}
          {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

          {/* Primary Controls */}
          {!audioUrl ? (
            <div className="flex items-center gap-4">
              {state === "RECORDING" ? (
                <>
                  <button
                    type="button"
                    onClick={pauseRecording}
                    className="p-3 rounded-full bg-[#FAF8F5] border border-[#DDD8CD] text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
                    title="Pause"
                  >
                    <Pause size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Square size={16} fill="currentColor" />
                    <span>Stop Recording</span>
                  </button>
                </>
              ) : state === "PAUSED" ? (
                <>
                  <button
                    type="button"
                    onClick={resumeRecording}
                    className="px-6 py-3 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="p-3 rounded-full bg-[#FAF8F5] border border-[#DDD8CD] text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
                    title="Stop"
                  >
                    <Square size={16} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-8 py-3.5 rounded-full bg-[#15171A] hover:bg-[#252833] text-white font-semibold text-xs flex items-center gap-2.5 shadow-lg transition cursor-pointer active:scale-95"
                >
                  <Mic size={16} className="text-[#8B5CF6]" />
                  <span>Start Recording</span>
                </button>
              )}
            </div>
          ) : (
            /* Playback Controls */
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="p-3.5 rounded-full bg-[#15171A] text-white hover:bg-[#252833] transition cursor-pointer shadow-md"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-3 rounded-full bg-[#FAF8F5] border border-[#DDD8CD] text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
                  title="Retake"
                >
                  <RotateCcw size={16} />
                </button>

                {audioUrl && (
                  <a
                    href={audioUrl}
                    download="vibelens_voice_capture.webm"
                    className="p-3 rounded-full bg-[#FAF8F5] border border-[#DDD8CD] text-[#707582] hover:text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
                    title="Download Audio"
                  >
                    <Download size={16} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD8CD] text-xs font-semibold text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Use Audio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
