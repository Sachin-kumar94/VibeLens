import React, { useState } from "react";
import {
  Camera,
  RefreshCw,
  Eye,
  EyeOff,
  FlipHorizontal,
  Square,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { PoseLandmarkOverlay } from "./PoseLandmarkOverlay";
import { Landmark } from "../../services/pose/poseProvider";

interface CameraViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  isMirrored: boolean;
  landmarks: Landmark[];
  framingStatus: "NO_PERSON" | "PERSON_FOUND" | "POOR_FRAMING" | "GOOD_FRAMING" | "READY";
  framingAdvice: string;
  hasMultipleCameras: boolean;
  captureMode: "portrait" | "upper_body" | "full_body";
  onCaptureModeChange: (mode: "portrait" | "upper_body" | "full_body") => void;
  onSwitchCamera: () => void;
  onToggleMirror: () => void;
  onCapture: () => void;
  onStopCamera: () => void;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({
  videoRef,
  isStreaming,
  isMirrored,
  landmarks,
  framingStatus,
  framingAdvice,
  hasMultipleCameras,
  captureMode,
  onCaptureModeChange,
  onSwitchCamera,
  onToggleMirror,
  onCapture,
  onStopCamera,
}) => {
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);

  const getStatusBadge = () => {
    switch (framingStatus) {
      case "READY":
        return {
          icon: <CheckCircle2 size={13} className="text-emerald-400" />,
          label: "Ready to Capture",
          bg: "bg-emerald-950/80 border-emerald-500/30 text-emerald-300",
        };
      case "GOOD_FRAMING":
      case "PERSON_FOUND":
        return {
          icon: <Sparkles size={13} className="text-amber-400" />,
          label: framingAdvice || "Person Detected",
          bg: "bg-amber-950/80 border-amber-500/30 text-amber-300",
        };
      case "POOR_FRAMING":
        return {
          icon: <AlertCircle size={13} className="text-amber-400" />,
          label: framingAdvice,
          bg: "bg-amber-950/80 border-amber-500/30 text-amber-300",
        };
      case "NO_PERSON":
      default:
        return {
          icon: <AlertCircle size={13} className="text-slate-400" />,
          label: "Move into frame",
          bg: "bg-black/75 border-white/10 text-slate-300",
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F1EA] rounded-xl border border-[#DDD8CD] text-xs">
          <button
            type="button"
            onClick={() => onCaptureModeChange("portrait")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              captureMode === "portrait"
                ? "bg-white text-[#15171A] shadow-xs"
                : "text-[#707582] hover:text-[#15171A]"
            }`}
          >
            Portrait Photo
          </button>
          <button
            type="button"
            onClick={() => onCaptureModeChange("upper_body")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              captureMode === "upper_body"
                ? "bg-white text-[#15171A] shadow-xs"
                : "text-[#707582] hover:text-[#15171A]"
            }`}
          >
            Upper Body
          </button>
          <button
            type="button"
            onClick={() => onCaptureModeChange("full_body")}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              captureMode === "full_body"
                ? "bg-white text-[#15171A] shadow-xs"
                : "text-[#707582] hover:text-[#15171A]"
            }`}
          >
            Full Body
          </button>
        </div>

        <button
          type="button"
          onClick={onStopCamera}
          className="px-3 py-1.5 rounded-xl border border-[#DDD8CD] hover:bg-[#F4F1EA] text-xs font-medium text-[#707582] hover:text-[#15171A] transition cursor-pointer flex items-center gap-1.5"
          title="Stop camera session"
        >
          <Square size={12} className="fill-current text-rose-500" />
          <span>Stop Camera</span>
        </button>
      </div>

      {/* 9:16 Portrait Camera Viewport */}
      <div className="relative mx-auto w-full max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#121316] border border-[#2D3039] shadow-md flex items-center justify-center">
        {/* Native WebRTC Video Element */}
        <video
          ref={videoRef as any}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isMirrored ? "scale-x-[-1]" : ""
          }`}
        />

        {/* Live Pose Landmark Overlay */}
        <PoseLandmarkOverlay
          landmarks={landmarks}
          isMirrored={isMirrored}
          visible={showLandmarks}
        />

        {/* Subtle Portrait Framing Guide */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity"
          viewBox="0 0 100 177.7"
          preserveAspectRatio="none"
        >
          {/* Head guide oval */}
          <ellipse
            cx="50"
            cy="42"
            rx="16"
            ry="21"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.75"
            strokeDasharray="2,2"
          />
          {/* Shoulder guide line */}
          <path
            d="M 22 76 Q 50 82 78 76"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.75"
            strokeDasharray="2,2"
          />
          {/* Chest & Torso Guide */}
          {captureMode === "full_body" ? (
            <line
              x1="50"
              y1="63"
              x2="50"
              y2="155"
              stroke="#FFFFFF"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ) : (
            <line
              x1="50"
              y1="63"
              x2="50"
              y2="125"
              stroke="#FFFFFF"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          )}
        </svg>

        {/* Top Controls Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Feed</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Landmarks Button */}
            <button
              type="button"
              onClick={() => setShowLandmarks(!showLandmarks)}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title={showLandmarks ? "Hide Pose Landmarks" : "Show Pose Landmarks"}
              aria-label="Toggle pose landmarks"
            >
              {showLandmarks ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>

            {/* Mirror Toggle */}
            <button
              type="button"
              onClick={onToggleMirror}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title={isMirrored ? "Disable Mirror Preview" : "Enable Mirror Preview"}
              aria-label="Toggle mirror preview"
            >
              <FlipHorizontal size={14} />
            </button>

            {/* Switch Camera Button (if device has multiple) */}
            {hasMultipleCameras && (
              <button
                type="button"
                onClick={onSwitchCamera}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition cursor-pointer"
                title="Switch Camera (Front / Back)"
                aria-label="Switch camera"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Framing Status Pill */}
        <div className="absolute bottom-20 inset-x-4 flex justify-center pointer-events-none">
          <div
            className={`px-3.5 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 text-xs font-medium shadow-sm transition-all duration-300 ${statusBadge.bg}`}
          >
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </div>
        </div>

        {/* Shutter / Capture Photo Button */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-auto">
          <button
            type="button"
            onClick={onCapture}
            className="group relative flex items-center justify-center p-1 rounded-full cursor-pointer transition active:scale-95"
            aria-label="Capture 9:16 portrait photo"
          >
            {/* Outer Ring */}
            <span
              className={`w-16 h-16 rounded-full border-2 transition-colors ${
                framingStatus === "READY"
                  ? "border-emerald-400 animate-pulse"
                  : "border-white/60 group-hover:border-white"
              }`}
            />
            {/* Inner Shutter Core */}
            <span className="absolute w-12 h-12 rounded-full bg-white shadow-lg transition-transform group-hover:scale-95 group-active:scale-90" />
          </button>
        </div>
      </div>
    </div>
  );
};
