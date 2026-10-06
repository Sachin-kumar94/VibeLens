import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Camera,
  Mic,
  CheckCircle2,
  AlertCircle,
  Clock,
  Gauge,
  Sliders,
  ShieldCheck,
  Play,
  Volume2,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

export interface PresentationSetupConfig {
  title: string;
  context: string;
  targetDurationSec: number;
  targetPaceMin: number;
  targetPaceMax: number;
  topic?: string;
  userNotes?: string;
  feedbackMode: "Minimal" | "Standard" | "Detailed";
  cameraStream: MediaStream | null;
  micStream: MediaStream | null;
}

interface PreSessionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRehearsal: (config: PresentationSetupConfig) => void;
  initialContext?: string;
  initialDurationSec?: number;
  initialPaceMin?: number;
  initialPaceMax?: number;
  initialTopic?: string;
  initialNotes?: string;
  initialFeedbackMode?: "Minimal" | "Standard" | "Detailed";
}

import {
  PRESENTATION_CONTEXTS,
  DURATION_OPTIONS,
  PACE_OPTIONS,
} from "../../types/presentation";

export const PreSessionSetupModal: React.FC<PreSessionSetupModalProps> = ({
  isOpen,
  onClose,
  onStartRehearsal,
  initialContext = "Project Demo",
  initialDurationSec = 180,
  initialPaceMin = 140,
  initialPaceMax = 150,
  initialTopic = "",
  initialNotes = "",
  initialFeedbackMode = "Standard",
}) => {
  const [context, setContext] = useState(initialContext);
  const [durationOption, setDurationOption] = useState(initialDurationSec);
  const [customDurationMin, setCustomDurationMin] = useState(3);
  const [paceMin, setPaceMin] = useState(initialPaceMin);
  const [paceMax, setPaceMax] = useState(initialPaceMax);
  const [topic, setTopic] = useState(initialTopic);
  const [userNotes, setUserNotes] = useState(initialNotes);
  const [feedbackMode, setFeedbackMode] = useState<"Minimal" | "Standard" | "Detailed">(initialFeedbackMode);

  // Hardware states (Sections 10, 11, 12, 16, 17)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<"idle" | "requesting" | "ready" | "blocked" | "unavailable">("idle");
  const [micState, setMicState] = useState<"idle" | "requesting" | "ready" | "blocked" | "unavailable">("idle");
  const [micLevel, setMicLevel] = useState<number>(0);
  const [personInFrame, setPersonInFrame] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setContext(initialContext);
      setDurationOption(initialDurationSec);
      setPaceMin(initialPaceMin);
      setPaceMax(initialPaceMax);
      setTopic(initialTopic);
      setUserNotes(initialNotes);
      setFeedbackMode(initialFeedbackMode);

      // Section 10 & 11: Request camera and microphone automatically on modal open (triggered by user clicking Start Rehearsal)
      startHardwareCheck();
    } else {
      cleanupHardware();
    }
  }, [isOpen]);

  // Attach camera stream to video preview element
  useEffect(() => {
    if (videoPreviewRef.current && cameraStream) {
      videoPreviewRef.current.srcObject = cameraStream;
      setPersonInFrame(true);
    }
  }, [cameraStream]);

  // Start both device checks
  const startHardwareCheck = async () => {
    await Promise.all([requestCamera(), requestMicrophone()]);
  };

  const cleanupHardware = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setCameraState("idle");
    setMicState("idle");
    setMicLevel(0);
    setPersonInFrame(false);
  };

  const handleClose = () => {
    cleanupHardware();
    onClose();
  };

  // Section 10 & 12: Request Camera
  const requestCamera = async () => {
    setCameraState("requesting");
    setCameraErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setCameraStream(stream);
      setCameraState("ready");
      setPersonInFrame(true);
    } catch (err: any) {
      console.warn("Camera request error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraState("blocked");
        setCameraErrorMessage("Camera permission was denied. Please allow camera in browser URL bar.");
      } else {
        setCameraState("unavailable");
        setCameraErrorMessage(err.message || "Camera device unavailable or currently in use by another app.");
      }
    }
  };

  // Section 11 & 12: Request Microphone
  const requestMicrophone = async () => {
    setMicState("requesting");
    setMicErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone API is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      setMicStream(stream);
      setMicState("ready");

      // Monitor actual microphone input level (Section 22)
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const pollVolume = () => {
          animFrameRef.current = requestAnimationFrame(pollVolume);
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        };
        pollVolume();
      } catch (e) {
        console.warn("Audio meter init notice:", e);
      }
    } catch (err: any) {
      console.warn("Microphone request error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicState("blocked");
        setMicErrorMessage("Microphone access was denied. Please enable mic access in your browser.");
      } else {
        setMicState("unavailable");
        setMicErrorMessage(err.message || "Microphone device unavailable or in use.");
      }
    }
  };

  // Handle Begin
  const handleBegin = () => {
    const targetSec = durationOption === 0 ? customDurationMin * 60 : durationOption;

    onStartRehearsal({
      title: topic.trim() ? `${topic.trim()} (${context})` : `${context} Rehearsal`,
      context,
      targetDurationSec: targetSec,
      targetPaceMin: paceMin,
      targetPaceMax: paceMax,
      topic,
      userNotes,
      feedbackMode,
      cameraStream,
      micStream,
    });
  };

  if (!isOpen) return null;

  const isReadyToStart = cameraState === "ready" && micState === "ready";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#DDD7CB] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD7CB] bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8983]">
                Device Check & Confirmation
              </span>
            </div>
            <h2 className="text-base font-serif font-bold text-[#15171A]">
              Rehearsal Stage Verification
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#15171A] hover:bg-[#FAF8F5] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 12: Device Check Badges */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#15171A] font-bold">
              Hardware Readiness Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {/* Camera */}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  cameraState === "ready"
                    ? "bg-white border-[#10B981]/40 text-[#10B981]"
                    : "bg-white border-rose-200 text-rose-700"
                }`}
              >
                {cameraState === "ready" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span className="font-semibold">
                  Camera {cameraState === "ready" ? "✓" : "Unavailable"}
                </span>
              </div>

              {/* Microphone */}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  micState === "ready"
                    ? "bg-white border-[#10B981]/40 text-[#10B981]"
                    : "bg-white border-rose-200 text-rose-700"
                }`}
              >
                {micState === "ready" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span className="font-semibold">
                  Microphone {micState === "ready" ? "✓" : "Unavailable"}
                </span>
              </div>

              {/* Person in Frame */}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  personInFrame
                    ? "bg-white border-[#10B981]/40 text-[#10B981]"
                    : "bg-white border-[#DDD7CB] text-[#8C8983]"
                }`}
              >
                {personInFrame ? <CheckCircle2 size={14} /> : <span className="w-3.5 h-3.5 rounded-full border border-current" />}
                <span className="font-semibold">Person ✓</span>
              </div>

              {/* Audio Signal */}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  micState === "ready"
                    ? "bg-white border-[#10B981]/40 text-[#10B981]"
                    : "bg-white border-[#DDD7CB] text-[#8C8983]"
                }`}
              >
                {micState === "ready" ? <CheckCircle2 size={14} /> : <span className="w-3.5 h-3.5 rounded-full border border-current" />}
                <span className="font-semibold">Audio ✓</span>
              </div>
            </div>
          </div>

          {/* Video Preview & Audio Meter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera Viewport */}
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD7CB] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#15171A] flex items-center gap-1.5">
                  <Camera size={13} className="text-[#10B981]" /> Live Camera Feed
                </span>
                <span className="text-[10px] font-mono text-[#8C8983]">
                  {cameraState === "ready" ? "Active" : "Pending"}
                </span>
              </div>

              <div className="aspect-video rounded-lg bg-[#14161B] overflow-hidden relative flex items-center justify-center border border-[#DDD7CB]">
                {cameraState === "ready" && cameraStream ? (
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="text-center p-3 text-xs text-white/60">
                    {cameraState === "requesting"
                      ? "Connecting camera..."
                      : cameraState === "blocked"
                      ? "Camera blocked in browser"
                      : "Camera not started"}
                  </div>
                )}
              </div>

              {cameraErrorMessage && (
                <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 leading-tight">
                  {cameraErrorMessage}
                </div>
              )}

              {cameraState !== "ready" && (
                <button
                  type="button"
                  onClick={requestCamera}
                  disabled={cameraState === "requesting"}
                  className="w-full py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw size={12} className={cameraState === "requesting" ? "animate-spin" : ""} />
                  <span>Retry Camera</span>
                </button>
              )}
            </div>

            {/* Microphone Viewport */}
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD7CB] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#15171A] flex items-center gap-1.5">
                  <Mic size={13} className="text-[#3B82F6]" /> Microphone Meter
                </span>
                <span className="text-[10px] font-mono text-[#8C8983]">
                  {micState === "ready" ? `${micLevel}%` : "Pending"}
                </span>
              </div>

              <div className="aspect-video rounded-lg bg-[#FAF8F5] p-3 flex flex-col justify-center gap-2 border border-[#DDD7CB]">
                <div className="flex items-center justify-between text-[11px] text-[#8C8983] font-mono">
                  <span className="flex items-center gap-1">
                    <Volume2 size={12} /> Real-time Level
                  </span>
                  <span>{micLevel}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#DDD7CB]/50 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 rounded-full ${
                      micLevel > 70 ? "bg-amber-500" : "bg-[#10B981]"
                    }`}
                    style={{ width: `${micLevel}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#575A60] font-mono text-center">
                  {micState === "ready"
                    ? micLevel > 4
                      ? "Speech signal detected ✓"
                      : "Speak normally to test audio"
                    : "Microphone permission required"}
                </p>
              </div>

              {micErrorMessage && (
                <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 leading-tight">
                  {micErrorMessage}
                </div>
              )}

              {micState !== "ready" && (
                <button
                  type="button"
                  onClick={requestMicrophone}
                  disabled={micState === "requesting"}
                  className="w-full py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw size={12} className={micState === "requesting" ? "animate-spin" : ""} />
                  <span>Retry Microphone</span>
                </button>
              )}
            </div>
          </div>

          {/* Practice Summary Checklist */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1.5 text-xs">
            <span className="font-mono uppercase text-[#8C8983] text-[10px] block">
              Session Configuration
            </span>
            <div className="flex flex-wrap items-center gap-3 text-[#15171A] font-medium">
              <span><strong>Type:</strong> {context}</span>
              <span>&bull;</span>
              <span><strong>Target:</strong> {Math.floor((durationOption === 0 ? customDurationMin * 60 : durationOption) / 60)} min</span>
              <span>&bull;</span>
              <span><strong>Pace Goal:</strong> {paceMin}–{paceMax} WPM</span>
              <span>&bull;</span>
              <span><strong>Mode:</strong> {feedbackMode}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#DDD7CB] bg-[#FAF8F5] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-[#575A60] hover:text-[#15171A] transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleBegin}
            disabled={!isReadyToStart}
            className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              isReadyToStart
                ? "bg-[#15171A] hover:bg-[#252833] text-white cursor-pointer shadow-md hover:scale-102"
                : "bg-[#DDD7CB] text-[#8C8983] cursor-not-allowed"
            }`}
          >
            <Play size={14} className="fill-current" />
            <span>Begin Rehearsal Stage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
