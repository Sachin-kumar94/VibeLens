import React, { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Check, X, AlertTriangle } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedBlobUrl, setCapturedBlobUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const startCamera = async () => {
    setCameraError(null);
    setIsInitializing(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera is not supported on this browser or device.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError(
          "Camera access is blocked. Please click the camera/lock icon in your browser URL bar and allow access to take a photo."
        );
      } else {
        setCameraError(err.message || "Unable to start camera stream.");
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (capturedBlobUrl) {
        URL.revokeObjectURL(capturedBlobUrl);
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-snapshot-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        setCapturedFile(file);
        setCapturedBlobUrl(url);
        stopCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  const retakePhoto = () => {
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
      setCapturedBlobUrl(null);
      setCapturedFile(null);
    }
    startCamera();
  };

  const confirmUsePhoto = () => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
  };

  return (
    <div className="rounded-3xl border border-[#DDD8CD] bg-[#FAF8F5] p-6 space-y-5 select-none">
      <div className="flex items-center justify-between border-b border-[#DDD8CD]/60 pb-3">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-[#17191A]" />
          <h3 className="font-bold text-sm text-[#17191A]">Camera Capture</h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-full hover:bg-[#EFE9DE] text-[#555A58] transition cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Camera Error State */}
      {cameraError ? (
        <div className="p-6 rounded-2xl bg-[#FDF2F0] border border-[#F5C2BC] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#F5C2BC] text-[#C23B22] flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <div className="text-xs font-semibold text-[#17191A]">Camera Unavailable</div>
          <p className="text-xs text-[#555A58] max-w-sm mx-auto leading-relaxed">{cameraError}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-[#17191A] text-white text-xs font-medium cursor-pointer"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-white border border-[#DDD8CD] text-[#17191A] text-xs font-medium cursor-pointer"
            >
              Switch to Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-[#17191A] aspect-[16/10] flex items-center justify-center">
          {/* Live Video Stream */}
          {!capturedBlobUrl && (
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          )}

          {/* Captured Snapshot Preview */}
          {capturedBlobUrl && (
            <img
              src={capturedBlobUrl}
              alt="Captured snapshot"
              className="w-full h-full object-cover"
            />
          )}

          {/* Initializing Spinner */}
          {isInitializing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span>Starting camera...</span>
            </div>
          )}
        </div>
      )}

      {/* Action Controls */}
      {!cameraError && (
        <div className="flex items-center justify-center gap-4 pt-2">
          {!capturedBlobUrl ? (
            <button
              type="button"
              onClick={takeSnapshot}
              disabled={isInitializing}
              className="px-6 py-3 rounded-full bg-[#17191A] hover:bg-[#2C302E] text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5484D] animate-pulse" />
              <span>Take Photo</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={retakePhoto}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-[#F6F3EC] border border-[#DDD8CD] text-[#17191A] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={confirmUsePhoto}
                className="px-6 py-2.5 rounded-full bg-[#30483E] hover:bg-[#253930] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
              >
                <Check size={14} />
                <span>Use This Photo</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
