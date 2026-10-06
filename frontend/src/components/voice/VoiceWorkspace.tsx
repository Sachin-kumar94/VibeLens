import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Upload,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Play
} from "lucide-react";
import { voiceAnalysisApi, VoiceAnalysisData, UserVocalBaseline } from "../../services/voiceAnalysisApi";
import { VoiceRecorder } from "./VoiceRecorder";
import { VoiceUpload } from "./VoiceUpload";
import { AudioPlayer } from "./AudioPlayer";
import { AudioQuality, QualityMetrics } from "./AudioQuality";
import { AudioPreview } from "./AudioPreview";
import { VoiceProcessing } from "./VoiceProcessing";
import { VoiceMetrics } from "./VoiceMetrics";
import { VoiceResult } from "./VoiceResult";

type WorkspaceState =
  | "IDLE"
  | "RECORDING"
  | "STOPPED"
  | "FILE_SELECTED"
  | "CHECKING_QUALITY"
  | "READY"
  | "ANALYZING"
  | "SUCCESS"
  | "ERROR";

interface VoiceWorkspaceProps {
  onNavigate?: (path: string) => void;
}

export const VoiceWorkspace: React.FC<VoiceWorkspaceProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>("IDLE");

  // Audio source state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioFileName, setAudioFileName] = useState<string>("vocal_recording.webm");
  const [audioFileSize, setAudioFileSize] = useState<number>(0);
  const [audioMimeType, setAudioMimeType] = useState<string>("audio/webm");

  // Quality metrics state
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);

  // Analysis result & baseline
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisData | null>(null);
  const [baseline, setBaseline] = useState<UserVocalBaseline | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detailed modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Keep ref of active object URL for safe cleanup on unmount
  const activeUrlRef = useRef<string | null>(null);
  activeUrlRef.current = audioUrl;

  // Load user vocal baseline on mount
  useEffect(() => {
    let isMounted = true;
    voiceAnalysisApi.getVoiceBaseline().then((data) => {
      if (isMounted && data) setBaseline(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Revoke object URLs ONLY when component completely unmounts
  useEffect(() => {
    return () => {
      if (activeUrlRef.current && activeUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
    };
  }, []);

  // Handle recording completion
  const handleRecordingComplete = (blob: Blob, url: string, durationSec: number, mimeType?: string) => {
    if (activeUrlRef.current && activeUrlRef.current.startsWith("blob:") && activeUrlRef.current !== url) {
      URL.revokeObjectURL(activeUrlRef.current);
    }

    const detectedMime = mimeType || blob.type || "audio/webm";
    const ext = detectedMime.includes("ogg") ? "ogg" : detectedMime.includes("mp4") ? "mp4" : "webm";

    setAudioBlob(blob);
    setAudioFile(null);
    setAudioUrl(url);
    setAudioMimeType(detectedMime);
    setAudioDuration(durationSec);
    setAudioFileName(`voice_session_${new Date().toISOString().slice(11, 19).replace(/:/g, "-")}.${ext}`);
    setAudioFileSize(blob.size);

    runQuickQualityCheck(blob, durationSec);
  };

  // Handle file upload selection
  const handleFileSelected = (file: File) => {
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioBlob(null);
    setAudioUrl(url);
    setAudioFileName(file.name);
    setAudioFileSize(file.size);

    // Approximate duration or detect via Audio element
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      const dur = tempAudio.duration && !isNaN(tempAudio.duration) ? tempAudio.duration : 15;
      setAudioDuration(dur);
      runQuickQualityCheck(file, dur);
    };
    tempAudio.onerror = () => {
      setAudioDuration(15);
      runQuickQualityCheck(file, 15);
    };
  };

  // Perform client-side technical audio quality check
  const runQuickQualityCheck = (blobOrFile: Blob | File, durationSec: number) => {
    setWorkspaceState("CHECKING_QUALITY");

    // Quick estimation of quality parameters
    const isVeryShort = durationSec < 1.0;
    const isModerateShort = durationSec < 2.5;
    const isVeryQuiet = blobOrFile.size < 2000;
    const volume: "Low" | "Good" | "High" = isVeryQuiet ? "Low" : "Good";
    const noise: "Low" | "Moderate" | "High" = "Low";
    const clarity: "Good" | "Fair" | "Poor" = isModerateShort ? "Fair" : "Good";
    const speechPresence: "Detected" | "Marginal" | "Insufficient" = isVeryShort
      ? "Insufficient"
      : isModerateShort || isVeryQuiet
      ? "Marginal"
      : "Detected";

    let score = 88;
    if (speechPresence === "Insufficient") score = 52;
    else if (speechPresence === "Marginal") score = 76;

    const metrics: QualityMetrics = {
      volume,
      noise,
      clarity,
      durationSec: Number(durationSec.toFixed(1)),
      speechPresence,
      signalQualityScore: score,
    };

    setQualityMetrics(metrics);
    setWorkspaceState("READY");
  };

  // Trigger analysis on backend
  const handleAnalyze = async () => {
    const audioPayload = audioFile || audioBlob;
    if (!audioPayload) return;

    setWorkspaceState("ANALYZING");
    setErrorMessage(null);

    try {
      const result = await voiceAnalysisApi.analyzeVoice(audioPayload, {
        fileName: audioFileName,
        duration: audioDuration,
        qualityHint: qualityMetrics
          ? {
              noiseLevel: qualityMetrics.noise,
              volume: qualityMetrics.volume,
              clarity: qualityMetrics.clarity,
            }
          : undefined,
      });

      setAnalysisResult(result);
      setWorkspaceState("SUCCESS");

      // Refresh user baseline
      voiceAnalysisApi.getVoiceBaseline().then((base) => setBaseline(base));
    } catch (err: any) {
      console.error("Analysis execution error:", err);
      setErrorMessage(err.message || "Failed to analyze voice recording. Please try again.");
      setWorkspaceState("ERROR");
    }
  };

  // Run demo analysis
  const handleRunDemo = async () => {
    setWorkspaceState("ANALYZING");
    setErrorMessage(null);
    try {
      const result = await voiceAnalysisApi.runDemoAnalysis();
      setAnalysisResult(result);
      setAudioUrl(result.fileUrl || "/assets/editorial/sample-audio.wav");
      setAudioFileName(result.fileName || "sample-audio.wav");
      setAudioDuration(result.duration || 12.0);
      setAudioFileSize(result.fileSize || 1058444);
      setWorkspaceState("SUCCESS");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to run demo.");
      setWorkspaceState("ERROR");
    }
  };

  // Reset temporary recording
  const handleRecordAgain = () => {
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioFile(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setQualityMetrics(null);
    setWorkspaceState("IDLE");
    setErrorMessage(null);
  };

  // Delete analysis
  const handleDeleteAnalysis = async (id?: string) => {
    if (id) {
      try {
        await voiceAnalysisApi.deleteVoiceAnalysis(id);
      } catch (e) {
        console.warn("Delete error:", e);
      }
    }
    setAnalysisResult(null);
    handleRecordAgain();
  };

  const isAudioReady = Boolean(audioUrl && workspaceState !== "IDLE" && workspaceState !== "RECORDING");

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#15171A] tracking-tight">
            Voice Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[#707582] mt-0.5">
            Record your voice or upload an audio file to analyze tone, emotion and speaking style.
          </p>
        </div>

        {/* Demo Quick Button */}
        {workspaceState === "IDLE" && (
          <button
            type="button"
            onClick={handleRunDemo}
            className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD8CD] hover:bg-white text-xs font-semibold text-[#575A60] hover:text-[#15171A] transition cursor-pointer flex items-center gap-1.5 shadow-2xs self-start"
          >
            <Sparkles size={13} className="text-[#10B981]" />
            <span>Try Sample Voice</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left Recorder/Upload (7 cols) + Right Voice Metrics (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Voice Recording Workspace */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs space-y-6">
            {/* Mode Switcher: Record vs Upload */}
            <div className="flex items-center gap-2 justify-start">
              <button
                type="button"
                onClick={() => {
                  if (workspaceState !== "RECORDING" && workspaceState !== "ANALYZING") {
                    setActiveTab("record");
                  }
                }}
                disabled={workspaceState === "RECORDING" || workspaceState === "ANALYZING"}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "record"
                    ? "bg-[#F4F1EA] text-[#15171A] border border-[#DDD8CD]"
                    : "text-[#707582] hover:text-[#15171A]"
                }`}
              >
                <Mic size={14} />
                <span>Record</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (workspaceState !== "RECORDING" && workspaceState !== "ANALYZING") {
                    setActiveTab("upload");
                  }
                }}
                disabled={workspaceState === "RECORDING" || workspaceState === "ANALYZING"}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-[#F4F1EA] text-[#15171A] border border-[#DDD8CD]"
                    : "text-[#707582] hover:text-[#15171A]"
                }`}
              >
                <Upload size={14} />
                <span>Upload</span>
              </button>
            </div>

            {/* If no audio recorded/selected yet: show active mode */}
            {!isAudioReady ? (
              activeTab === "record" ? (
                <VoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onSwitchToUpload={() => setActiveTab("upload")}
                />
              ) : (
                <VoiceUpload onFileSelected={handleFileSelected} />
              )
            ) : (
              /* Audio Ready / Preview State with Playback and Quality */
              <AudioPreview
                audioUrl={audioUrl || ""}
                audioBlob={audioBlob}
                audioFile={audioFile}
                fileName={audioFileName}
                fileSize={audioFileSize}
                duration={audioDuration}
                mimeType={audioMimeType}
                qualityMetrics={qualityMetrics}
                isAnalyzing={workspaceState === "ANALYZING"}
                errorMessage={errorMessage}
                onRecordAgain={handleRecordAgain}
                onAnalyze={handleAnalyze}
                isUploadMode={activeTab === "upload"}
              />
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Voice Metrics Panel */}
        <div className="lg:col-span-5 space-y-4">
          {workspaceState === "ANALYZING" ? (
            <VoiceProcessing />
          ) : (
            <VoiceMetrics
              analysis={analysisResult}
              baseline={baseline}
              onViewDetails={() => setIsDetailsOpen(true)}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>

      {/* Detailed Analysis Slide-Over / Modal */}
      {analysisResult && (
        <VoiceResult
          analysis={analysisResult}
          audioUrl={audioUrl || undefined}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onAnalyzeAgain={handleAnalyze}
          onDelete={handleDeleteAnalysis}
        />
      )}
    </div>
  );
};
