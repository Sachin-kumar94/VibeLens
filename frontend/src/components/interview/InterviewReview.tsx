import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Clock,
  Video,
  Mic,
} from "lucide-react";
import { RecordedAnswerData } from "./InterviewRecorder";

interface InterviewReviewProps {
  data: RecordedAnswerData;
  onRetake: () => void;
  onSubmitForAnalysis: () => void;
  isAnalyzing: boolean;
}

export const InterviewReview: React.FC<InterviewReviewProps> = ({
  data,
  onRetake,
  onSubmitForAnalysis,
  isAnalyzing,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(data.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasVideo = data.hasVisualData && data.videoQuality !== "Unavailable";

  // Reconcile duration
  const activeMedia = hasVideo ? videoRef.current : audioRef.current;

  useEffect(() => {
    if (activeMedia) {
      activeMedia.playbackRate = playbackRate;
    }
  }, [playbackRate, activeMedia]);

  const togglePlay = () => {
    if (!activeMedia) return;
    if (isPlaying) {
      activeMedia.pause();
      setIsPlaying(false);
    } else {
      activeMedia.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (activeMedia) {
      setCurrentTime(activeMedia.currentTime);
      if (Number.isFinite(activeMedia.duration) && activeMedia.duration > 0) {
        setMediaDuration(activeMedia.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (activeMedia) {
      activeMedia.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (activeMedia) {
      activeMedia.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (activeMedia) {
      activeMedia.volume = val;
      if (val === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-6 shadow-sm animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD7CB]/70 pb-4">
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#15171A]">
            Answer Review
          </h3>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono text-[#575A60]">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#DDD7CB]">
            <Clock size={12} className="text-[#71889C]" />
            <span>Duration: {formatTime(data.duration)}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#DDD7CB]">
            <CheckCircle2 size={12} className="text-[#10B981]" />
            <span>Audio ✓</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#DDD7CB]">
            <CheckCircle2 size={12} className={hasVideo ? "text-[#10B981]" : "text-[#7D7971]"} />
            <span>{hasVideo ? "Video ✓" : "Audio Track"}</span>
          </span>
        </div>
      </div>

      {/* Media Player Viewport */}
      <div className="relative aspect-video max-h-[380px] w-full bg-[#15171A] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        {hasVideo ? (
          <video
            ref={videoRef}
            src={data.mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
            playsInline
          />
        ) : (
          <div className="text-center p-8 space-y-3">
            <audio
              ref={audioRef}
              src={data.mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white">
              <Mic size={28} className={isPlaying ? "text-[#10B981] animate-pulse" : "text-white/60"} />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">Recorded Audio Track</span>
              <span className="text-xs text-white/60 font-mono">
                {formatTime(currentTime)} / {formatTime(mediaDuration)}
              </span>
            </div>
          </div>
        )}

        {/* Big Center Play/Pause Overlay */}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs flex items-center justify-center text-white transition cursor-pointer hover:scale-110 shadow-lg"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-1" />}
        </button>
      </div>

      {/* Scrub Bar & Player Controls */}
      <div className="space-y-3 p-4 rounded-2xl bg-white border border-[#DDD7CB]">
        {/* Scrub Slider */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#575A60] min-w-[38px] text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={mediaDuration || data.duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-[#FAF8F5] border border-[#DDD7CB] rounded-full appearance-none cursor-pointer accent-[#15171A]"
          />
          <span className="font-mono text-xs text-[#575A60] min-w-[38px]">
            {formatTime(mediaDuration || data.duration)}
          </span>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="px-3.5 py-1.5 rounded-xl bg-[#15171A] text-white font-medium flex items-center gap-1.5 cursor-pointer hover:bg-[#252833] transition"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] p-0.5">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-2 py-1 rounded-lg font-mono text-[11px] transition cursor-pointer ${
                    playbackRate === speed
                      ? "bg-white font-bold text-[#15171A] shadow-2xs"
                      : "text-[#575A60] hover:text-[#15171A]"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-[#575A60] hover:text-[#15171A] cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-[#DDD7CB] rounded-full appearance-none cursor-pointer accent-[#15171A]"
              />
            </div>

            {hasVideo && (
              <button
                type="button"
                onClick={handleFullscreen}
                className="p-1.5 text-[#575A60] hover:text-[#15171A] hover:bg-[#FAF8F5] rounded-lg cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recorded Speech Telemetry Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
        <div className="p-3 rounded-xl bg-white border border-[#DDD7CB]">
          <span className="text-[10px] font-mono text-[#7D7971] block">CADENCE</span>
          <span className="font-bold text-sm text-[#10B981]">{data.wpm} WPM</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#DDD7CB]">
          <span className="text-[10px] font-mono text-[#7D7971] block">PAUSES</span>
          <span className="font-bold text-sm text-[#15171A]">{data.pauseCount} ({data.avgPauseDuration.toFixed(1)}s avg)</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#DDD7CB]">
          <span className="text-[10px] font-mono text-[#7D7971] block">FILLERS</span>
          <span className="font-bold text-sm text-[#15171A]">{data.fillerCount} ({data.fillerRate}/min)</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#DDD7CB]">
          <span className="text-[10px] font-mono text-[#7D7971] block">FACE VISIBLE</span>
          <span className="font-bold text-sm text-[#15171A]">{data.faceVisibility}%</span>
        </div>
      </div>

      {/* Transcript Block matching Wireframe */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#15171A] block">
          Transcript
        </span>
        <div className="border-t border-[#DDD7CB] pt-2.5">
          <p className="text-xs text-[#575A60] leading-relaxed italic whitespace-pre-wrap">
            {data.transcript || "No spoken words transcribed for this answer."}
          </p>
        </div>
      </div>

      {/* Interactive Sentence-Level Transcript & Seek Navigator */}
      {data.sentences && data.sentences.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-3">
          <div className="flex items-center justify-between border-b border-[#DDD7CB]/70 pb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#15171A]">
              Spoken Sentences · Click to Seek
            </span>
            <span className="text-[10px] text-[#7D7971] font-mono">
              {data.sentences.length} sentences captured
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {data.sentences.map((sent, idx) => {
              const start = sent.startTime ?? sent.startSec ?? 0;
              const end = sent.endTime ?? sent.endSec ?? start + 2;
              const isCurrent = currentTime >= start && currentTime <= end;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (activeMedia) {
                      activeMedia.currentTime = start;
                      setCurrentTime(start);
                      if (!isPlaying) {
                        activeMedia.play().catch(() => {});
                        setIsPlaying(true);
                      }
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-start gap-2.5 ${
                    isCurrent
                      ? "bg-[#10B981]/10 border-[#10B981]/50 text-[#15171A] font-medium"
                      : "bg-[#FAF8F5] border-[#DDD7CB]/60 text-[#575A60] hover:border-[#8C8983] hover:text-[#15171A]"
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#7D7971] bg-white px-1.5 py-0.5 rounded border border-[#DDD7CB] shrink-0 mt-0.5">
                    {formatTime(start)}
                  </span>
                  <span className="leading-relaxed flex-1">{sent.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions: Retake vs Submit */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onRetake}
          disabled={isAnalyzing}
          className="px-5 py-2.5 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-[#15171A] text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs hover:bg-[#FAF8F5]"
        >
          <RotateCcw size={13} />
          <span>Retake Answer</span>
        </button>

        <button
          type="button"
          onClick={onSubmitForAnalysis}
          disabled={isAnalyzing}
          className="px-7 py-3 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition hover:scale-102 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Answer...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-[#10B981]" />
              <span>Analyze Answer</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
