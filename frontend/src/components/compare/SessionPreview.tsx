import React, { useState, useRef } from "react";
import {
  Camera,
  Mic,
  Activity,
  Layers,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Sparkles,
  FileQuestion,
} from "lucide-react";

interface SessionPreviewProps {
  session: {
    id: string;
    type: "image" | "voice" | "body" | "fusion";
    title: string;
    fileUrl?: string;
    fileName?: string;
    imageUrl?: string;
    inputUrl?: string;
    audioUrl?: string;
    context?: string;
    voiceMetrics?: any;
    bodyMetrics?: any;
    fusionMetrics?: any;
    imageMetrics?: any;
  };
}

export const SessionPreview: React.FC<SessionPreviewProps> = ({ session }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(session.voiceMetrics?.duration || 12);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mediaUrl = session.fileUrl || session.imageUrl || session.inputUrl || session.audioUrl;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn("Audio playback error:", e);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Render Lightbox Modal
  const renderLightbox = () => {
    if (!lightboxOpen || !mediaUrl) return null;
    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => setLightboxOpen(false)}
      >
        <div
          className="relative max-w-4xl max-h-[90vh] bg-[#14161B] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
          <img
            src={mediaUrl}
            alt={session.title}
            className="w-full h-full max-h-[85vh] object-contain"
          />
          <div className="p-4 bg-[#1A1D24] text-white flex items-center justify-between">
            <span className="text-xs font-semibold">{session.title}</span>
            <span className="text-[11px] font-mono text-[#8C8983] uppercase">{session.type} capture asset</span>
          </div>
        </div>
      </div>
    );
  };

  // Voice Preview with interactive waveform and playback
  if (session.type === "voice") {
    return (
      <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-[#DDD7CB] bg-[#F7F4EE] p-4 flex flex-col justify-between relative shadow-2xs">
        {mediaUrl && (
          <audio
            ref={audioRef}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Top bar with audio badge */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#DDD7CB] text-[#15171A]">
            <Mic size={12} className="text-[#10B981]" />
            <span className="text-[10px] font-mono uppercase font-bold">Vocal Prosody Stream</span>
          </div>
          <span className="font-mono text-[11px] text-[#707582]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Animated/Static Waveform Bars */}
        <div className="py-2 flex items-center justify-center gap-1 h-14">
          {[35, 60, 40, 80, 55, 95, 70, 45, 90, 65, 85, 40, 75, 50, 90, 60, 40, 70, 85, 50, 65, 30].map(
            (height, i) => {
              const active = (i / 22) * duration <= currentTime;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    active ? "bg-[#10B981]" : "bg-[#DDD7CB]"
                  } ${isPlaying ? "animate-pulse" : ""}`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (height * (1 + (i % 3) * 0.2)) % 100)}%` : `${height}%`,
                  }}
                />
              );
            }
          )}
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-[#DDD7CB]">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-lg bg-[#15171A] text-white hover:bg-[#2B2E33] flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-[#10B981] h-1.5 bg-[#E6E2D8] rounded-lg cursor-pointer"
          />

          <button
            type="button"
            onClick={toggleMute}
            className="text-[#707582] hover:text-[#15171A] transition cursor-pointer shrink-0"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
    );
  }

  // Fusion Preview: Compact 3-panel preview (Image, Voice, Body)
  if (session.type === "fusion") {
    return (
      <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-[#DDD7CB] bg-[#FAF8F5] p-3 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-[#DDD7CB] text-[#15171A]">
            <Layers size={12} className="text-[#A855F7]" />
            <span className="text-[10px] font-mono uppercase font-bold">Tri-Modal Fusion Snapshot</span>
          </div>
          <span className="text-[10px] font-mono text-[#8C8983]">3 Integrated Streams</span>
        </div>

        {/* 3 Modality Mini-Cards */}
        <div className="grid grid-cols-3 gap-2 flex-1 items-stretch">
          {/* Visual Panel */}
          <div className="rounded-xl border border-[#DDD7CB] bg-white p-2 flex flex-col justify-between text-center overflow-hidden">
            <div className="flex items-center justify-center gap-1 text-[#3B82F6]">
              <Camera size={12} />
              <span className="text-[9px] font-mono uppercase font-bold">Visual</span>
            </div>
            {mediaUrl ? (
              <img src={mediaUrl} alt="Visual stream" className="h-10 w-full object-cover rounded-md mt-1" />
            ) : (
              <div className="h-10 bg-[#FAF8F5] rounded-md flex items-center justify-center text-[10px] text-[#8C8983]">
                Affect Active
              </div>
            )}
            <span className="text-[9px] text-[#575A60] font-medium">Gaze & Facial</span>
          </div>

          {/* Voice Panel */}
          <div className="rounded-xl border border-[#DDD7CB] bg-white p-2 flex flex-col justify-between text-center overflow-hidden">
            <div className="flex items-center justify-center gap-1 text-[#10B981]">
              <Mic size={12} />
              <span className="text-[9px] font-mono uppercase font-bold">Acoustic</span>
            </div>
            <div className="h-10 bg-[#E8F5E9]/50 rounded-md flex items-center justify-center gap-0.5 px-1 mt-1">
              {[40, 70, 50, 90, 60, 80].map((h, i) => (
                <div key={i} className="w-1 bg-[#10B981] rounded-full" style={{ height: `${h}%` }} />
              ))}
            </div>
            <span className="text-[9px] text-[#575A60] font-medium">Prosody Cadence</span>
          </div>

          {/* Body Panel */}
          <div className="rounded-xl border border-[#DDD7CB] bg-white p-2 flex flex-col justify-between text-center overflow-hidden">
            <div className="flex items-center justify-center gap-1 text-[#F59E0B]">
              <Activity size={12} />
              <span className="text-[9px] font-mono uppercase font-bold">Kinesics</span>
            </div>
            <div className="h-10 bg-[#FEF3C7]/40 rounded-md flex items-center justify-center text-[10px] text-[#D97706] font-semibold mt-1">
              {session.bodyMetrics?.postureScore ? `${session.bodyMetrics.postureScore}%` : "Aligned"}
            </div>
            <span className="text-[9px] text-[#575A60] font-medium">Posture & Pose</span>
          </div>
        </div>
      </div>
    );
  }

  // Image & Body Preview with Lightbox capability
  if (mediaUrl) {
    return (
      <>
        <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-[#DDD7CB] bg-[#14161B] relative group shadow-2xs">
          <img
            src={mediaUrl}
            alt={session.title}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-3">
            <span className="text-white text-xs font-medium truncate max-w-[80%]">
              {session.title}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition cursor-pointer"
              title="Fullscreen Preview"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>
        {renderLightbox()}
      </>
    );
  }

  // Meaningful Fallback when no asset is saved (Fixes empty black box requirement!)
  return (
    <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-dashed border-[#DDD7CB] bg-[#FAF8F5] p-5 flex flex-col items-center justify-center text-center space-y-2 shadow-2xs">
      <div className="w-10 h-10 rounded-full bg-[#EFEAE1] flex items-center justify-center text-[#8C8983]">
        {session.type === "image" ? <Camera size={18} /> : <Activity size={18} />}
      </div>
      <div>
        <p className="text-xs font-semibold text-[#15171A]">No visual asset saved</p>
        <p className="text-[11px] text-[#8C8983] max-w-[200px] mt-0.5">
          Signal metrics were extracted and preserved without storing raw media.
        </p>
      </div>
    </div>
  );
};
