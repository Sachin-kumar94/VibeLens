import { useState, useRef, useEffect, useCallback } from "react";

export interface TranscriptSentence {
  startSec: number;
  endSec: number;
  startTime?: number;
  endTime?: number;
  text: string;
}

export interface SpeechMetrics {
  wpm: number;
  pauseCount: number;
  avgPauseDuration: number;
  longestPause: number;
  fillerCount: number;
  fillerRate: number;
  fillerWords: { word: string; count: number }[];
}

interface UseInterviewSpeechOptions {
  active: boolean; // True while answer recording is live
  getElapsedSeconds: () => number;
}

const FILLER_REGEX = /\b(um|uh|er|ah|like|you know|basically|actually|sort of|kind of|literally)\b/gi;

export function useInterviewSpeech({ active, getElapsedSeconds }: UseInterviewSpeechOptions) {
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [sentences, setSentences] = useState<TranscriptSentence[]>([]);
  const [pauseCount, setPauseCount] = useState(0);
  const [longestPause, setLongestPause] = useState(0);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [fillerWords, setFillerWords] = useState<{ word: string; count: number }[]>([]);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const lastSpeechTimeRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const isRecognizingRef = useRef(false);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!active) {
      if (recognitionRef.current && isRecognizingRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        isRecognizingRef.current = false;
      }
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[useInterviewSpeech] Web Speech API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let currentSentenceStart = getElapsedSeconds();

    recognition.onresult = (event: any) => {
      const now = getElapsedSeconds();
      let finalized = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalized += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      // Check if resuming from pause
      if (pauseStartRef.current !== null) {
        const pauseDuration = Math.max(0, now - pauseStartRef.current);
        if (pauseDuration >= 1.2) {
          setPauseCount((prev) => prev + 1);
          setTotalPauseTime((prev) => prev + pauseDuration);
          setLongestPause((prev) => Math.max(prev, pauseDuration));
        }
        pauseStartRef.current = null;
      }
      lastSpeechTimeRef.current = now;

      if (finalized.trim()) {
        const trimmed = finalized.trim();
        transcriptRef.current = (transcriptRef.current + " " + trimmed).trim();
        setTranscript(transcriptRef.current);

        setSentences((prev) => [
          ...prev,
          {
            startSec: Math.round(currentSentenceStart * 10) / 10,
            endSec: Math.round(now * 10) / 10,
            startTime: Math.round(currentSentenceStart * 10) / 10,
            endTime: Math.round(now * 10) / 10,
            text: trimmed,
          },
        ]);
        currentSentenceStart = now;

        // Recalculate fillers
        const matched = transcriptRef.current.match(FILLER_REGEX) || [];
        setFillerCount(matched.length);

        const counts: Record<string, number> = {};
        for (const w of matched) {
          const lower = w.toLowerCase();
          counts[lower] = (counts[lower] || 0) + 1;
        }
        setFillerWords(Object.entries(counts).map(([word, count]) => ({ word, count })));
      }

      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        console.warn("[useInterviewSpeech] Recognition event error:", event.error);
      }
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      // Auto-restart if still actively answering
      if (active) {
        try {
          recognition.start();
          isRecognizingRef.current = true;
        } catch (e) {}
      }
    };

    try {
      recognition.start();
      isRecognizingRef.current = true;
      lastSpeechTimeRef.current = getElapsedSeconds();
    } catch (e) {
      console.warn("[useInterviewSpeech] Failed to start recognition:", e);
    }

    recognitionRef.current = recognition;

    // Silence monitor interval for pause tracking
    const pauseInterval = setInterval(() => {
      if (!active) return;
      const now = getElapsedSeconds();
      if (lastSpeechTimeRef.current !== null && now - lastSpeechTimeRef.current > 1.8) {
        if (pauseStartRef.current === null) {
          pauseStartRef.current = lastSpeechTimeRef.current;
        }
      }
    }, 500);

    return () => {
      clearInterval(pauseInterval);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        isRecognizingRef.current = false;
      }
    };
  }, [active, getElapsedSeconds]);

  // Compute live WPM and metrics
  const elapsed = getElapsedSeconds();
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const wpm = elapsed > 5 ? Math.round((wordCount / elapsed) * 60) : 0;
  const avgPauseDuration = pauseCount > 0 ? totalPauseTime / pauseCount : 0;
  const fillerRate = wordCount > 0 ? Number(((fillerCount / wordCount) * 100).toFixed(1)) : 0;

  const resetSpeech = useCallback(() => {
    transcriptRef.current = "";
    setTranscript("");
    setInterimText("");
    setSentences([]);
    setPauseCount(0);
    setLongestPause(0);
    setTotalPauseTime(0);
    setFillerCount(0);
    setFillerWords([]);
    lastSpeechTimeRef.current = null;
    pauseStartRef.current = null;
  }, []);

  return {
    transcript,
    interimText,
    sentences,
    wordCount,
    wpm,
    pauseCount,
    avgPauseDuration,
    longestPause,
    fillerCount,
    fillerRate,
    fillerWords,
    resetSpeech,
    setTranscript,
  };
}
