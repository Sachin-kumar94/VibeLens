import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Trash2,
  Clock,
  Mic,
  Camera,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Film,
} from "lucide-react";
import { RehearsalMetricsResult } from "./LiveRehearsalStage";

interface ReviewSessionStageProps {
  metrics: RehearsalMetricsResult;
  onStartAnalysis: () => void;
  onDiscard: () => void;
  isAnalyzing: boolean;
  analysisStageText: string;
}

export const ReviewSessionStage: React.FC<ReviewSessionStageProps> = ({
  metrics,
  onStartAnalysis,
  onDiscard,
  isAnalyzing,
  analysisStageText,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(metrics.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Generate object URL for videoBlob
  useEffect(() => {
    if (metrics.videoBlob) {
      const url = URL.createObjectURL(metrics.videoBlob);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [metrics.videoBlob]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleScrollToPlayer = () => {
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Section 27: Rehearsal Complete Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#DDD7CB] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8983]">
              Rehearsal Stage Concluded
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#15171A]">
            Rehearsal Complete
          </h2>
          <p className="text-xs text-[#575A60] mt-1">
            Playback your recorded rehearsal or proceed directly to speech and visual coaching analysis.
          </p>
        </div>

        {/* Section 27 Metrics badges: Duration, Audio: Available, Video: Available */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs font-mono text-[#15171A] flex items-center gap-1.5">
            <Clock size={13} className="text-[#8C8983]" />
            <span>Duration: <strong>{formatTimer(metrics.duration)}</strong></span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs font-mono text-[#10B981] flex items-center gap-1.5">
            <Mic size={13} />
            <span>Audio: <strong>Available</strong></span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs font-mono text-[#10B981] flex items-center gap-1.5">
            <Camera size={13} />
            <span>Video: <strong>Available</strong></span>
          </div>
        </div>
      </div>

      {/* Primary Action Ribbon: [ Review ] [ Analyze ] [ Discard ] per Section 27 */}
      <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-white border border-[#DDD7CB] shadow-2xs gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScrollToPlayer}
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Film size={13} />
            <span>Review Recording</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDiscardConfirm(true)}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Discard</span>
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onStartAnalysis}
            disabled={isAnalyzing}
            className="px-7 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md hover:scale-102"
          >
            <Sparkles size={14} className="text-[#10B981]" />
            <span>Analyze Rehearsal</span>
          </button>
        </div>
      </div>

      {/* Video & Audio Player Area (Section 28, 29, 30: actual recorded media) */}
      <div
        ref={playerContainerRef}
        className="rounded-2xl bg-[#14161B] border border-[#DDD7CB] overflow-hidden shadow-lg space-y-0"
      >
        <div className="aspect-video md:aspect-[16/9] relative flex items-center justify-center bg-black">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-white/60 text-xs font-mono">
              Recorded rehearsal stream ready for review.
            </div>
          )}

          {/* Center Play Overlay when paused */}
          {!isPlaying && videoUrl && (
            <button
              type="button"
              onClick={handleTogglePlay}
              className="absolute w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition hover:scale-105 cursor-pointer shadow-xl"
              aria-label="Play recording"
            >
              <Play size={28} className="fill-current translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Custom Player Controls Bar (Section 28: Play, Pause, Seek, Volume, Fullscreen, Speed) */}
        <div className="p-4 bg-[#1B1D24] text-white flex flex-col gap-3">
          {/* Progress Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-white/60 w-10">
              {formatTimer(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
            />
            <span className="text-[11px] font-mono text-white/60 w-10 text-right">
              {formatTimer(duration)}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Restart"
              >
                <RotateCcw size={16} />
              </button>

              {/* Volume */}
              <button
                type="button"
                onClick={handleToggleMute}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* Speed selection */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg text-xs font-mono">
                {[0.75, 1.0, 1.25, 1.5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2 py-0.5 rounded transition ${
                      playbackSpeed === s
                        ? "bg-[#10B981] text-white font-bold"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Spoken Transcript Preview */}
      {metrics.transcript && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#8C8983] uppercase tracking-wider">
            <span>Speech Recognition Transcript</span>
            <span>{metrics.pace > 0 ? `${metrics.pace} WPM Calculated` : "Completed"}</span>
          </div>
          <p className="text-xs text-[#575A60] italic leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DDD7CB]">
            “{metrics.transcript}”
          </p>
        </div>
      )}

      {/* Section 31: Multi-Stage Analysis Progress Banner (No fake percentage) */}
      {isAnalyzing && (
        <div className="p-6 rounded-2xl bg-white border border-[#DDD7CB] shadow-sm text-center space-y-4 animate-fade-in">
          <div className="w-10 h-10 border-3 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#10B981] font-semibold block">
              Computational Analysis In Progress
            </span>
            <h3 className="font-serif text-lg font-bold text-[#15171A] mt-1">
              {analysisStageText}
            </h3>
            <p className="text-xs text-[#575A60] mt-1">
              Evaluating speech cadence, pause intervals, upper body alignment, and engagement continuity...
            </p>
          </div>
        </div>
      )}

      {/* Discard Confirmation Dialog */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#DDD7CB] p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={20} />
              <h3 className="font-bold text-sm text-[#15171A]">Discard This Rehearsal?</h3>
            </div>
            <p className="text-xs text-[#575A60]">
              The recorded audio, video, and provisional metrics will be permanently cleared. No session will be saved to your account history.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#575A60] hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                Keep Rehearsal
              </button>
              <button
                type="button"
                onClick={onDiscard}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
