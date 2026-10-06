/**
 * Pose Estimation Hook for Real-Time Landmark Tracking & Framing Feedback
 * Uses requestAnimationFrame with 25-30 FPS throttling to ensure buttery smooth performance.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  BodyAnalysisProvider,
  createPoseProvider,
  Landmark,
  PoseDetectionResult,
} from "../services/pose/poseProvider";

export interface UsePoseDetectionOptions {
  enabled?: boolean;
  targetFps?: number;
}

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: UsePoseDetectionOptions = {}
) {
  const { enabled = true, targetFps = 25 } = options;

  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string>("Initializing...");

  const [detectionResult, setDetectionResult] = useState<PoseDetectionResult>({
    landmarks: [],
    confidence: 0,
    hasPerson: false,
    shoulderTiltDeg: 0,
    headTiltDeg: 0,
    framingStatus: "NO_PERSON",
    framingAdvice: "Move into the portrait frame to start tracking.",
    isFullBody: false,
    isUpperBody: false,
  });

  const providerRef = useRef<BodyAnalysisProvider | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const isLoopRunningRef = useRef<boolean>(false);

  // Initialize Pose Provider once
  useEffect(() => {
    let isMounted = true;
    setIsModelLoading(true);

    createPoseProvider()
      .then((provider) => {
        if (!isMounted) {
          provider.dispose();
          return;
        }
        providerRef.current = provider;
        setProviderName(provider.name);
        setIsModelReady(true);
        setIsModelLoading(false);
      })
      .catch((err) => {
        console.warn("[usePoseDetection] Provider initialization error:", err);
        if (isMounted) {
          setIsModelLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (providerRef.current) {
        providerRef.current.dispose();
        providerRef.current = null;
      }
    };
  }, []);

  // Frame detection loop
  const frameIntervalMs = 1000 / targetFps;

  const runDetectionLoop = useCallback(() => {
    if (!enabled || !isLoopRunningRef.current) return;

    const now = performance.now();
    const elapsed = now - lastDetectionTimeRef.current;

    if (elapsed >= frameIntervalMs) {
      const video = videoRef.current;
      const provider = providerRef.current;

      if (video && video.readyState >= 2 && provider && provider.isReady) {
        provider
          .detect(video, now)
          .then((res) => {
            if (res && isLoopRunningRef.current) {
              setDetectionResult(res);
            }
          })
          .catch(() => {});
        lastDetectionTimeRef.current = now;
      }
    }

    if (isLoopRunningRef.current) {
      animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    }
  }, [enabled, frameIntervalMs, videoRef]);

  // Start / stop loop based on enabled state
  useEffect(() => {
    if (enabled && isModelReady) {
      isLoopRunningRef.current = true;
      animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    } else {
      isLoopRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    }

    return () => {
      isLoopRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [enabled, isModelReady, runDetectionLoop]);

  return {
    isModelLoading,
    isModelReady,
    providerName,
    landmarks: detectionResult.landmarks,
    hasPerson: detectionResult.hasPerson,
    framingStatus: detectionResult.framingStatus,
    framingAdvice: detectionResult.framingAdvice,
    shoulderTiltDeg: detectionResult.shoulderTiltDeg,
    headTiltDeg: detectionResult.headTiltDeg,
    confidence: detectionResult.confidence,
    isFullBody: detectionResult.isFullBody,
    isUpperBody: detectionResult.isUpperBody,
  };
}
