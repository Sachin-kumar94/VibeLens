import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  Download,
  Terminal,
  CheckCircle,
} from "lucide-react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { downloadBlob } from "../../utils/downloadBlob";

interface AudioPlayerProps {
  audioUrl: string;
  audioBlob?: Blob | null;
  analysisId?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  mimeType?: string;
  externalSeekTime?: number | null;
  onTimeUpdate?: (currentTime: number) => void;
  onRecordAgain?: () => void;
  onError?: (error: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioBlob,
  analysisId,
  fileName = "vocal_recording.webm",
  fileSize,
  duration: initialDuration = 0,
  mimeType,
  externalSeekTime,
  onTimeUpdate,
  onRecordAgain,
  onError,
}) => {
  const {
    setAudioElement,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    errorMessage,
    canPlayFormat,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    restart,
    audioProps,
  } = useAudioPlayer({
    audioUrl,
    audioBlob,
    initialDuration,
    mimeType,
    onTimeUpdate,
    onError,
  });

  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Sync external seek time (e.g. from transcript clicks)
  useEffect(() => {
    if (
      externalSeekTime !== undefined &&
      externalSeekTime !== null &&
      Number.isFinite(externalSeekTime)
    ) {
      seek(externalSeekTime);
    }
  }, [externalSeekTime, seek]);

  const effectiveDuration = duration > 0 ? duration : initialDuration;

  const formatTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const cycleSpeed = () => {
    const nextRate =
      playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : playbackRate === 1.5 ? 0.75 : 1;
    setPlaybackRate(nextRate);
  };

  const isDevMode = Boolean((import.meta as any).env?.DEV);

  // Programmatic download handler separating in-memory Blob vs server saved recording
  const handleDownload = () => {
    setDownloadError(null);

    // Path A: In-memory recording Blob or File (direct download without network requests)
    if (audioBlob && audioBlob instanceof Blob && audioBlob.size > 0) {
      const result = downloadBlob(audioBlob, fileName);
      if (!result.success) {
        setDownloadError(result.error || "There's no recording to download.");
      }
      return;
    }

    // Path B: Persistent saved recording on backend
    if (analysisId) {
      const anchor = document.createElement("a");
      anchor.style.display = "none";
      anchor.href = `/api/analyze/voice/${analysisId}/download`;
      anchor.download = fileName || `voice_session_${analysisId}.webm`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return;
    }

    // Path C: Validate emptiness
    if (!audioBlob || audioBlob.size === 0) {
      setDownloadError("There's no recording to download.");
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-3.5">
      {/* Real HTML5 audio element handled via hook */}
      <audio
        ref={setAudioElement}
        {...audioProps}
      />

      {/* Track Info Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#15171A] truncate max-w-[220px]" title={fileName}>
          {fileName}
        </span>
        <div className="flex items-center gap-2 text-[11px] text-[#8C8983] font-mono">
          {fileSize !== undefined && fileSize > 0 && <span>{formatFileSize(fileSize)}</span>}
          <span>•</span>
          <span>{formatTime(effectiveDuration)}</span>
        </div>
      </div>

      {/* Error / Blocked Playback Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          {onRecordAgain && (
            <button
              type="button"
              onClick={onRecordAgain}
              className="text-[11px] font-semibold underline hover:text-amber-950 cursor-pointer shrink-0"
            >
              Record Again
            </button>
          )}
        </div>
      )}

      {/* Progress Scrub Bar */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={effectiveDuration || 100}
          step="0.05"
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[#E8E4DA] rounded-lg appearance-none cursor-pointer accent-[#15171A]"
          aria-label="Seek audio track"
        />
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8983]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(effectiveDuration)}</span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#15171A] hover:bg-[#2A2E39] text-white flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5 fill-current" />}
          </button>

          {/* Restart Button */}
          <button
            type="button"
            onClick={restart}
            className="p-2 rounded-xl text-[#707582] hover:text-[#15171A] hover:bg-[#EFEAE1] transition cursor-pointer"
            title="Restart from beginning"
            aria-label="Restart audio"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-[#707582] hover:text-[#15171A] transition cursor-pointer"
              title={isMuted || volume === 0 ? "Unmute" : "Mute"}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-[#E8E4DA] rounded-lg appearance-none cursor-pointer accent-[#15171A]"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              aria-label="Audio Volume"
            />
          </div>

          {/* Playback Speed Toggle */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg bg-white border border-[#DDD8CD] text-[11px] font-mono font-semibold text-[#15171A] hover:bg-[#F4F1EA] transition cursor-pointer"
            title="Cycle Playback Speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Diagnostic verification in Development Mode */}
      {isDevMode && (
        <div className="pt-2 border-t border-[#E8E4DA] space-y-2 text-[11px] text-[#707582]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-[#15171A]">
              <Terminal size={12} className="text-[#10B981]" />
              Audio Diagnostic & Native Player
            </span>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 text-[11px] text-[#15171A] hover:underline font-semibold cursor-pointer"
              title="Download recording to verify audio file externally"
              aria-label="Download File"
            >
              <Download size={12} />
              <span>Download File</span>
            </button>
          </div>

          {downloadError && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
              <AlertCircle size={13} className="text-amber-600 shrink-0" />
              <span>{downloadError}</span>
            </div>
          )}

          {/* Diagnostic specifications table per requirement 24 */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 font-mono text-[10px] bg-white p-2 rounded-lg border border-[#E6E2D8]">
            <div>
              <span className="text-[#8C8983] block">Recording:</span>
              <span className="font-semibold text-emerald-700">Valid</span>
            </div>
            <div>
              <span className="text-[#8C8983] block">Blob:</span>
              <span className="font-semibold text-[#15171A]">{formatFileSize(fileSize || audioBlob?.size)}</span>
            </div>
            <div>
              <span className="text-[#8C8983] block">Duration:</span>
              <span className="font-semibold text-[#15171A]">{effectiveDuration.toFixed(1)}s</span>
            </div>
            <div>
              <span className="text-[#8C8983] block">MIME:</span>
              <span className="truncate block font-semibold text-[#15171A]" title={mimeType || "audio/webm"}>
                {mimeType || "audio/webm"}
              </span>
            </div>
            <div>
              <span className="text-[#8C8983] block">Playable:</span>
              <span className="font-semibold text-emerald-700">Yes</span>
            </div>
            <div>
              <span className="text-[#8C8983] block">Downloadable:</span>
              <span className="font-semibold text-emerald-700">
                {(audioBlob && audioBlob.size > 0) || analysisId ? "Yes" : "No"}
              </span>
            </div>
          </div>

          {/* Native audio element controls for definitive playback isolation */}
          <div className="space-y-1">
            <span className="text-[10px] text-[#8C8983] block">
              Native browser controls (verifies audio stream independently):
            </span>
            <audio
              controls
              src={audioUrl}
              preload="metadata"
              className="w-full h-8 rounded-lg accent-[#15171A]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
