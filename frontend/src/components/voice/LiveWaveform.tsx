import React, { useEffect, useRef, useState } from "react";
import { Volume2, AlertCircle } from "lucide-react";

interface LiveWaveformProps {
  mediaStream: MediaStream | null;
  isRecording: boolean;
  isPaused?: boolean;
  onLevelChange?: (level: { volume: "Low" | "Good" | "High"; isClipping: boolean; rms: number }) => void;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({
  mediaStream,
  isRecording,
  isPaused = false,
  onLevelChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [inputLevel, setInputLevel] = useState<"Low" | "Good" | "High">("Good");
  const [isClipping, setIsClipping] = useState<boolean>(false);
  const [isSilent, setIsSilent] = useState<boolean>(true);

  useEffect(() => {
    if (!mediaStream || !isRecording) {
      // Clean up Web Audio nodes
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      sourceRef.current = source;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastLevelUpdate = 0;

      const render = (time: number) => {
        animationFrameRef.current = requestAnimationFrame(render);

        if (isPaused) {
          // Keep current frozen or dimmed frame during pause
          return;
        }

        analyser.getByteFrequencyData(dataArray);

        // Calculate average RMS energy
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          sum += val;
          if (val > peak) peak = val;
        }
        const avg = sum / dataArray.length;
        const normalizedRms = avg / 255;
        const silent = avg < 8;
        setIsSilent(silent);

        // Update input level once every 200ms
        if (time - lastLevelUpdate > 200) {
          lastLevelUpdate = time;
          let level: "Low" | "Good" | "High" = "Good";
          const clipping = peak > 248;
          if (avg < 14) level = "Low";
          else if (clipping || avg > 160) level = "High";

          setInputLevel(level);
          setIsClipping(clipping);
          if (onLevelChange) {
            onLevelChange({ volume: level, isClipping: clipping, rms: normalizedRms });
          }
        }

        // Draw natural, elegant waveform on canvas
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const barCount = 38;
        const spacing = 4;
        const totalBarWidth = (width - (barCount - 1) * spacing) / barCount;
        const barWidth = Math.max(2, totalBarWidth);

        // Gradient & styling: Natural VibeLens muted green, brighter during active voice
        const activeColor = silent ? "#A7B3A5" : "#10B981";
        const baseColor = isPaused ? "#DDD8CD" : "#748D76";

        for (let i = 0; i < barCount; i++) {
          const dataIdx = Math.floor((i / barCount) * (dataArray.length * 0.75));
          const value = dataArray[dataIdx] || 0;

          // Natural minimum idle bar height + sound reaction
          const minHeight = 6;
          const dynamicHeight = isPaused ? 8 : (value / 255) * (height - 20);
          const barHeight = Math.max(minHeight, dynamicHeight);

          const x = i * (barWidth + spacing);
          const y = (height - barHeight) / 2;

          ctx.fillStyle = value > 40 ? activeColor : baseColor;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
          ctx.fill();
        }
      };

      animationFrameRef.current = requestAnimationFrame(render);
    } catch (err) {
      console.warn("Live waveform AudioContext error:", err);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [mediaStream, isRecording, isPaused, onLevelChange]);

  // Static bars when idle or stopped
  const idleBars = [
    12, 18, 26, 38, 48, 30, 20, 36, 52, 60, 44, 28, 42, 54, 38, 26, 36, 48, 32,
    22, 34, 46, 24, 14, 20, 32, 42, 28, 18, 12, 22, 36, 28, 18, 24, 16, 12, 8
  ];

  return (
    <div className="w-full space-y-3">
      {/* Waveform Canvas / Container */}
      <div className="relative h-36 w-full flex items-center justify-center bg-[#FAF8F5] rounded-2xl border border-[#E8E4DA] p-4 overflow-hidden">
        {isRecording && mediaStream ? (
          <canvas
            ref={canvasRef}
            width={600}
            height={140}
            className={`w-full h-full transition-opacity duration-300 ${
              isPaused ? "opacity-50" : "opacity-100"
            }`}
          />
        ) : (
          <div className="flex items-center justify-center gap-1.5 w-full h-full">
            {idleBars.map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-[#DDD8CD] transition-all duration-300"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        )}

        {/* Live Audio Indicator Pill */}
        {isRecording && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#DDD8CD] text-[11px] font-medium shadow-2xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isPaused
                  ? "bg-amber-400"
                  : isSilent
                  ? "bg-[#8C8983]"
                  : inputLevel === "Good"
                  ? "bg-[#10B981] animate-pulse"
                  : inputLevel === "High"
                  ? "bg-rose-500"
                  : "bg-amber-500"
              }`}
            />
            <span className="text-[#15171A]">
              {isPaused
                ? "Recording Paused"
                : isSilent
                ? "Listening..."
                : inputLevel === "Good"
                ? "Speaking (Good)"
                : inputLevel === "High"
                ? "Loud / Peak"
                : "Soft Voice"}
            </span>
          </div>
        )}
      </div>

      {/* Input Level Warnings */}
      {isRecording && !isPaused && (
        <div className="flex items-center justify-center gap-2 text-xs">
          {inputLevel === "Low" && !isSilent && (
            <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
              <Volume2 size={12} />
              Your voice is very quiet. Try speaking slightly closer to the mic.
            </span>
          )}
          {isClipping && (
            <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200 flex items-center gap-1">
              <AlertCircle size={12} />
              Input level is too high. Back away slightly to avoid distortion.
            </span>
          )}
          {inputLevel === "Good" && !isSilent && (
            <span className="text-[#059669] flex items-center gap-1.5 font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Audio input level optimal
            </span>
          )}
        </div>
      )}
    </div>
  );
};
