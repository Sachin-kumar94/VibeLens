/**
 * Robust WebRTC Camera Hook for VibeLens Portrait Body Language Analysis
 *
 * Responsibilities:
 * - Strict video-only permissions (never requests audio/microphone)
 * - Front camera preference with dynamic camera switching
 * - Complete lifecycle management (no camera leaks; tracks stop on unmount)
 * - 9:16 centered portrait frame capture with zero distortion
 */
import { useState, useRef, useEffect, useCallback } from "react";

export type CameraState =
  | "IDLE"
  | "REQUESTING_PERMISSION"
  | "STREAMING"
  | "STOPPED"
  | "ERROR";

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
}

export interface CapturedPortrait {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  fileName: string;
  timestamp: string;
}

export interface UseCameraOptions {
  preferredFacingMode?: "user" | "environment";
  onCameraReady?: (stream: MediaStream) => void;
  onError?: (error: string) => void;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { preferredFacingMode = "user", onCameraReady, onError } = options;

  const [state, setState] = useState<CameraState>("IDLE");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(preferredFacingMode);
  const [availableCameras, setAvailableCameras] = useState<CameraDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeCaptureUrlRef = useRef<string | null>(null);

  // Enumerate cameras (videoinput only)
  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter((d) => d.kind === "videoinput")
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
        }));
      setAvailableCameras(videoInputs);
    } catch (e) {
      console.warn("[useCamera] Device enumeration skipped:", e);
    }
  }, []);

  // Stop all active tracks immediately to extinguish hardware LED
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    setStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState("STOPPED");
  }, []);

  // Start camera stream (strictly video only)
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage(null);
    setState("REQUESTING_PERMISSION");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? {
              deviceId: { exact: selectedDeviceId },
              width: { ideal: 1080 },
              height: { ideal: 1920 },
            }
          : {
              facingMode,
              width: { ideal: 1080 },
              height: { ideal: 1920 },
            },
        audio: false, // Strict: Never request mic permission here
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }

      setState("STREAMING");
      refreshDevices();

      if (onCameraReady) {
        onCameraReady(mediaStream);
      }
    } catch (err: any) {
      console.warn("[useCamera] Camera initialization failed:", err);
      stopCamera();
      setState("ERROR");

      let msg = "Could not access the camera. Please try again.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera access was blocked. Please grant camera permission in your browser address bar.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No camera was found on your device. You can upload a portrait photo instead.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        msg = "Your camera is currently in use by another application.";
      } else if (window.isSecureContext === false) {
        msg = "Camera access requires a secure HTTPS connection.";
      }

      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  }, [facingMode, selectedDeviceId, stopCamera, refreshDevices, onCameraReady, onError]);

  // Switch between front/environment camera
  const switchCamera = useCallback(() => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    setIsMirrored(nextFacing === "user");
  }, [facingMode]);

  // Restart camera when facing mode changes while active
  useEffect(() => {
    if (state === "STREAMING") {
      startCamera();
    }
  }, [facingMode]);

  // Clean unmount teardown
  useEffect(() => {
    return () => {
      stopCamera();
      if (activeCaptureUrlRef.current && activeCaptureUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(activeCaptureUrlRef.current);
      }
    };
  }, [stopCamera]);

  /**
   * Captures a centered 9:16 portrait image from the active video feed.
   * Prevents landscape distortion or stretching.
   */
  const capturePortraitFrame = useCallback(
    async (mirrorOverride?: boolean): Promise<CapturedPortrait | null> => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return null;

      const videoW = video.videoWidth || 1280;
      const videoH = video.videoHeight || 720;

      // Target 9:16 Portrait Canvas
      const targetAspect = 9 / 16;
      let targetW = 1080;
      let targetH = 1920;

      // Calculate centered crop coordinates on source video
      let cropX = 0;
      let cropY = 0;
      let cropW = videoW;
      let cropH = videoH;

      const sourceAspect = videoW / videoH;
      if (sourceAspect > targetAspect) {
        // Landscape or wider source: crop sides
        cropW = Math.round(videoH * targetAspect);
        cropX = Math.round((videoW - cropW) / 2);
      } else {
        // Taller source: crop top and bottom
        cropH = Math.round(videoW / targetAspect);
        cropY = Math.round((videoH - cropH) / 2);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Mirroring handling: by default, capture natural non-mirrored photo so clothing/text is correct
      const shouldMirror = mirrorOverride !== undefined ? mirrorOverride : false;
      if (shouldMirror) {
        ctx.translate(targetW, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size === 0) {
              resolve(null);
              return;
            }

            if (activeCaptureUrlRef.current && activeCaptureUrlRef.current.startsWith("blob:")) {
              URL.revokeObjectURL(activeCaptureUrlRef.current);
            }

            const url = URL.createObjectURL(blob);
            activeCaptureUrlRef.current = url;
            const timestamp = new Date().toISOString();
            const timeStr = timestamp.slice(11, 19).replace(/:/g, "-");

            resolve({
              blob,
              url,
              width: targetW,
              height: targetH,
              sizeBytes: blob.size,
              fileName: `portrait_session_${timeStr}.jpg`,
              timestamp,
            });
          },
          "image/jpeg",
          0.9
        );
      });
    },
    []
  );

  return {
    state,
    isStreaming: state === "STREAMING",
    isRequesting: state === "REQUESTING_PERMISSION",
    stream,
    videoRef,
    facingMode,
    isMirrored,
    availableCameras,
    hasMultipleCameras: availableCameras.length > 1,
    selectedDeviceId,
    errorMessage,
    startCamera,
    stopCamera,
    switchCamera,
    setSelectedDeviceId,
    setIsMirrored,
    capturePortraitFrame,
  };
}
