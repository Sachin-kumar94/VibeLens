import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  AlertTriangle,
  Volume2,
  Clock,
  Sparkles,
  Activity,
  Layers,
} from "lucide-react";
import { usePoseDetection } from "../../hooks/usePoseDetection";
import { PoseLandmarkOverlay } from "../body/PoseLandmarkOverlay";
import { useInterviewSpeech, TranscriptSentence } from "../../hooks/useInterviewSpeech";
import { useIntegritySignals, IntegrityEvent } from "../../hooks/useIntegritySignals";

export interface RecordedAnswerData {
  blob: Blob;
  mediaUrl: string;
  duration: number;
  transcript: string;
  wpm: number;
  pauseCount: number;
  avgPauseDuration: number;
  longestPause: number;
  fillerCount: number;
  fillerRate: number;
  cameraFacingSignal: string;
  faceVisibility: number;
  postureSignal: string;
  framingQuality: string;
  audioQuality: string;
  videoQuality: string;
  hasVisualData: boolean;
  sentences?: TranscriptSentence[];
  integrityEvents?: IntegrityEvent[];
}

interface InterviewRecorderProps {
  isRecording: boolean;
  cameraMode: "enabled" | "audio_only";
  targetTimeMin: number;
  targetTimeMax: number;
  onRecordingComplete: (data: RecordedAnswerData) => void;
  onCancelRecording: () => void;
}

export const InterviewRecorder: React.FC<InterviewRecorderProps> = ({
  isRecording,
  cameraMode,
  targetTimeMin,
  targetTimeMax,
  onRecordingComplete,
  onCancelRecording,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [speechActivity, setSpeechActivity] = useState<"Speaking" | "Pause" | "Silence">("Silence");
  const [audioLevel, setAudioLevel] = useState(0);
  const [showPoseOverlay, setShowPoseOverlay] = useState(false);
  const [showSilenceHint, setShowSilenceHint] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const silenceTimerRef = useRef<any>(null);

  const getElapsed = useCallback(() => elapsedRef.current, []);

  // 1. Integrated Speech-to-Text Hook
  const {
    transcript,
    interimText,
    sentences,
    wordCount,
    wpm,
    pauseCount,
    avgPauseDuration,
    longestPause,
    fillerCount,
    fillerRate,
    resetSpeech,
  } = useInterviewSpeech({
    active: isRecording && !isPaused,
    getElapsedSeconds: getElapsed,
  });

  // 2. Integrated Integrity & Distraction Signals Hook
  const cameraTrack = cameraStream ? cameraStream.getVideoTracks()[0] : null;
  const micTrack = micStream ? micStream.getAudioTracks()[0] : null;

  const { events: integrityEvents, resetIntegrity } = useIntegritySignals({
    active: isRecording && !isPaused,
    getElapsedSeconds: getElapsed,
    cameraTrack,
    micTrack,
  });

  // 3. Pose & Landmark Detection Hook
  const {
    landmarks,
    hasPerson,
    framingStatus,
    shoulderTiltDeg,
    headTiltDeg,
  } = usePoseDetection(videoRef, {
    enabled: isRecording && !isPaused && cameraMode === "enabled",
    targetFps: 15,
  });

  // 4. Stream binding to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  // 5. Stream Acquisition & MediaRecorder Setup
  useEffect(() => {
    let isCancelled = false;

    if (!isRecording) {
      cleanupStreams();
      return;
    }

    async function initMedia() {
      setPermissionError(null);
      try {
        const audioConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };

        const videoConstraints =
          cameraMode === "enabled"
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              }
            : false;

        const combinedStream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: videoConstraints,
        });

        if (isCancelled) {
          combinedStream.getTracks().forEach((t) => t.stop());
          return;
        }

        const mic = new MediaStream(combinedStream.getAudioTracks());
        setMicStream(mic);

        if (cameraMode === "enabled") {
          const videoTracks = combinedStream.getVideoTracks();
          if (videoTracks.length > 0) {
            videoTracks[0].enabled = true;
          }
          setCameraStream(combinedStream);
          if (videoRef.current) {
            videoRef.current.srcObject = combinedStream;
            videoRef.current.play().catch(() => {});
          }
        }

        // Web Audio Analyser setup
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(mic);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        startRealWaveform(analyser);

        // MediaRecorder setup
        const mimeType = getOptimalMimeType(cameraMode === "enabled");
        const recorder = new MediaRecorder(combinedStream, {
          mimeType,
          audioBitsPerSecond: 128000,
        });

        recordedChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.start(250); // Timeslice 250ms
        mediaRecorderRef.current = recorder;
      } catch (err: any) {
        console.error("[InterviewRecorder] Stream error:", err);
        setPermissionError(
          err.name === "NotAllowedError"
            ? "Microphone or camera access was denied by your browser. Please permit access and retry."
            : err.message || "Failed to initialize recording devices."
        );
      }
    }

    initMedia();

    return () => {
      isCancelled = true;
      cleanupStreams();
    };
  }, [isRecording, cameraMode]);

  // Real-time audio FFT waveform animation
  const startRealWaveform = (analyser: AnalyserNode) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      const currentLevel = Math.min(100, Math.round((avg / 128) * 100));
      setAudioLevel(currentLevel);

      if (currentLevel > 18) {
        setSpeechActivity("Speaking");
        setShowSilenceHint(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      } else if (currentLevel > 5) {
        setSpeechActivity("Pause");
      } else {
        setSpeechActivity("Silence");
      }

      // Draw onto canvas waveform
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          ctx.lineWidth = 2;
          ctx.strokeStyle = "#525E50";
          ctx.beginPath();

          const sliceWidth = width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.lineTo(width, height / 2);
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Safe stream cleanup
  const cleanupStreams = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      setMicStream(null);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  // Wall-clock elapsed seconds timer
  useEffect(() => {
    if (!isRecording || isPaused) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        elapsedRef.current = next;

        // Silence reminder after 6s of complete silence
        if (speechActivity === "Silence" && next > 8 && !showSilenceHint) {
          setShowSilenceHint(true);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording, isPaused, speechActivity, showSilenceHint]);

  // MIME negotiation
  const getOptimalMimeType = (hasVideo: boolean): string => {
    if (hasVideo) {
      const videoTypes = [
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp9,opus",
        "video/webm",
        "video/mp4",
      ];
      for (const t of videoTypes) {
        if (MediaRecorder.isTypeSupported(t)) return t;
      }
      return "video/webm";
    }

    const audioTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];
    for (const t of audioTypes) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return "audio/webm";
  };

  // Pause / Resume
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop & Finalize Answer
  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    recorder.onstop = () => {
      const mime = recorder.mimeType || (cameraMode === "enabled" ? "video/webm" : "audio/webm");
      const blob = new Blob(recordedChunksRef.current, { type: mime });
      const mediaUrl = URL.createObjectURL(blob);

      // Determine observable posture & camera facing
      let cameraFacing = "Good";
      if (headTiltDeg > 18) cameraFacing = "Moderate";
      if (!hasPerson && cameraMode === "enabled") cameraFacing = "Limited";

      let posture = "Upright";
      if (shoulderTiltDeg > 8) posture = "Moderate";

      const finalDuration = elapsedSeconds;
      const actualWordCount = wordCount;
      const computedWpm = finalDuration > 5 ? Math.round((actualWordCount / finalDuration) * 60) : wpm;

      onRecordingComplete({
        blob,
        mediaUrl,
        duration: finalDuration,
        transcript: transcript.trim(),
        wpm: computedWpm,
        pauseCount,
        avgPauseDuration,
        longestPause,
        fillerCount,
        fillerRate,
        cameraFacingSignal: cameraFacing,
        faceVisibility: hasPerson ? 0.96 : 0.85,
        postureSignal: posture,
        framingQuality: framingStatus,
        audioQuality: audioLevel > 15 ? "Good" : "Fair",
        videoQuality: cameraMode === "enabled" ? "Good" : "Unavailable",
        hasVisualData: cameraMode === "enabled",
        sentences,
        integrityEvents,
      });

      cleanupStreams();
    };

    recorder.stop();
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isWithinTarget = elapsedSeconds >= targetTimeMin && elapsedSeconds <= targetTimeMax;

  return (
    <div className="bg-[#15171A] border border-[#2D3136] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between relative">
      {/* Permission Error Banner */}
      {permissionError && (
        <div className="p-4 bg-rose-900/80 border-b border-rose-700 text-rose-100 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{permissionError}</span>
          </div>
          <button
            onClick={onCancelRecording}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-[11px] font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Video / Audio Stage */}
      <div className="relative aspect-video sm:aspect-[16/10] w-full bg-[#0D0F11] flex items-center justify-center overflow-hidden">
        {cameraMode === "enabled" ? (
          <>
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && cameraStream && el.srcObject !== cameraStream) {
                  el.srcObject = cameraStream;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={(e) => {
                e.currentTarget.play().catch(() => {});
              }}
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {showPoseOverlay && (
              <PoseLandmarkOverlay
                landmarks={landmarks}
                isMirrored={true}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-white/70 space-y-3">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Mic className="w-8 h-8 text-[#FAF8F5]" />
            </div>
            <span className="text-xs font-mono text-white/50 tracking-wider uppercase">
              Audio-Only Dialogue Active
            </span>
          </div>
        )}

        {/* Live Audio Waveform Canvas Overlay */}
        <div className="absolute top-4 right-4 h-8 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 px-3 flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-white/70" />
          <canvas ref={canvasRef} width={80} height={20} className="w-20 h-4 opacity-90" />
        </div>

        {/* Recording Status & Wall-clock Timer: ● REC   00:46 */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white flex items-center gap-2.5 text-xs font-mono shadow-md">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPaused ? "bg-amber-400" : "bg-rose-500 animate-pulse"
              }`}
            />
            <span className="font-bold tracking-wider">{isPaused ? "PAUSED" : "● REC"}</span>
            <span className="text-white/30">|</span>
            <span className={isWithinTarget ? "text-emerald-400 font-bold" : "text-white font-semibold"}>
              {formatSec(elapsedSeconds)}
            </span>
          </div>

          {cameraMode === "enabled" && (
            <button
              onClick={() => setShowPoseOverlay(!showPoseOverlay)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium backdrop-blur-md border transition-colors flex items-center gap-1 cursor-pointer ${
                showPoseOverlay
                  ? "bg-emerald-900/60 border-emerald-500 text-emerald-200"
                  : "bg-black/60 border-white/10 text-white/70 hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Pose</span>
            </button>
          )}
        </div>

        {/* Live Metrics Overlay at Base of Video: Pace, Audio ✓, Framing, Camera ✓ */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white/90 flex items-center gap-1.5 shadow-sm">
              <span className="text-white/60">Pace:</span>
              <strong className="text-white">{wpm > 0 ? `${wpm} WPM` : "Calculating..."}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white/90 flex items-center gap-1.5 shadow-sm">
              <span className="text-white/60">Audio</span>
              <span className={audioLevel > 5 ? "text-emerald-400 font-bold" : "text-white/50"}>✓</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white/90 flex items-center gap-1.5 shadow-sm">
              <span className="text-white/60">Framing:</span>
              <strong className="text-emerald-400 capitalize">{framingStatus || "Good"}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white/90 flex items-center gap-1.5 shadow-sm">
              <span className="text-white/60">Camera</span>
              <span className={cameraMode === "enabled" ? "text-emerald-400 font-bold" : "text-zinc-400"}>
                {cameraMode === "enabled" ? "✓" : "Off"}
              </span>
            </span>
          </div>
        </div>

        {/* Non-intrusive silence reminder */}
        {showSilenceHint && (
          <div className="absolute top-14 left-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white/90 text-xs animate-in fade-in flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Take your time to structure your thoughts.</span>
          </div>
        )}
      </div>

      {/* Real-time Subtitle / Transcript Banner */}
      <div className="px-5 py-2.5 bg-[#0D0F11] border-t border-white/10 text-xs text-white/70 flex items-center gap-2 min-h-[38px]">
        <span className="font-mono text-[10px] text-white/40 shrink-0 uppercase tracking-wider">
          Live Transcript:
        </span>
        <p className="line-clamp-1 italic text-white/90">
          {interimText || transcript || "Listening for spoken response..."}
        </p>
      </div>

      {/* Centered Controls Below Camera: [ Pause ] [ Stop ] */}
      <div className="p-4 bg-[#15171A] border-t border-[#2D3136] flex items-center justify-center gap-3">
        <button
          onClick={togglePause}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition cursor-pointer flex items-center gap-2 hover:scale-102"
        >
          {isPaused ? <Play size={13} className="fill-current" /> : <Pause size={13} className="fill-current" />}
          <span>{isPaused ? "Resume" : "Pause"}</span>
        </button>

        <button
          onClick={handleStopRecording}
          className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-2 hover:scale-102"
        >
          <Square size={13} className="fill-current" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};
