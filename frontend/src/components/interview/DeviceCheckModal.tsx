import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Volume2,
  Sparkles,
} from "lucide-react";

interface DeviceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  cameraMode: "enabled" | "audio_only";
}

export const DeviceCheckModal: React.FC<DeviceCheckModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  cameraMode,
}) => {
  const [cameraStatus, setCameraStatus] = useState<"checking" | "ready" | "error">(
    cameraMode === "audio_only" ? "ready" : "checking"
  );
  const [micStatus, setMicStatus] = useState<"checking" | "ready" | "error">("checking");
  const [netStatus, setNetStatus] = useState<"ready" | "error">(navigator.onLine ? "ready" : "error");
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Robust stream binding to video element
  useEffect(() => {
    if (videoRef.current && mediaStream && cameraMode !== "audio_only") {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => {
        console.warn("[DeviceCheckModal] video play error:", err);
      });
    }
  }, [mediaStream, cameraStatus, cameraMode]);

  const startCheck = async () => {
    setErrorMessage(null);
    if (cameraMode !== "audio_only") setCameraStatus("checking");
    setMicStatus("checking");

    // Clean previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setMediaStream(null);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          cameraMode === "audio_only"
            ? false
            : {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setMediaStream(stream);

      // Camera check
      if (cameraMode !== "audio_only") {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && videoTrack.readyState === "live") {
          setCameraStatus("ready");
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        } else {
          setCameraStatus("error");
          setErrorMessage("Camera signal could not be established.");
        }
      }

      // Mic & Audio Level check
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack && audioTrack.readyState === "live") {
        setMicStatus("ready");

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } else {
        setMicStatus("error");
        setErrorMessage("Microphone signal could not be established.");
      }
    } catch (err: any) {
      console.warn("[DeviceCheck] Access error:", err);
      if (cameraMode !== "audio_only") setCameraStatus("error");
      setMicStatus("error");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Microphone or camera permission was blocked by the browser. Please click the lock/camera icon in your URL bar and allow permissions.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No microphone or camera hardware found. Please verify your hardware connection.");
      } else {
        setErrorMessage(err.message || "Failed to access media devices.");
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCheck();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isOpen, cameraMode]);

  useEffect(() => {
    const handleNetChange = () => setNetStatus(navigator.onLine ? "ready" : "error");
    window.addEventListener("online", handleNetChange);
    window.addEventListener("offline", handleNetChange);
    return () => {
      window.removeEventListener("online", handleNetChange);
      window.removeEventListener("offline", handleNetChange);
    };
  }, []);

  if (!isOpen) return null;

  const isAllReady =
    (cameraMode === "audio_only" || cameraStatus === "ready") &&
    micStatus === "ready" &&
    netStatus === "ready";

  const handleContinue = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onProceed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15171A]/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#525E50]/10 flex items-center justify-center text-[#525E50]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#15171A]">
                Pre-Flight Device Verification
              </h3>
              <p className="text-xs text-[#73716B]">
                Verify your recording hardware before entering the interview room.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#73716B] hover:text-[#15171A] hover:bg-[#E5E0D8]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview */}
        {cameraMode !== "audio_only" && (
          <div className="relative aspect-video bg-[#15171A] rounded-xl overflow-hidden border border-[#E5E0D8]">
            {mediaStream && mediaStream.getVideoTracks().length > 0 ? (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && el.srcObject !== mediaStream) {
                    el.srcObject = mediaStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  e.currentTarget.play().catch(() => {});
                  setCameraStatus("ready");
                }}
                className="w-full h-full object-cover transform -scale-x-100 block"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#A3A099] space-y-2">
                <CameraOff className="w-8 h-8 opacity-60" />
                <span className="text-xs">
                  {cameraStatus === "checking" ? "Checking camera input..." : "Camera feed unavailable"}
                </span>
              </div>
            )}
            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-[#15171A]/80 backdrop-blur-sm text-[11px] font-medium text-white flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${cameraStatus === "ready" || (mediaStream && mediaStream.getVideoTracks().length > 0) ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              <span>{cameraStatus === "ready" || (mediaStream && mediaStream.getVideoTracks().length > 0) ? "Live Framing Active" : "Testing Sensor"}</span>
            </div>
          </div>
        )}

        {/* Diagnostic Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Camera Check */}
          {cameraMode !== "audio_only" && (
            <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#73716B]">Camera Video</span>
                {cameraStatus === "ready" ? (
                  <CheckCircle2 className="w-4 h-4 text-[#525E50]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="mt-2 text-sm font-semibold text-[#15171A] flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-[#73716B]" />
                <span>{cameraStatus === "ready" ? "Operational" : "Unavailable"}</span>
              </div>
            </div>
          )}

          {/* Microphone Check */}
          <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#73716B]">Microphone</span>
              {micStatus === "ready" ? (
                <CheckCircle2 className="w-4 h-4 text-[#525E50]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div className="mt-2">
              <div className="text-sm font-semibold text-[#15171A] flex items-center space-x-1.5">
                <Mic className="w-4 h-4 text-[#73716B]" />
                <span>{micStatus === "ready" ? "Active Stream" : "Unavailable"}</span>
              </div>
              {micStatus === "ready" && (
                <div className="mt-2 w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#525E50] transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Network Check */}
          <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#73716B]">Network Uplink</span>
              {netStatus === "ready" ? (
                <CheckCircle2 className="w-4 h-4 text-[#525E50]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              )}
            </div>
            <div className="mt-2 text-sm font-semibold text-[#15171A] flex items-center space-x-1.5">
              <Wifi className="w-4 h-4 text-[#73716B]" />
              <span>{netStatus === "ready" ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>

        {/* Error / Recovery Guidance */}
        {errorMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Hardware Access Note: </span>
              {errorMessage}
            </div>
            <button
              onClick={startCheck}
              className="p-1 text-amber-700 hover:text-amber-900 transition-colors"
              title="Retry verification"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={startCheck}
            className="px-4 py-2 text-xs font-medium text-[#73716B] hover:text-[#15171A] border border-[#E5E0D8] rounded-xl bg-white hover:bg-[#F2EFE9] transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-test Hardware</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#73716B] hover:text-[#15171A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!isAllReady}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 ${
                isAllReady
                  ? "bg-[#525E50] hover:bg-[#434E41] text-white"
                  : "bg-[#E5E0D8] text-[#A3A099] cursor-not-allowed"
              }`}
            >
              <span>Enter Interview Lobby</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
