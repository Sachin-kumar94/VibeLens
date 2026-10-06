import { useState, useRef, useEffect, useCallback } from "react";
import { cleanAudioMimeType, recoverPlayableAudio } from "../utils/audioRecovery";

export interface AudioPlayerOptions {
  audioUrl?: string | null;
  audioBlob?: Blob | null;
  initialDuration?: number;
  mimeType?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
}

export function useAudioPlayer(options: AudioPlayerOptions = {}) {
  const {
    audioUrl,
    audioBlob,
    initialDuration = 0,
    mimeType,
    onTimeUpdate,
    onEnded,
    onError,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [volume, setVolumeState] = useState<number>(1);
  const [isMuted, setIsMutedState] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canPlayFormat, setCanPlayFormat] = useState<boolean>(true);

  // Auto-recovered playable URL (e.g. PCM WAV transcode) when browser's <audio> rejects native WebM/Opus
  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(audioUrl || null);
  const isRecoveringRef = useRef<boolean>(false);
  const recoveredBlobUrlRef = useRef<string | null>(null);

  // Synchronize audio element reference initialization
  const setAudioElement = useCallback((element: HTMLAudioElement | null) => {
    audioRef.current = element;
    if (element) {
      element.volume = volume;
      element.muted = isMuted;
      element.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // Sync initial duration if provided or updated
  useEffect(() => {
    if (initialDuration && Number.isFinite(initialDuration) && initialDuration > 0) {
      setDuration((prev) => (prev > 0 ? prev : initialDuration));
    }
  }, [initialDuration]);

  // Clean up recovered object URL
  const cleanupRecoveredUrl = useCallback(() => {
    if (recoveredBlobUrlRef.current && recoveredBlobUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(recoveredBlobUrlRef.current);
      recoveredBlobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecoveredUrl();
    };
  }, [cleanupRecoveredUrl]);

  // Check format compatibility when audioUrl or mimeType changes
  useEffect(() => {
    cleanupRecoveredUrl();
    isRecoveringRef.current = false;
    setEffectiveUrl(audioUrl || null);

    if (!audioUrl) {
      setIsLoaded(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setErrorMessage(null);
      return;
    }

    // Verify format decode support using HTMLAudioElement canPlayType with sanitized MIME
    if (mimeType) {
      const cleanMime = cleanAudioMimeType(mimeType);
      const tester = document.createElement("audio");
      const canPlay = tester.canPlayType(cleanMime);
      const isSupported = canPlay === "probably" || canPlay === "maybe";
      setCanPlayFormat(isSupported);
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setErrorMessage(null);
  }, [audioUrl, mimeType, cleanupRecoveredUrl]);

  // Universal recovery pipeline: transcodes raw audio bytes via Web Audio into standard PCM WAV
  const recoverAudio = useCallback(async (): Promise<string | null> => {
    if (isRecoveringRef.current) return recoveredBlobUrlRef.current;
    isRecoveringRef.current = true;

    try {
      const source = audioBlob || audioUrl;
      if (!source) {
        isRecoveringRef.current = false;
        return null;
      }

      const targetDuration = duration > 0 ? duration : initialDuration > 0 ? initialDuration : 10;
      const result = await recoverPlayableAudio(source, targetDuration);

      if (result && result.url) {
        cleanupRecoveredUrl();
        recoveredBlobUrlRef.current = result.url;
        setEffectiveUrl(result.url);
        setErrorMessage(null);
        setCanPlayFormat(true);

        const audio = audioRef.current;
        if (audio) {
          audio.src = result.url;
          audio.load();
        }
        return result.url;
      }
    } catch (err) {
      console.warn("[AudioPlayer] Audio recovery encountered an issue:", err);
    } finally {
      isRecoveringRef.current = false;
    }
    return null;
  }, [audioBlob, audioUrl, duration, initialDuration, cleanupRecoveredUrl]);

  // Handle Play
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || (!effectiveUrl && !audioUrl)) return;

    try {
      // If at end of track, reset to beginning before playing
      const safeDuration = duration > 0 ? duration : initialDuration;
      if (audio.ended || (safeDuration > 0 && audio.currentTime >= safeDuration - 0.1)) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }

      setErrorMessage(null);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.warn("[AudioPlayer] Playback rejected:", err);
      setIsPlaying(false);

      if (err.name === "NotAllowedError") {
        setErrorMessage("Browser blocked audio playback. Press play again.");
        if (onError) onError(err.message);
      } else {
        // Attempt recovery if playback failed due to decode/format incompatibility
        const recovered = await recoverAudio();
        if (recovered && audioRef.current) {
          try {
            await audioRef.current.play();
            setIsPlaying(true);
            setErrorMessage(null);
            return;
          } catch (retryErr) {
            console.warn("[AudioPlayer] Playback retry after recovery failed:", retryErr);
          }
        }
        const msg = "Playback failed: " + (err.message || "Unknown error");
        setErrorMessage(msg);
        if (onError) onError(msg);
      }
    }
  }, [effectiveUrl, audioUrl, duration, initialDuration, recoverAudio, onError]);

  // Handle Pause
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Seek to position
  const seek = useCallback((timeSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const safeTime = Math.max(0, timeSeconds);
    audio.currentTime = safeTime;
    setCurrentTime(safeTime);
    if (onTimeUpdate) onTimeUpdate(safeTime);
  }, [onTimeUpdate]);

  // Volume control (0 - 1)
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped === 0) {
      setIsMutedState(true);
      if (audioRef.current) audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMutedState(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  }, [isMuted]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMutedState((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  // Set Playback Speed (0.75x, 1x, 1.25x, 1.5x)
  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // Restart from 0
  const restart = useCallback(() => {
    seek(0);
    play();
  }, [seek, play]);

  // Event handlers to attach to <audio> element
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const curr = audio.currentTime;
    setCurrentTime(curr);
    if (onTimeUpdate) onTimeUpdate(curr);
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoaded(true);
    setErrorMessage(null);
    const audioDuration = audio.duration;

    // WebM recordings often have duration = Infinity in Chromium
    if (Number.isFinite(audioDuration) && audioDuration > 0) {
      setDuration(audioDuration);
    } else if (initialDuration && Number.isFinite(initialDuration) && initialDuration > 0) {
      setDuration(initialDuration);
    } else if (audio.seekable && audio.seekable.length > 0) {
      const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
      if (Number.isFinite(seekableEnd) && seekableEnd > 0) {
        setDuration(seekableEnd);
      }
    }
  }, [initialDuration]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (onEnded) onEnded();
  }, [onEnded]);

  const handleError = useCallback(async (e: any) => {
    const audio = audioRef.current;
    const errCode = audio?.error?.code;

    console.warn("[AudioPlayer] HTMLAudioElement error, attempting auto-recovery:", {
      code: errCode,
      message: audio?.error?.message,
      url: effectiveUrl,
    });

    // Automatically recover if format is unsupported (code 4) or decoding fails (code 3)
    if (!isRecoveringRef.current && (audioBlob || audioUrl)) {
      const recovered = await recoverAudio();
      if (recovered) {
        // Recovery succeeded, clear any transient error
        setErrorMessage(null);
        return;
      }
    }

    let message = "We recorded the session, but this browser couldn't play the audio preview.";
    if (errCode === 1) message = "Audio playback was aborted.";
    if (errCode === 2) message = "Audio download network error occurred.";
    if (errCode === 3) message = "Audio decoding error. Media may be corrupted or unsupported.";
    if (errCode === 4) message = "Audio format is not supported by your browser.";

    setErrorMessage(message);
    setIsPlaying(false);
    if (onError) onError(message);
  }, [effectiveUrl, audioBlob, audioUrl, recoverAudio, onError]);

  return {
    audioRef,
    setAudioElement,
    isPlaying,
    currentTime,
    duration: duration > 0 ? duration : initialDuration,
    volume,
    isMuted,
    playbackRate,
    isLoaded,
    errorMessage,
    canPlayFormat,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    restart,
    recoverAudio,
    // Event listener bundle for easy spread on <audio>
    audioProps: {
      src: effectiveUrl || undefined,
      preload: "metadata" as const,
      onTimeUpdate: handleTimeUpdate,
      onLoadedMetadata: handleLoadedMetadata,
      onDurationChange: handleLoadedMetadata,
      onCanPlay: handleLoadedMetadata,
      onPlay: () => setIsPlaying(true),
      onPlaying: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
      onEnded: handleEnded,
      onError: handleError,
    },
  };
}
