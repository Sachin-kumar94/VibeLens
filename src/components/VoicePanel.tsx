import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Upload,
  Trash2,
  Volume2,
  Clock,
  TrendingUp,
  Sparkles,
  Play,
  Square,
  Activity,
  Award,
  AlertCircle,
} from "lucide-react";
import { VoiceAnalysis } from "../types";
import { EmojiInsights } from "./EmojiInsights";

interface VoicePanelProps {
  isDark: boolean;
  onAnalysisSuccess: () => void;
  language?: string;
}

export const VoicePanel: React.FC<VoicePanelProps> = ({
  isDark,
  onAnalysisSuccess,
  language = "English",
}) => {
  const [history, setHistory] = useState<VoiceAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<VoiceAnalysis | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Audio Context & MediaRecorder References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // SVG Waveform animation state helper
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(24).fill(12));

  useEffect(() => {
    fetchHistory();
    return () => {
      stopRecordingTimer();
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history/voice");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
        if (data.history.length > 0 && !selectedAnalysis) {
          setSelectedAnalysis(data.history[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load voice history:", err);
    }
  };

  const startRecordingTimer = () => {
    setRecordDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  // Start Voice Capture
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        await handleAnalyzeAudioBlob(audioBlob);

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startRecordingTimer();
      animateWaveform();
      setWarningMessage(null);
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert(
        "Unable to access your microphone. Please enable frame audio permissions.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopRecordingTimer();
    }
  };

  const animateWaveform = () => {
    if (!isRecording) return;
    setWaveHeights((prev) =>
      prev.map(() => Math.floor(4 + Math.random() * 32)),
    );
    animationFrameRef.current = requestAnimationFrame(animateWaveform);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      handleAnalyzeAudioFile(file);
    }
  };

  const handleAnalyzeAudioFile = async (file: File) => {
    setLoading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read audio file"));
        reader.readAsDataURL(file);
      });
      await uploadAndAnalyze(base64Data);
    } catch (err) {
      console.error("Audio file read error:", err);
      alert("Failed to read audio file.");
      setLoading(false);
    }
  };

  const handleAnalyzeAudioBlob = async (blob: Blob) => {
    setLoading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read audio blob"));
        reader.readAsDataURL(blob);
      });
      await uploadAndAnalyze(base64Data);
    } catch (err) {
      console.error("Audio blob read error:", err);
      alert("Failed to read audio data.");
      setLoading(false);
    }
  };

  const uploadAndAnalyze = async (base64Audio: string) => {
    try {
      const res = await fetch("/api/analyze/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64Audio, language }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedAnalysis(data.result);
        if (data.warning) {
          setWarningMessage(data.warning);
        } else {
          setWarningMessage(null);
        }
        await fetchHistory();
        onAnalysisSuccess();
      } else {
        alert(data.error || "Analysis failed");
      }
    } catch (err) {
      console.error("Audio analysis error:", err);
      alert("Failed to analyze voice signal.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this recording analysis?"))
      return;
    try {
      const res = await fetch(`/api/history/voice/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = history.filter((h) => h.id !== id);
        setHistory(updated);
        if (selectedAnalysis?.id === id) {
          setSelectedAnalysis(updated[0] || null);
        }
        onAnalysisSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render static pitch trend inline SVG
  const renderPitchTrendChart = () => {
    if (history.length < 2) {
      return (
        <div className="h-28 flex items-center justify-center opacity-40 text-[11px] font-mono">
          Accumulate voice analyses to view Pitch trends over time.
        </div>
      );
    }

    const reversedHist = [...history].reverse().slice(-10); // last 10 records
    const width = 360;
    const height = 110;
    const pad = 20;

    const pitchesMap = { low: 0, medium: 1, high: 2 };

    const points = reversedHist.map((h, i) => {
      const x = pad + (i / (reversedHist.length - 1)) * (width - pad * 2);
      const val = pitchesMap[h.pitch] !== undefined ? pitchesMap[h.pitch] : 1;
      const y = height - pad - (val / 2) * (height - pad * 2);
      return { x, y };
    });

    const dPath =
      points.length > 0
        ? `M ${points[0].x} ${points[0].y} ` +
          points
            .slice(1)
            .map((p) => `L ${p.x} ${p.y}`)
            .join(" ")
        : "";

    return (
      <div className="w-full h-full relative" id="pitch-trend-chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          {/* Y grid lines */}
          {[0, 1, 2].map((val, i) => {
            const y = height - pad - (val / 2) * (height - pad * 2);
            return (
              <g key={i}>
                <line
                  x1={pad}
                  y1={y}
                  x2={width - pad}
                  y2={y}
                  stroke="rgba(168, 85, 247, 0.15)"
                  strokeDasharray="3 3"
                />
                <text
                  x={pad - 5}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {val === 2 ? "High" : val === 1 ? "Med" : "Low"}
                </text>
              </g>
            );
          })}

          {/* Path line */}
          <path
            d={dPath}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#ec4899"
              stroke={isDark ? "#050505" : "#ffffff"}
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-12 gap-6"
      id="voice-tab-dashboard"
    >
      {/* LEFT COLUMN: LIVE CAPTURE & UPLOAD */}
      <div className="xl:col-span-5 space-y-6">
        {/* Interactive Recording Panel */}
        <div
          className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-display tracking-tight flex items-center gap-2">
              <Mic className="text-purple-500" size={18} />
              <span>Voice Signal Capture</span>
            </h2>
            {isRecording && (
              <span className="text-[10px] bg-red-500/15 text-red-500 font-mono px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>LIVE RECORDING</span>
              </span>
            )}
          </div>

          {/* Interactive Voice Console Area */}
          <div
            className={`rounded-2xl p-6 flex flex-col items-center justify-center border ${
              isRecording
                ? "bg-purple-950/20 border-purple-500/40"
                : isDark
                  ? "bg-black/35 border-white/5"
                  : "bg-gray-50 border-gray-100"
            } min-h-[200px]`}
          >
            {isRecording ? (
              <div className="space-y-4 text-center w-full">
                {/* SVG Live Amplitude Waveform */}
                <div
                  className="flex items-center justify-center gap-1.5 h-14"
                  id="voice-svg-wave"
                >
                  {waveHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-75"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
                <div>
                  <span className="text-xl font-bold font-mono tracking-tight text-white block">
                    {formatDuration(recordDuration)}
                  </span>
                  <span className="text-[10px] opacity-60 font-mono">
                    Analyzing voice frequency, speed and cadence...
                  </span>
                </div>
                <button
                  onClick={stopRecording}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wide shadow flex items-center gap-1.5 mx-auto transition"
                >
                  <Square size={12} fill="white" />
                  <span>Stop & Analyze Signal</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto border border-purple-500/20">
                  <Mic size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-bold">
                    Real-time Vocal Classifier
                  </h3>
                  <p className="text-[10px] opacity-60 max-w-xs mx-auto mt-1">
                    Capture live microphone clips for speech pitch, tone
                    expressiveness, and emotional speed recognition.
                  </p>
                </div>
                <button
                  onClick={startRecording}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs tracking-wide shadow flex items-center gap-1.5 mx-auto transition disabled:opacity-50"
                >
                  <Mic size={13} />
                  <span>Start Microphone Capture</span>
                </button>
              </div>
            )}
          </div>

          {/* File uploader fallback */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
            <span className="text-xs font-semibold opacity-75 block">
              Or Upload Pre-recorded Clip:
            </span>
            <div
              className={`border border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-purple-500/40 transition flex items-center justify-center gap-3 ${
                isDark
                  ? "bg-black/20 border-white/5"
                  : "bg-gray-50 border-gray-100"
              }`}
              onClick={() => document.getElementById("audio-picker")?.click()}
            >
              <input
                type="file"
                id="audio-picker"
                className="hidden"
                accept="audio/mp3, audio/wav, audio/mpeg, audio/m4a"
                onChange={handleFileChange}
              />
              <Upload size={16} className="text-purple-400" />
              <span className="text-[11px] font-medium">
                Select MP3, WAV or M4A audio file
              </span>
            </div>
          </div>
        </div>

        {/* Local Storage warning if active */}
        {warningMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-2.5 text-xs">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed text-[11px] font-medium">
              {warningMessage}
            </p>
          </div>
        )}

        {/* History records stack */}
        <div
          className={`p-4 rounded-3xl border space-y-3 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"}`}
        >
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold font-display uppercase tracking-wider opacity-60">
              Voice Archives
            </span>
            <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/10 px-2 py-0.5 rounded-full font-bold">
              {history.length} records
            </span>
          </div>

          <div className="max-h-[230px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center py-10 opacity-50 text-[10px] font-mono">
                No audio logs available.
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAnalysis(item)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    selectedAnalysis?.id === item.id
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                      : isDark
                        ? "bg-black/30 border-white/5 hover:bg-white/5 text-slate-300"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        selectedAnalysis?.id === item.id
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-purple-500/10 text-purple-400"
                      }`}
                    >
                      <Volume2 size={13} />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{item.emotion} Emotion</span>
                        <span className="text-[9px] opacity-60 font-mono">
                          ({(item.confidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <span className="text-[9px] opacity-50 block font-mono mt-0.5">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteEntry(item.id, e)}
                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded transition text-slate-500"
                    title="Delete Entry"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ANALYTICS DASHBOARD VIEW */}
      <div className="xl:col-span-7">
        {loading ? (
          <div
            className={`h-full min-h-[450px] rounded-3xl border flex flex-col items-center justify-center p-6 text-center ${
              isDark
                ? "bg-white/5 border-white/10 backdrop-blur-md"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="relative w-14 h-14 mb-4">
              <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-t-purple-500 border-r-pink-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-sm font-bold font-display">
              Ingesting Acoustic Waveform
            </h3>
            <p className="text-xs opacity-60 max-w-xs mt-1">
              Decoding speech tone parameters, frequency fluctuations and pause
              patterns via Gemini 3.5...
            </p>
          </div>
        ) : selectedAnalysis ? (
          <div className="space-y-6">
            {/* Main Sentiment Card */}
            <div
              className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-white/5">
                <span className="text-[10px] font-mono opacity-50 tracking-widest uppercase">
                  Vocal Sentiment Output
                </span>
                <span className="text-[10px] font-mono opacity-40">
                  {new Date(selectedAnalysis.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Dial indicator left */}
                <div className="md:col-span-5 text-center space-y-2">
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="rgba(168, 85, 247, 0.1)"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="url(#voiceGrad)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="289"
                        strokeDashoffset={
                          289 - 289 * selectedAnalysis.confidence
                        }
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient
                          id="voiceGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold font-display leading-tight">
                        {selectedAnalysis.emotion}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono mt-0.5">
                        {(selectedAnalysis.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full font-bold border border-purple-500/10">
                      Tone: {selectedAnalysis.tone.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Characteristics breakdown right */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold font-display mb-1 flex items-center gap-1.5 text-purple-400">
                      <Sparkles size={14} />
                      <span>Speech Microstructure</span>
                    </h3>
                    <p className="text-xs opacity-70 leading-relaxed">
                      Pitch frequency averages{" "}
                      <span className="font-semibold text-slate-200 dark:text-white font-mono">
                        {selectedAnalysis.pitchHz} Hz
                      </span>
                      , falling into the{" "}
                      <span className="font-semibold text-pink-400">
                        {selectedAnalysis.pitch.toUpperCase()}
                      </span>{" "}
                      band range. Tone delivery is actively{" "}
                      <span className="font-semibold text-purple-400">
                        {selectedAnalysis.tone}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div
                      className={`p-3 rounded-xl border ${isDark ? "bg-black/30 border-white/5" : "bg-gray-50 border-gray-100"}`}
                    >
                      <span className="text-[9px] opacity-50 uppercase tracking-wider block font-mono">
                        Cadence Speed
                      </span>
                      <span className="text-xs font-bold block mt-0.5">
                        {selectedAnalysis.speakingSpeed}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-xl border ${isDark ? "bg-black/30 border-white/5" : "bg-gray-50 border-gray-100"}`}
                    >
                      <span className="text-[9px] opacity-50 uppercase tracking-wider block font-mono">
                        Speech Intensity
                      </span>
                      <span className="text-xs font-bold block mt-0.5">
                        {selectedAnalysis.speechIntensity} dB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emoji Response Insights */}
            <EmojiInsights
              isDark={isDark}
              type="voice"
              data={selectedAnalysis}
            />

            {/* Vocal Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pitch Frequency Trend line */}
              <div
                className={`p-5 rounded-3xl border space-y-4 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"}`}
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                    <TrendingUp size={14} />
                    <span>Historical Pitch Track</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-50">
                    {selectedAnalysis.pitchHz} Hz Current
                  </span>
                </div>
                {renderPitchTrendChart()}
              </div>

              {/* Energy Analysis Metrics */}
              <div
                className={`p-5 rounded-3xl border space-y-4 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"}`}
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 text-pink-400">
                    <Activity size={14} />
                    <span>Vocal Energy Dynamics</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded font-bold">
                    {selectedAnalysis.energy} energy
                  </span>
                </div>

                <div className="space-y-3.5 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="opacity-60">Energy Score</span>
                      <span className="font-bold font-mono">
                        {selectedAnalysis.vocalEnergy}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full"
                        style={{ width: `${selectedAnalysis.vocalEnergy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="opacity-60">Loudness Level</span>
                      <span className="font-bold font-mono">
                        {selectedAnalysis.loudness} LUFS
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-pink-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.max(10, Math.min(100, 100 + selectedAnalysis.loudness * 2.5))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="opacity-60">
                        Pause Frequency (silences)
                      </span>
                      <span className="font-bold font-mono">
                        {selectedAnalysis.pauseFrequency} pauses/sec
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, selectedAnalysis.pauseFrequency * 200)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vocal Emotion Probabilities Stack */}
            <div
              className={`p-5 rounded-3xl border space-y-4 ${isDark ? "bg-white/5 border-white/10 backdrop-blur-md" : "bg-white border-gray-100"}`}
            >
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300 dark:text-white flex items-center gap-1.5">
                <Award size={14} className="text-purple-400" />
                <span>Emotion Probability Map</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(selectedAnalysis.emotions || {}).map(
                  ([emo, val]) => (
                    <div
                      key={emo}
                      className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${
                        selectedAnalysis.emotion === emo
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400 font-bold"
                          : "bg-black/10 border-white/5 text-slate-400"
                      }`}
                    >
                      <span>{emo}</span>
                      <span className="font-mono font-bold">
                        {(Number(val) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`h-full min-h-[450px] rounded-3xl border flex flex-col items-center justify-center p-6 text-center ${
              isDark
                ? "bg-white/5 border-white/10 backdrop-blur-md"
                : "bg-white border-gray-100"
            }`}
          >
            <Volume2 size={36} className="text-purple-400 opacity-40 mb-3" />
            <h3 className="text-sm font-bold font-display">
              Acoustic Analytics Portal
            </h3>
            <p className="text-xs opacity-60 max-w-sm mt-1">
              Initialize real-time voice emotion tracking or select an item from
              the history stack to visualize complete acoustic insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
