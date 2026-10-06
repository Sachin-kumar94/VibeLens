import { useState, useEffect, useRef, useCallback } from "react";

export interface IntegrityEvent {
  type:
    | "TAB_SWITCH"
    | "WINDOW_BLUR"
    | "PAGE_HIDDEN"
    | "PASTE_DURING_ANSWER"
    | "COPY_DURING_ANSWER"
    | "FULLSCREEN_EXIT"
    | "CAMERA_LOST"
    | "FACE_NOT_VISIBLE"
    | "MULTIPLE_FACES_DETECTED"
    | "LONG_OFF_CAMERA"
    | "MICROPHONE_DISCONNECTED"
    | "NETWORK_INTERRUPT";
  timestamp: number; // Seconds elapsed since answer start
  duration?: number; // In seconds
  source: string;
  metadata?: any;
}

export interface IntegritySummary {
  eventCount: number;
  focusChanges: number;
  pageHiddenSeconds: number;
  pasteEvents: number;
  copyEvents?: number;
  fullscreenExits: number;
  interruptions: number;
  networkLossCount?: number;
  totalEvents?: number;
}

interface UseIntegritySignalsOptions {
  active: boolean; // Only monitor when user is actively preparing or answering
  getElapsedSeconds: () => number;
  cameraTrack?: MediaStreamTrack | null;
  micTrack?: MediaStreamTrack | null;
  onEventDetected?: (event: IntegrityEvent) => void;
}

export function useIntegritySignals({
  active,
  getElapsedSeconds,
  cameraTrack,
  micTrack,
  onEventDetected,
}: UseIntegritySignalsOptions) {
  const [events, setEvents] = useState<IntegrityEvent[]>([]);
  const eventsRef = useRef<IntegrityEvent[]>([]);
  const blurStartRef = useRef<number | null>(null);
  const hiddenStartRef = useRef<number | null>(null);

  const addEvent = useCallback(
    (event: IntegrityEvent) => {
      eventsRef.current.push(event);
      setEvents([...eventsRef.current]);
      if (onEventDetected) {
        onEventDetected(event);
      }
    },
    [onEventDetected]
  );

  // 1. Visibility & Tab Switch monitoring
  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      const now = getElapsedSeconds();
      if (document.hidden) {
        hiddenStartRef.current = now;
        addEvent({
          type: "PAGE_HIDDEN",
          timestamp: now,
          source: "document_visibilitychange",
        });
      } else {
        const start = hiddenStartRef.current;
        const duration = start !== null ? Math.max(0, now - start) : 0;
        hiddenStartRef.current = null;
        addEvent({
          type: "TAB_SWITCH",
          timestamp: now,
          duration,
          source: "document_visibilitychange",
          metadata: { hiddenDurationSeconds: duration },
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active, getElapsedSeconds, addEvent]);

  // 2. Window Blur & Focus
  useEffect(() => {
    if (!active) return;

    const handleBlur = () => {
      const now = getElapsedSeconds();
      blurStartRef.current = now;
      addEvent({
        type: "WINDOW_BLUR",
        timestamp: now,
        source: "window_blur",
      });
    };

    const handleFocus = () => {
      const now = getElapsedSeconds();
      const start = blurStartRef.current;
      const duration = start !== null ? Math.max(0, now - start) : 0;
      blurStartRef.current = null;
      if (duration > 0) {
        addEvent({
          type: "WINDOW_BLUR",
          timestamp: now,
          duration,
          source: "window_focus_regained",
          metadata: { blurDurationSeconds: duration },
        });
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [active, getElapsedSeconds, addEvent]);

  // 3. Paste & Copy Events
  useEffect(() => {
    if (!active) return;

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text") || "";
      addEvent({
        type: "PASTE_DURING_ANSWER",
        timestamp: getElapsedSeconds(),
        source: "document_paste",
        metadata: { characterLength: text.length },
      });
    };

    const handleCopy = () => {
      addEvent({
        type: "COPY_DURING_ANSWER",
        timestamp: getElapsedSeconds(),
        source: "document_copy",
      });
    };

    document.addEventListener("paste", handlePaste);
    document.addEventListener("copy", handleCopy);
    return () => {
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("copy", handleCopy);
    };
  }, [active, getElapsedSeconds, addEvent]);

  // 4. Fullscreen changes
  useEffect(() => {
    if (!active) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addEvent({
          type: "FULLSCREEN_EXIT",
          timestamp: getElapsedSeconds(),
          source: "document_fullscreenchange",
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [active, getElapsedSeconds, addEvent]);

  // 5. Track device disconnection (camera & mic)
  useEffect(() => {
    if (!active) return;

    const handleCameraEnded = () => {
      addEvent({
        type: "CAMERA_LOST",
        timestamp: getElapsedSeconds(),
        source: "camera_track_ended",
      });
    };

    const handleMicEnded = () => {
      addEvent({
        type: "MICROPHONE_DISCONNECTED",
        timestamp: getElapsedSeconds(),
        source: "mic_track_ended",
      });
    };

    if (cameraTrack) {
      cameraTrack.addEventListener("ended", handleCameraEnded);
    }
    if (micTrack) {
      micTrack.addEventListener("ended", handleMicEnded);
    }

    return () => {
      if (cameraTrack) cameraTrack.removeEventListener("ended", handleCameraEnded);
      if (micTrack) micTrack.removeEventListener("ended", handleMicEnded);
    };
  }, [active, cameraTrack, micTrack, getElapsedSeconds, addEvent]);

  // 6. Network interruption
  useEffect(() => {
    if (!active) return;

    const handleOffline = () => {
      addEvent({
        type: "NETWORK_INTERRUPT",
        timestamp: getElapsedSeconds(),
        source: "window_offline",
      });
    };

    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("offline", handleOffline);
    };
  }, [active, getElapsedSeconds, addEvent]);

  // Summary aggregator
  const summary: IntegritySummary = {
    eventCount: events.length,
    focusChanges: events.filter(
      (e) => e.type === "WINDOW_BLUR" || e.type === "PAGE_HIDDEN" || e.type === "TAB_SWITCH"
    ).length,
    pageHiddenSeconds: Math.round(
      events
        .filter((e) => e.type === "TAB_SWITCH" || e.type === "PAGE_HIDDEN")
        .reduce((sum, curr) => sum + (curr.duration || 0), 0)
    ),
    pasteEvents: events.filter((e) => e.type === "PASTE_DURING_ANSWER").length,
    fullscreenExits: events.filter((e) => e.type === "FULLSCREEN_EXIT").length,
    interruptions: events.filter(
      (e) =>
        e.type === "CAMERA_LOST" ||
        e.type === "MICROPHONE_DISCONNECTED" ||
        e.type === "NETWORK_INTERRUPT"
    ).length,
  };

  const resetIntegrity = useCallback(() => {
    eventsRef.current = [];
    setEvents([]);
    blurStartRef.current = null;
    hiddenStartRef.current = null;
  }, []);

  const getEvents = useCallback(() => {
    return [...eventsRef.current];
  }, []);

  return {
    events,
    summary,
    resetIntegrity,
    getEvents,
    addEvent,
  };
}
