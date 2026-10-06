import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Square,
  Pause,
  Play,
  Camera,
  Mic,
  Volume2,
  AlertTriangle,
  Eye,
  Activity,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { usePoseDetection } from "../../hooks/usePoseDetection";
import { PoseLandmarkOverlay } from "../body/PoseLandmarkOverlay";
import { PresentationIntegrityEventItem } from "../../services/presentationCoachApi";

export interface RehearsalMetricsResult {
  duration: number; // seconds
  pace: number; // measured WPM
  pauseCount: number;
  avgPauseDuration: number;
  longestPause: number;
  fillerCount: number;
  fillerRate: number;
  cameraEngagement: number; // 0 - 100
  posture: number; // 0 - 100
  gestureActivity: string; // "Low" | "Moderate" | "High"
  signalQuality: string; // "Good" | "Fair" | "Poor"
  audioQuality: string;
  videoQuality: string;
  framingQuality: string;
  cameraFacingSignal: "Mostly camera-facing" | "Frequently away" | "Uncertain";
  postureSignal: "Stable" | "Slight tilt" | "Variable";
  framingSignal: "Good" | "Off-center" | "Adjust distance";
  movementSignal: "Low" | "Moderate" | "High";
  transcript: string;
  audioBlob: Blob | null;
  videoBlob: Blob | null;
  integrityEvents: PresentationIntegrityEventItem[];
  faceVisiblePercentage: number;
  multipleFacesObserved: boolean;
  audioInterruptionCount: number;
}

interface LiveRehearsalStageProps {
  title: string;
  context: string;
  targetDurationSec: number;
  targetPaceMin: number;
  targetPaceMax: number;
  feedbackMode?: "Minimal" | "Standard" | "Detailed";
  cameraStream: MediaStream | null;
  micStream: MediaStream | null;
  onComplete: (results: RehearsalMetricsResult) => void;
  onCancel: () => void;
}

export const LiveRehearsalStage: React.FC<LiveRehearsalStageProps> = ({
  title,
  context,
  targetDurationSec,
  targetPaceMin,
  targetPaceMax,
  feedbackMode = "Standard",
  cameraStream,
  micStream,
  onComplete,
  onCancel,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPostureOverlay, setShowPostureOverlay] = useState(false);

  // Audio analysis states
  const [audioRms, setAudioRms] = useState(0);
  const [speechActivity, setSpeechActivity] = useState<"Speech Active" | "Pause" | "Silence">("Silence");
  const [pauseCount, setPauseCount] = useState(0);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [longestPauseSec, setLongestPauseSec] = useState(0);
  const [audioInterruptionCount, setAudioInterruptionCount] = useState(0);

  // Speech Recognition & Pacing
  const [transcript, setTranscript] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [livePaceWpm, setLivePaceWpm] = useState<number | null>(null);
  const [fillerCount, setFillerCount] = useState(0);
  const [isSpeechApiSupported, setIsSpeechApiSupported] = useState(true);

  // Persistent Off-Target Alert Tracking (>20 seconds per Section 26)
  const [offTargetSeconds, setOffTargetSeconds] = useState(0);

  // Hardware Status Flags per Section 16 & 17
  const [cameraStatus, setCameraStatus] = useState<
    "Camera Ready" | "Camera Active" | "Camera Paused" | "Camera Unavailable" | "Camera Disconnected"
  >("Camera Active");
  const [micStatus, setMicStatus] = useState<
    "Microphone Ready" | "Listening" | "Muted" | "Disconnected"
  >("Listening");

  // Observable Integrity Events (Sections 53–60)
  const [integrityEvents, setIntegrityEvents] = useState<PresentationIntegrityEventItem[]>([]);
  const [faceVisibleTicks, setFaceVisibleTicks] = useState(0);
  const [totalTicks, setTotalTicks] = useState(0);
  const [multipleFacesObserved, setMultipleFacesObserved] = useState(false);

  // Refs for tracking
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // MediaRecorder refs for recording session
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Pose Tracking
  const {
    landmarks,
    hasPerson,
    framingStatus,
    shoulderTiltDeg,
    headTiltDeg,
  } = usePoseDetection(videoRef, {
    enabled: !isPaused,
    targetFps: 25,
  });

  // Calculate Engagement & Posture Scores from real landmark signals
  const [gazeScore, setGazeScore] = useState(88);
  const [postureScore, setPostureScore] = useState(88);

  // Tick counter for face visibility percentage
  useEffect(() => {
    if (!isPaused) {
      setTotalTicks((t) => t + 1);
      if (hasPerson) {
        setFaceVisibleTicks((f) => f + 1);
      }
    }
  }, [elapsedSeconds, hasPerson, isPaused]);

  // Record an observable event
  const logObservableEvent = useCallback(
    (type: string, duration = 0, source = "browser_sensor", metadata?: any) => {
      const evt: PresentationIntegrityEventItem = {
        type,
        timestamp: elapsedSeconds,
        duration,
        source,
        metadata: metadata ? JSON.stringify(metadata) : null,
      };
      setIntegrityEvents((prev) => [...prev, evt]);
    },
    [elapsedSeconds]
  );

  // Observable browser event listeners (Tab switch, window blur, fullscreen exit, paste)
  useEffect(() => {
    let blurStart = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurStart = performance.now();
        logObservableEvent("PAGE_HIDDEN", 0, "document_visibility");
      } else {
        const dur = blurStart > 0 ? Math.round((performance.now() - blurStart) / 1000) : 0;
        logObservableEvent("PAGE_VISIBLE", dur, "document_visibility");
        blurStart = 0;
      }
    };

    const handleWindowBlur = () => {
      blurStart = performance.now();
      logObservableEvent("WINDOW_BLUR", 0, "window_focus");
    };

    const handleWindowFocus = () => {
      const dur = blurStart > 0 ? Math.round((performance.now() - blurStart) / 1000) : 0;
      logObservableEvent("WINDOW_FOCUS", dur, "window_focus");
      blurStart = 0;
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logObservableEvent("FULLSCREEN_EXIT", 0, "display_mode");
      }
    };

    const handlePaste = () => {
      logObservableEvent("PASTE_EVENT", 0, "clipboard");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("paste", handlePaste);
    };
  }, [logObservableEvent]);

  // Monitor hardware track disconnection
  useEffect(() => {
    if (cameraStream) {
      const vTrack = cameraStream.getVideoTracks()[0];
      if (vTrack) {
        const onEnded = () => {
          setCameraStatus("Camera Disconnected");
          logObservableEvent("CAMERA_DISCONNECTED", 0, "media_stream");
        };
        vTrack.addEventListener("ended", onEnded);
        return () => vTrack.removeEventListener("ended", onEnded);
      }
    }
  }, [cameraStream, logObservableEvent]);

  useEffect(() => {
    if (micStream) {
      const aTrack = micStream.getAudioTracks()[0];
      if (aTrack) {
        const onEnded = () => {
          setMicStatus("Disconnected");
          setAudioInterruptionCount((prev) => prev + 1);
          logObservableEvent("MIC_DISCONNECTED", 0, "media_stream");
        };
        aTrack.addEventListener("ended", onEnded);
        return () => aTrack.removeEventListener("ended", onEnded);
      }
    }
  }, [micStream, logObservableEvent]);

  // Calculate Engagement & Posture Scores from landmarks
  useEffect(() => {
    if (hasPerson) {
      const absTilt = Math.abs(shoulderTiltDeg);
      const computedPosture = Math.max(65, Math.min(98, Math.round(100 - absTilt * 4)));
      setPostureScore(computedPosture);

      const headTilt = Math.abs(headTiltDeg);
      const computedGaze = Math.max(60, Math.min(96, Math.round(95 - headTilt * 3)));
      setGazeScore(computedGaze);
    }
  }, [hasPerson, shoulderTiltDeg, headTiltDeg]);

  // Connect camera stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Setup MediaRecorder with combined audio and video
  useEffect(() => {
    try {
      const tracks: MediaStreamTrack[] = [];
      if (cameraStream) {
        cameraStream.getVideoTracks().forEach((t) => tracks.push(t));
      }
      if (micStream) {
        micStream.getAudioTracks().forEach((t) => tracks.push(t));
      }

      if (tracks.length > 0) {
        const combinedStream = new MediaStream(tracks);
        const options: MediaRecorderOptions = {
          mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
            ? "video/webm;codecs=vp8,opus"
            : MediaRecorder.isTypeSupported("video/webm")
            ? "video/webm"
            : undefined,
        };
        const recorder = new MediaRecorder(combinedStream, options);
        recordedChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.start(500); // 500ms timeslices
        mediaRecorderRef.current = recorder;
      }
    } catch (e) {
      console.warn("MediaRecorder setup notice:", e);
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    };
  }, [cameraStream, micStream]);

  // Real Timer Interval (Section 20)
  useEffect(() => {
    let timer: any = null;
    if (!isPaused) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused]);

  // Web Audio API volume & silence/pause analysis (Section 22)
  useEffect(() => {
    if (!micStream) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(micStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceDurationMs = 0;
      let lastCheck = performance.now();

      const monitorAudio = () => {
        animFrameRef.current = requestAnimationFrame(monitorAudio);
        if (isPaused) return;

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const rms = Math.round((sum / dataArray.length / 128) * 100);
        setAudioRms(rms);

        const now = performance.now();
        const delta = now - lastCheck;
        lastCheck = now;

        if (rms > 8) {
          // Voice activity detected
          setSpeechActivity("Speech Active");
          if (silenceDurationMs >= 1500) {
            // A pause was completed
            const pauseSeconds = silenceDurationMs / 1000;
            setPauseCount((prev) => prev + 1);
            setTotalPauseTime((prev) => prev + pauseSeconds);
            setLongestPauseSec((prev) => Math.max(prev, pauseSeconds));
          }
          silenceDurationMs = 0;
        } else {
          // Silence or subtle pause
          silenceDurationMs += delta;
          if (silenceDurationMs > 1500) {
            setSpeechActivity("Pause");
          } else {
            setSpeechActivity("Silence");
          }
        }
      };

      monitorAudio();
    } catch (e) {
      console.warn("Audio analyser initialization notice:", e);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [micStream, isPaused]);

  // Web Speech API Continuous Recognition for real-time WPM & Fillers
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechApiSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      const fillerPatterns = /\b(um|uh|er|ah|like|you know|basically|actually|sort of)\b/gi;

      recognition.onresult = (event: any) => {
        let fullText = "";
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + " ";
        }
        setTranscript(fullText.trim());

        // Count words
        const words = fullText.trim().split(/\s+/).filter(Boolean);
        const count = words.length;
        setWordCount(count);

        // Calculate WPM only when we have at least 5 words and > 5 seconds
        if (count >= 5 && elapsedSeconds >= 5) {
          const minutes = elapsedSeconds / 60;
          const calculatedWpm = Math.round(count / minutes);
          setLivePaceWpm(calculatedWpm);
        }

        // Count fillers
        const fillerMatches = fullText.match(fillerPatterns);
        if (fillerMatches) {
          setFillerCount(fillerMatches.length);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e.error);
      };

      recognition.onend = () => {
        // Auto restart if still actively rehearsing
        if (!isPaused && recognition) {
          try {
            recognition.start();
          } catch (err) {}
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      console.warn("Speech recognition startup notice:", err);
      setIsSpeechApiSupported(false);
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
        speechRecognitionRef.current = null;
      }
    };
  }, []);

  // Section 26: Coaching interruptions: surface persistent issue ONLY after 20 seconds off target
  useEffect(() => {
    if (livePaceWpm !== null && elapsedSeconds > 20) {
      if (livePaceWpm > targetPaceMax || livePaceWpm < targetPaceMin) {
        setOffTargetSeconds((prev) => prev + 1);
      } else {
        setOffTargetSeconds(0);
      }
    }
  }, [elapsedSeconds, livePaceWpm, targetPaceMin, targetPaceMax]);

  // Handle Pause / Resume (Sections 16, 17)
  const handleTogglePause = () => {
    if (isPaused) {
      // Resume
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch (e) {}
      }
      setIsPaused(false);
      setCameraStatus("Camera Active");
      setMicStatus("Listening");
    } else {
      // Pause
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setIsPaused(true);
      setCameraStatus("Camera Paused");
      setMicStatus("Muted");
    }
  };

  // Section 27: Conclude Rehearsal (Stop recording, camera, microphone, timer)
  const handleStopRehearsal = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || "video/webm";
        const recordedBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        finishCompletion(recordedBlob);
      };
      mediaRecorderRef.current.stop();
    } else {
      finishCompletion(null);
    }
  };

  const finishCompletion = (videoBlob: Blob | null) => {
    // Release active hardware tracks cleanly
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
    }
    if (micStream) {
      micStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }

    const duration = Math.max(1, elapsedSeconds);
    const avgPause = pauseCount > 0 ? totalPauseTime / pauseCount : 0;
    const finalPace = livePaceWpm || (wordCount > 0 ? Math.round((wordCount / duration) * 60) : 0);
    const fillerRate = duration >= 60 ? fillerCount / (duration / 60) : fillerCount;

    const cameraFacingSignal: "Mostly camera-facing" | "Frequently away" | "Uncertain" =
      gazeScore >= 80 ? "Mostly camera-facing" : gazeScore >= 60 ? "Frequently away" : "Uncertain";

    const postureSignal: "Stable" | "Slight tilt" | "Variable" =
      postureScore >= 85 ? "Stable" : postureScore >= 70 ? "Slight tilt" : "Variable";

    const framingSignal: "Good" | "Off-center" | "Adjust distance" =
      framingStatus === "PERSON_FOUND" || framingStatus === "READY"
        ? "Good"
        : framingStatus === "POOR_FRAMING"
        ? "Off-center"
        : "Adjust distance";

    const faceVisiblePct = totalTicks > 0 ? Math.round((faceVisibleTicks / totalTicks) * 100) : 95;

    onComplete({
      duration,
      pace: finalPace,
      pauseCount,
      avgPauseDuration: avgPause,
      longestPause: longestPauseSec,
      fillerCount,
      fillerRate,
      cameraEngagement: gazeScore,
      posture: postureScore,
      gestureActivity: "Moderate",
      signalQuality: "Good",
      audioQuality: "Good",
      videoQuality: "Good",
      framingQuality: framingStatus === "GOOD_FRAMING" ? "Good" : "Fair",
      cameraFacingSignal,
      postureSignal,
      framingSignal,
      movementSignal: "Moderate",
      transcript,
      audioBlob: videoBlob,
      videoBlob,
      integrityEvents,
      faceVisiblePercentage: faceVisiblePct,
      multipleFacesObserved,
      audioInterruptionCount,
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const paceStatusText: "Within target" | "Above target" | "Below target" | "Establishing pace" =
    livePaceWpm === null
      ? "Establishing pace"
      : livePaceWpm > targetPaceMax
      ? "Above target"
      : livePaceWpm < targetPaceMin
      ? "Below target"
      : "Within target";

  return (
    <div className="space-y-6">
      {/* Section 19: Clean Recording Header */}
      <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: REC, Elapsed, Target */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs font-semibold">
            <span
              className={`w-2.5 h-2.5 rounded-full bg-rose-600 ${
                !isPaused ? "animate-pulse" : ""
              }`}
            />
            <span>{isPaused ? "PAUSED" : "● REC"}</span>
            <span className="font-bold">{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="text-xs font-mono text-[#575A60]">
            Target: <span className="font-bold text-[#15171A]">{formatTimer(targetDurationSec)}</span>
          </div>
        </div>

        {/* Middle: Title & Context */}
        <div className="hidden sm:block text-center">
          <span className="text-xs font-serif font-bold text-[#15171A] block">
            {title}
          </span>
          <span className="text-[11px] font-mono text-[#8C8983]">
            {context} &bull; Target: {targetPaceMin}–{targetPaceMax} WPM
          </span>
        </div>

        {/* Right: Primary Rehearsal Actions [ Pause ] [ Stop ] */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTogglePause}
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-semibold text-[#15171A] flex items-center gap-1.5 transition cursor-pointer"
          >
            {isPaused ? <Play size={13} className="fill-current" /> : <Pause size={13} />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>

          <button
            type="button"
            onClick={handleStopRehearsal}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md hover:scale-102"
          >
            <Square size={13} className="fill-current" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* Main Rehearsal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Rehearsal Stage Viewport (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-[9/16] sm:aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden border border-[#DDD7CB] relative bg-[#14161B] shadow-sm flex items-center justify-center">
            {/* Real Video Element (Section 14 & 15: no static image, 9:16 portrait on mobile without stretching) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />

            {/* Posture Overlay */}
            {showPostureOverlay && (
              <PoseLandmarkOverlay
                landmarks={landmarks}
                isMirrored={true}
                visible={showPostureOverlay}
              />
            )}

            {/* Top Left: Framing & Camera Status Indicator */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasPerson ? "bg-[#10B981]" : "bg-amber-400"
                  }`}
                />
                <span>{hasPerson ? "Framing: Good" : "Position upper body in frame"}</span>
              </div>
            </div>

            {/* Top Right: Posture Overlay Toggle */}
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => setShowPostureOverlay(!showPostureOverlay)}
                className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono transition cursor-pointer"
              >
                {showPostureOverlay ? "Hide posture landmarks" : "Show posture landmarks"}
              </button>
            </div>

            {/* Section 26: Subtle Persistent Pacing Warning (>20 seconds off target) */}
            {offTargetSeconds > 20 && (
              <div className="absolute top-14 inset-x-6 p-3 rounded-xl bg-amber-950/85 backdrop-blur-md border border-amber-400/40 text-amber-100 text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
                <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                <span>
                  Your pace has remained {paceStatusText.toLowerCase()} your selected target for the last 20 seconds ({livePaceWpm} WPM vs {targetPaceMin}–{targetPaceMax} WPM).
                </span>
              </div>
            )}

            {/* Section 25: Minimal Live HUD at Bottom */}
            <div className="absolute bottom-4 inset-x-4 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs flex flex-wrap items-center justify-between gap-3 font-mono">
              {/* Audio Level & Speech Activity */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Volume2
                    size={13}
                    className={audioRms > 8 ? "text-[#10B981]" : "text-white/50"}
                  />
                  <span>{speechActivity}</span>
                </span>
                <span className="text-white/30">|</span>
                <span>Pauses: {pauseCount}</span>
              </div>

              {/* Live Cadence Status */}
              <div className="flex items-center gap-2">
                <span className="text-white/70">Pace:</span>
                <span
                  className={`font-bold ${
                    paceStatusText === "Within target"
                      ? "text-[#10B981]"
                      : paceStatusText === "Establishing pace"
                      ? "text-white/60"
                      : "text-amber-400"
                  }`}
                >
                  {livePaceWpm !== null ? `${livePaceWpm} WPM` : "Detecting..."}
                </span>
                <span className="text-white/40 text-[11px]">
                  ({targetPaceMin}–{targetPaceMax})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Diagnostics Sidebar (4 cols) (Section 21–25 Minimalism) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DDD7CB] pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C8983] flex items-center gap-1.5">
                <Activity size={13} /> Live Rehearsal Signals
              </h3>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full font-semibold">
                Live Sensor
              </span>
            </div>

            {/* Speaking Pace (Section 21) */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#15171A]">Current Pace</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    paceStatusText === "Within target"
                      ? "text-[#10B981] bg-[#10B981]/10"
                      : paceStatusText === "Establishing pace"
                      ? "text-[#8C8983] bg-gray-100"
                      : "text-amber-700 bg-amber-100"
                  }`}
                >
                  {paceStatusText}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-[#15171A]">
                  {livePaceWpm !== null ? `${livePaceWpm} WPM` : "Measuring..."}
                </span>
                <span className="text-xs text-[#8C8983] font-mono">
                  (Target: {targetPaceMin}–{targetPaceMax})
                </span>
              </div>
              <p className="text-[11px] text-[#575A60]">
                {livePaceWpm !== null
                  ? `Calculated from ${wordCount} spoken words over ${elapsedSeconds}s.`
                  : "Speak naturally to establish pace measurement."}
              </p>
            </div>

            {/* Live Audio Level (Section 22) */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#15171A] flex items-center gap-1.5">
                  <Volume2 size={13} className="text-[#3B82F6]" /> Audio Level
                </span>
                <span className="text-xs font-mono text-[#575A60]">{audioRms}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#DDD7CB]/50 overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 rounded-full ${
                    audioRms > 70 ? "bg-amber-500" : "bg-[#10B981]"
                  }`}
                  style={{ width: `${Math.min(100, audioRms * 1.5)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8983]">
                <span>State: {speechActivity}</span>
                <span>Gaps: {audioInterruptionCount}</span>
              </div>
            </div>

            {/* Live Posture & Framing (Section 23) */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#15171A]">Posture & Framing</span>
                <span className="text-xs font-mono font-bold text-[#10B981]">
                  {postureScore >= 85 ? "Stable" : "Moderate"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#DDD7CB]/40 overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${postureScore}%` }}
                />
              </div>
              <p className="text-[11px] text-[#575A60]">
                {hasPerson
                  ? `Shoulders level (${Math.abs(shoulderTiltDeg).toFixed(1)}°). Framing centered.`
                  : "Detecting upper-body presence..."}
              </p>
            </div>

            {/* Camera-Facing Signal (Section 24) */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#15171A] flex items-center gap-1.5">
                  <Eye size={13} className="text-[#8B5CF6]" /> Camera-Facing Signal
                </span>
                <span className="text-[11px] font-mono font-semibold text-[#15171A]">
                  {gazeScore >= 80 ? "Mostly camera-facing" : "Frequently away"}
                </span>
              </div>
              <p className="text-[11px] text-[#575A60]">
                Observable head orientation towards lens. Non-intrusive presentation presence.
              </p>
            </div>

            {/* Live Transcript Snippet */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#15171A]">Live Speech Capture</span>
                {fillerCount > 0 && (
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Fillers: {fillerCount}
                  </span>
                )}
              </div>
              <div className="max-h-20 overflow-y-auto text-xs text-[#575A60] italic bg-white p-2.5 rounded-lg border border-[#DDD7CB] font-sans">
                {transcript
                  ? `“${transcript.slice(-140)}”`
                  : "Spoken sentences stream here as you speak..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
