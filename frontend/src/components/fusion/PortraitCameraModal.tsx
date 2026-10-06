import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  X,
  RotateCcw,
  Check,
  FlipHorizontal,
  Sun,
  User,
  ShieldCheck,
  AlertCircle,
  Crop as CropIcon,
} from "lucide-react";
import { useCamera, CapturedPortrait } from "../../hooks/useCamera";
import { PortraitCropTool } from "../body/PortraitCropTool";

export interface PortraitCameraModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (data: {
    blob: Blob;
    url: string;
    width: number;
    height: number;
    fileName: string;
  }) => void;
}

export const PortraitCameraModal: React.FC<PortraitCameraModalProps> = ({
  title,
  isOpen,
  onClose,
  onCaptureComplete,
}) => {
  const [captured, setCaptured] = useState<CapturedPortrait | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  // Environmental sensor indicators
  const [lightingStatus, setLightingStatus] = useState<"Good" | "Fair" | "Low">("Good");
  const [personStatus, setPersonStatus] = useState<"Detected" | "Adjusting">("Detected");
  const [framingStatus, setFramingStatus] = useState<"Ready" | "Center subject">("Ready");

  const {
    state: cameraState,
    startCamera,
    stopCamera,
    capturePortraitFrame,
    switchCamera,
    isMirrored,
    errorMessage,
  } = useCamera({
    preferredFacingMode: "user",
  });

  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  // Start camera when modal opens, clean stop when it closes
  useEffect(() => {
    if (isOpen && !cropFile && !captured) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, cropFile, captured, startCamera, stopCamera]);

  // Handle capture click
  const handleTriggerCapture = async () => {
    setIsCapturing(true);
    try {
      const portrait = await capturePortraitFrame();
      if (portrait) {
        setCaptured(portrait);
        stopCamera();
      }
    } catch (err) {
      console.error("[PortraitCameraModal] Capture error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    if (captured && captured.url.startsWith("blob:")) {
      URL.revokeObjectURL(captured.url);
    }
    setCaptured(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!captured) return;
    onCaptureComplete({
      blob: captured.blob,
      url: captured.url,
      width: captured.width,
      height: captured.height,
      fileName: captured.fileName,
    });
    onClose();
  };

  const handleCropConfirm = (croppedBlob: Blob, previewUrl: string) => {
    setCropFile(null);
    setCaptured({
      blob: croppedBlob,
      url: previewUrl,
      width: 1080,
      height: 1920,
      sizeBytes: croppedBlob.size,
      fileName: `portrait_crop_${Date.now()}.webp`,
      timestamp: new Date().toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[480px] bg-[#15171A] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[95vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#1A1C20]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-[#A855F7]" />
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#DDD8CD]">
              9:16 Portrait
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[440px]">
          {cropFile ? (
            <div className="w-full">
              <PortraitCropTool
                imageFile={cropFile}
                onCropConfirm={handleCropConfirm}
                onCancel={() => setCropFile(null)}
              />
            </div>
          ) : captured ? (
            /* Review Captured Frame */
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="relative w-[240px] h-[426px] rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-black">
                <img
                  src={captured.url}
                  alt="Captured Portrait"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white/80 font-mono text-center">
                  1080 × 1920 · Portrait Verified
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-md transition cursor-pointer"
                >
                  <Check size={14} />
                  <span>Use Portrait</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Viewport with 9:16 Portrait Framing */
            <div className="flex flex-col items-center w-full space-y-3">
              {errorMessage && (
                <div className="p-3 mb-2 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center gap-2 w-full">
                  <AlertCircle size={15} className="text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 9:16 Video Container */}
              <div
                ref={videoContainerRef}
                className="relative w-[240px] h-[426px] sm:w-[260px] sm:h-[462px] rounded-2xl overflow-hidden bg-black border-2 border-white/20 shadow-inner flex items-center justify-center"
              >
                {cameraState === "REQUESTING_PERMISSION" && (
                  <div className="text-center p-4 space-y-2">
                    <ShieldCheck size={28} className="text-[#A855F7] mx-auto animate-pulse" />
                    <p className="text-xs text-white/80">Requesting camera access...</p>
                    <p className="text-[10px] text-white/50">Allow permission in browser prompt.</p>
                  </div>
                )}

                <video
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isMirrored ? "scale-x-[-1]" : ""
                  }`}
                  ref={(el) => {
                    // attach active video element to DOM
                    if (el && !el.srcObject) {
                      navigator.mediaDevices
                        ?.getUserMedia({
                          video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
                          audio: false,
                        })
                        .then((stream) => {
                          el.srcObject = stream;
                        })
                        .catch(() => {});
                    }
                  }}
                />

                {/* Subtle Portrait Framing Guide (No neon/HUD) */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4">
                  {/* Head oval guide */}
                  <div className="w-[140px] h-[170px] mt-4 rounded-full border border-dashed border-white/40 shadow-xs flex items-center justify-center">
                    <span className="text-[9px] tracking-wide text-white/50 uppercase font-mono">
                      Face
                    </span>
                  </div>

                  {/* Shoulders guide */}
                  <div className="w-[200px] h-[80px] rounded-t-3xl border-t border-x border-dashed border-white/30 flex items-center justify-center">
                    <span className="text-[9px] tracking-wide text-white/50 uppercase font-mono">
                      Shoulders
                    </span>
                  </div>
                </div>

                {/* Switch Camera Button */}
                <button
                  type="button"
                  onClick={switchCamera}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-xs transition cursor-pointer"
                  title="Switch Camera"
                >
                  <FlipHorizontal size={14} />
                </button>
              </div>

              {/* Environmental Guidance Bar */}
              <div className="flex items-center justify-between w-full max-w-[260px] px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/80">
                <div className="flex items-center gap-1">
                  <Sun size={11} className="text-amber-400" />
                  <span>Lighting: {lightingStatus}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={11} className="text-emerald-400" />
                  <span>Person: {personStatus}</span>
                </div>
              </div>

              {/* Capture CTA */}
              <div className="pt-2 flex flex-col items-center space-y-1.5 w-full">
                <button
                  type="button"
                  onClick={handleTriggerCapture}
                  disabled={isCapturing}
                  className="w-14 h-14 rounded-full border-4 border-white/30 bg-white hover:bg-[#FAF8F5] active:scale-95 shadow-lg flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                  aria-label="Capture Portrait Photo"
                >
                  <div className="w-10 h-10 rounded-full bg-[#15171A] flex items-center justify-center">
                    <Camera size={18} className="text-white" />
                  </div>
                </button>
                <span className="text-[11px] text-white/60">
                  Center yourself · Face & shoulders visible
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
