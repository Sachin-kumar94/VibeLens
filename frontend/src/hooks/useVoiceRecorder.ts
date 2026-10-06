import { useState, useRef, useEffect, useCallback } from "react";

export type RecorderState =
  | "IDLE"
  | "REQUESTING_PERMISSION"
  | "RECORDING"
  | "PAUSED"
  | "STOPPING"
  | "RECORDED"
  | "ERROR";

export interface VoiceRecorderOptions {
  maxDurationSeconds?: number;
  timesliceMs?: number;
  onStateChange?: (state: RecorderState) => void;
  onRecordingComplete?: (blob: Blob, url: string, durationSeconds: number, mimeType: string) => void;
}

export interface InputDeviceInfo {
  deviceId: string;
  label: string;
}

export function useVoiceRecorder(options: VoiceRecorderOptions = {}) {
  const {
    maxDurationSeconds = 120,
    timesliceMs = 250,
    onRecordingComplete,
  } = options;

  const [state, setState] = useState<RecorderState>("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seconds, setSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [actualMimeType, setActualMimeType] = useState<string>("");
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  
  // Available input devices
  const [inputDevices, setInputDevices] = useState<InputDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const activeUrlRef = useRef<string | null>(null);

  // Enumerate input devices
  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((d) => d.kind === "audioinput")
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${index + 1}`,
        }));
      setInputDevices(audioInputs);
      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch (e) {
      console.warn("Could not enumerate audio devices:", e);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Clean up object URL when hook unmounts
  useEffect(() => {
    return () => {
      if (activeUrlRef.current && activeUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Stop active stream tracks safely
  const stopStreamTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      mediaStreamRef.current = null;
    }
    setActiveStream(null);
  }, []);

  // Detect supported MIME type in order of browser preference
  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
      return "";
    }

    const preferredOrder = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    for (const mime of preferredOrder) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
    return "";
  };

  // Start recording
  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    setState("REQUESTING_PERMISSION");

    try {
      // 1. Request microphone stream with high quality vocal constraints
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      if (selectedDeviceId) {
        audioConstraints.deviceId = { exact: selectedDeviceId };
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: false, // Explicitly no video
        });
      } catch (err: any) {
        // Fallback without specific device or advanced constraints if rejected
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }

      // 2. Validate microphone audio tracks
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        throw new Error("No active audio tracks detected on the microphone stream.");
      }

      const primaryTrack = audioTracks[0];
      if (primaryTrack.readyState !== "live") {
        throw new Error("Microphone track is not live (state: " + primaryTrack.readyState + ").");
      }
      primaryTrack.enabled = true;

      // Refresh devices now that permission is granted (labels become visible)
      refreshDevices();

      mediaStreamRef.current = stream;
      setActiveStream(stream);

      // 3. Negotiate supported MIME type
      const mime = getSupportedMimeType();
      const recorderOptions: MediaRecorderOptions = {};
      if (mime) {
        recorderOptions.mimeType = mime;
      }

      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      const detectedMime = recorder.mimeType || mime || "audio/webm";
      setActualMimeType(detectedMime);

      // 4. Attach event handlers BEFORE starting recorder
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // High-resolution duration calculation
        const now = Date.now();
        const totalDurationMs =
          startTimeRef.current > 0
            ? now - startTimeRef.current - totalPausedDurationRef.current
            : 0;
        const durationSec = Math.max(0.5, totalDurationMs > 0 ? totalDurationMs / 1000 : seconds);
        const finalDuration = Math.round(durationSec * 10) / 10;

        // Stop stream tracks only AFTER final data chunk has been processed
        stopStreamTracks();

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        // Validate and clean Blob MIME type (stripping codec parameters for HTML5 audio compatibility)
        const cleanMime = (detectedMime || "audio/webm").split(";")[0].trim() || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: cleanMime });

        if (blob.size === 0) {
          setState("ERROR");
          setErrorMessage("Recording contains no audio data. Please try again.");
          return;
        }

        // Keep previous URL alive until safely replaced
        if (activeUrlRef.current && activeUrlRef.current.startsWith("blob:")) {
          URL.revokeObjectURL(activeUrlRef.current);
        }

        const newUrl = URL.createObjectURL(blob);
        activeUrlRef.current = newUrl;

        setAudioBlob(blob);
        setAudioUrl(newUrl);
        setAudioDuration(finalDuration);
        setState("RECORDED");

        if (onRecordingComplete) {
          onRecordingComplete(blob, newUrl, finalDuration, cleanMime);
        }
      };

      recorder.onerror = (event: any) => {
        console.error("MediaRecorder runtime error:", event);
        setState("ERROR");
        setErrorMessage("An error occurred during audio recording: " + (event.error?.name || "Unknown error"));
        stopStreamTracks();
      };

      // 5. Start recording with regular timeslice (250ms)
      recorder.start(timesliceMs);

      // 6. Initialize timer and state
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      totalPausedDurationRef.current = 0;
      setSeconds(0);
      setState("RECORDING");

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= maxDurationSeconds) {
            // Auto-stop at max limit
            stopRecording();
            return maxDurationSeconds;
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Microphone setup failed:", err);
      stopStreamTracks();
      setState("ERROR");

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage(
          "Microphone access was blocked. Please enable microphone permissions in your browser bar and try again."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No microphone detected. Please connect an audio input device.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setErrorMessage("Microphone is currently in use by another application.");
      } else {
        setErrorMessage(err.message || "Could not access microphone.");
      }
    }
  }, [
    selectedDeviceId,
    timesliceMs,
    maxDurationSeconds,
    refreshDevices,
    stopStreamTracks,
    seconds,
    onRecordingComplete,
  ]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}
      mediaRecorderRef.current.pause();
      pausedTimeRef.current = Date.now();
      setState("PAUSED");

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      if (pausedTimeRef.current > 0) {
        totalPausedDurationRef.current += Date.now() - pausedTimeRef.current;
        pausedTimeRef.current = 0;
      }
      setState("RECORDING");

      timerIntervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return next;
        });
      }, 1000);
    }
  }, [maxDurationSeconds]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      setState("STOPPING");
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("MediaRecorder stop error:", e);
      }
    }
  }, []);

  // Reset recording state completely
  const resetRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    stopStreamTracks();

    if (activeUrlRef.current && activeUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }

    audioChunksRef.current = [];
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setSeconds(0);
    setErrorMessage(null);
    setState("IDLE");
  }, [stopStreamTracks]);

  return {
    state,
    isRecording: state === "RECORDING",
    isPaused: state === "PAUSED",
    seconds,
    maxDurationSeconds,
    errorMessage,
    audioBlob,
    audioUrl,
    audioDuration,
    actualMimeType,
    mediaStream: activeStream,
    inputDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  };
}
