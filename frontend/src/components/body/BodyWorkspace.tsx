import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  RotateCcw,
  Presentation,
  History,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCamera, CapturedPortrait } from "../../hooks/useCamera";
import { usePoseDetection } from "../../hooks/usePoseDetection";
import {
  bodyAnalysisApi,
  BodyAnalysisResponse,
} from "../../services/bodyAnalysisApi";
import { CameraViewport } from "./CameraViewport";
import { PortraitCropTool } from "./PortraitCropTool";
import { CaptureReview } from "./CaptureReview";
import { BodyMetrics } from "./BodyMetrics";
import { BodyEvidence } from "./BodyEvidence";
import { BodyCoaching } from "./BodyCoaching";
import { BodyResultModal } from "./BodyResultModal";

type WorkspaceState =
  | "EMPTY"
  | "CAMERA"
  | "CROPPING"
  | "CAPTURED"
  | "ANALYZING"
  | "RESULT";

interface BodyWorkspaceProps {
  onNavigate?: (path: string) => void;
}

export const BodyWorkspace: React.FC<BodyWorkspaceProps> = ({ onNavigate }) => {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>("EMPTY");
  const [captureMode, setCaptureMode] = useState<"portrait" | "upper_body" | "full_body">("portrait");
  const [capturedPortrait, setCapturedPortrait] = useState<CapturedPortrait | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Analysis result & modal state
  const [analysisResult, setAnalysisResult] = useState<BodyAnalysisResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>("Preparing image...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active session timer
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const sessionTimerRef = useRef<any>(null);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Camera Hook
  const {
    state: cameraState,
    isStreaming,
    videoRef,
    isMirrored,
    hasMultipleCameras,
    startCamera,
    stopCamera,
    switchCamera,
    setIsMirrored,
    capturePortraitFrame,
    errorMessage: cameraError,
  } = useCamera({
    preferredFacingMode: "user",
  });

  // Initialize Pose Detection Hook
  const {
    landmarks,
    framingStatus,
    framingAdvice,
    isModelLoading,
    confidence: liveTrackingConfidence,
  } = usePoseDetection(videoRef, {
    enabled: workspaceState === "CAMERA" && isStreaming,
    targetFps: 25,
  });

  // Session timer handler
  useEffect(() => {
    if (isSessionActive) {
      sessionTimerRef.current = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isSessionActive]);

  // Clean unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start Camera Flow
  const handleStartCamera = async () => {
    setErrorMessage(null);
    setWorkspaceState("CAMERA");
    setIsSessionActive(true);
    setSessionSeconds(0);
    await startCamera();
  };

  // Stop Camera Flow
  const handleStopCamera = () => {
    stopCamera();
    setIsSessionActive(false);
    setWorkspaceState("EMPTY");
  };

  // Trigger Portrait Capture
  const handleCapturePhoto = async () => {
    const portrait = await capturePortraitFrame(false);
    if (!portrait) {
      setErrorMessage("Could not capture a valid frame. Please try again.");
      return;
    }
    setCapturedPortrait(portrait);
    stopCamera();
    setIsSessionActive(false);
    setWorkspaceState("CAPTURED");
  };

  // Retake Photo Flow
  const handleRetake = () => {
    setCapturedPortrait(null);
    setErrorMessage(null);
    handleStartCamera();
  };

  // File Upload Handlers
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    setUploadedFile(file);
    setWorkspaceState("CROPPING");
  };

  const handleCropConfirm = (croppedBlob: Blob, previewUrl: string) => {
    const timeStr = new Date().toISOString().slice(11, 19).replace(/:/g, "-");
    setCapturedPortrait({
      blob: croppedBlob,
      url: previewUrl,
      width: 1080,
      height: 1920,
      sizeBytes: croppedBlob.size,
      fileName: `uploaded_crop_${timeStr}.jpg`,
      timestamp: new Date().toISOString(),
    });
    setUploadedFile(null);
    setWorkspaceState("CAPTURED");
  };

  // Run Backend Analysis
  const handleAnalyze = async () => {
    if (!capturedPortrait) return;

    setWorkspaceState("ANALYZING");
    setErrorMessage(null);

    // Multi-stage human readable progress updates
    setAnalyzingStep("Preparing 9:16 portrait image...");
    setTimeout(() => setAnalyzingStep("Detecting anatomical posture landmarks..."), 250);
    setTimeout(() => setAnalyzingStep("Evaluating spinal verticality & shoulder alignment..."), 500);
    setTimeout(() => setAnalyzingStep("Calculating eye gaze contact & gesture openness..."), 800);
    setTimeout(() => setAnalyzingStep("Synthesizing executive presentation coach insights..."), 1100);

    try {
      const result = await bodyAnalysisApi.analyzeBody(capturedPortrait.blob, {
        landmarks: landmarks.length > 0 ? landmarks : undefined,
        captureMode,
        sourceType: uploadedFile ? "upload" : "camera",
        width: capturedPortrait.width,
        height: capturedPortrait.height,
        qualityHint: {
          framing: framingStatus === "READY" ? "Ideal 9:16 Portrait" : "Upper Body Centered",
          lighting: "Optimal direct softlight",
        },
      });

      setAnalysisResult(result);
      setWorkspaceState("RESULT");
    } catch (err: any) {
      console.error("[BodyWorkspace] Analysis failed:", err);
      setErrorMessage(err.message || "We couldn't complete the body analysis. Please try again.");
      setWorkspaceState("CAPTURED");
    }
  };

  // Run Studio Demo Sample
  const handleRunSample = async () => {
    setWorkspaceState("ANALYZING");
    setAnalyzingStep("Loading calibrated studio sample...");
    setErrorMessage(null);

    try {
      const result = await bodyAnalysisApi.getStudioSample();
      setAnalysisResult(result);
      setWorkspaceState("RESULT");
    } catch (err: any) {
      setErrorMessage("Failed to load studio demo sample.");
      setWorkspaceState("EMPTY");
    }
  };

  // Reset to analyze another
  const handleAnalyzeAnother = () => {
    setCapturedPortrait(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setWorkspaceState("EMPTY");
  };

  const formatSessionTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#15171A] tracking-tight">
            Body Language Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[#707582] mt-0.5">
            Understand posture, gaze, movement, and presentation signals.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 self-start">
          {workspaceState === "EMPTY" && (
            <button
              type="button"
              onClick={handleRunSample}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD8CD] hover:bg-white text-xs font-semibold text-[#575A60] hover:text-[#15171A] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles size={13} className="text-emerald-500" />
              <span>Use Studio Sample</span>
            </button>
          )}

          {workspaceState === "RESULT" && (
            <button
              type="button"
              onClick={handleAnalyzeAnother}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#F4F1EA] text-xs font-semibold text-[#15171A] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw size={13} />
              <span>Analyze Another</span>
            </button>
          )}

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("/history")}
              className="px-3 py-1.5 rounded-xl border border-[#DDD8CD] hover:bg-[#FAF8F5] text-xs font-medium text-[#707582] hover:text-[#15171A] transition cursor-pointer flex items-center gap-1.5"
            >
              <History size={13} />
              <span>History</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Error Notice */}
      {(errorMessage || cameraError) && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Notice</span>
            <p>{errorMessage || cameraError}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Left Interactive Workspace (7 cols) + Right Analysis (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera / Capture / Cropping / Analyzing Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs">
            {/* STATE A: Initial Empty State */}
            {workspaceState === "EMPTY" && (
              <div className="py-12 px-4 text-center space-y-6 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-[#FAF8F5] border border-[#E8E4DA] mx-auto flex items-center justify-center text-[#15171A] shadow-xs">
                  <Camera size={28} className="text-emerald-600" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#15171A]">Start Body Analysis</h2>
                  <p className="text-xs sm:text-sm text-[#707582]">
                    Explore your observable movement signals, posture alignment, and gaze contact using real-time camera tracking or a portrait photo.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#15171A] hover:bg-[#2A2E39] text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
                  >
                    <Camera size={15} />
                    <span>Start Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#F4F1EA] hover:bg-[#EFEAE1] border border-[#DDD8CD] text-xs font-semibold text-[#15171A] transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Upload size={14} />
                    <span>Upload Photo</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#8C8983] pt-4">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Strictly private • Processed directly for your account</span>
                </div>
              </div>
            )}

            {/* STATE B: Live Camera Viewport */}
            {workspaceState === "CAMERA" && (
              <div className="space-y-4">
                {/* Active Session Status Bar */}
                <div className="flex items-center justify-between text-xs pb-1 border-b border-[#E8E4DA]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-[#15171A]">Live Camera Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[#707582]">
                    <Clock size={12} />
                    <span>{formatSessionTimer(sessionSeconds)}</span>
                  </div>
                </div>

                <CameraViewport
                  videoRef={videoRef}
                  isStreaming={isStreaming}
                  isMirrored={isMirrored}
                  landmarks={landmarks}
                  framingStatus={framingStatus}
                  framingAdvice={framingAdvice}
                  hasMultipleCameras={hasMultipleCameras}
                  captureMode={captureMode}
                  onCaptureModeChange={setCaptureMode}
                  onSwitchCamera={switchCamera}
                  onToggleMirror={() => setIsMirrored(!isMirrored)}
                  onCapture={handleCapturePhoto}
                  onStopCamera={handleStopCamera}
                />
              </div>
            )}

            {/* STATE C: Portrait Crop Tool for Uploaded Image */}
            {workspaceState === "CROPPING" && uploadedFile && (
              <PortraitCropTool
                imageFile={uploadedFile}
                onCropConfirm={handleCropConfirm}
                onCancel={() => {
                  setUploadedFile(null);
                  setWorkspaceState("EMPTY");
                }}
              />
            )}

            {/* STATE D: Captured Portrait Review */}
            {workspaceState === "CAPTURED" && capturedPortrait && (
              <CaptureReview
                capture={capturedPortrait}
                isAnalyzing={false}
                onRetake={handleRetake}
                onAnalyze={handleAnalyze}
              />
            )}

            {/* STATE E: Analyzing Multi-Step Progress Indicator */}
            {workspaceState === "ANALYZING" && (
              <div className="py-20 text-center space-y-5">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-3 border-[#E8E4DA] border-t-[#15171A] animate-spin" />
                  <Sparkles size={20} className="absolute inset-0 m-auto text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#15171A]">{analyzingStep}</h3>
                  <p className="text-xs text-[#707582]">Triangulating 33 anatomical joints and posture alignment...</p>
                </div>
              </div>
            )}

            {/* STATE F: Result Image View */}
            {workspaceState === "RESULT" && analysisResult && (
              <div className="space-y-5">
                <div className="relative mx-auto w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#121316] border border-[#DDD8CD] shadow-sm">
                  {analysisResult.imageUrl ? (
                    <img
                      src={analysisResult.imageUrl}
                      alt="Analyzed Subject"
                      className="w-full h-full object-cover"
                    />
                  ) : capturedPortrait ? (
                    <img
                      src={capturedPortrait.url}
                      alt="Analyzed Subject"
                      className="w-full h-full object-cover"
                    />
                  ) : null}

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-white">
                    {analysisResult.captureMode} Mode
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAnalyzeAnother}
                    className="px-4 py-2 rounded-xl border border-[#DDD8CD] hover:bg-[#F4F1EA] text-xs font-semibold text-[#15171A] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Analyze Another</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="px-5 py-2 rounded-xl bg-[#15171A] hover:bg-[#2A2E39] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Presentation size={14} className="text-emerald-400" />
                    <span>Presentation Coach →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Observable Metrics & Real Signals */}
        <div className="lg:col-span-5 space-y-4">
          <BodyMetrics
            analysis={analysisResult}
            onViewDetails={analysisResult ? () => setIsDetailsModalOpen(true) : undefined}
          />
        </div>
      </div>

      {/* Detailed Analysis Slide-over / Modal */}
      {analysisResult && (
        <BodyResultModal
          analysis={analysisResult}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onDelete={async (id) => {
            try {
              await bodyAnalysisApi.deleteBodyAnalysis(id);
              handleAnalyzeAnother();
            } catch (e) {
              console.warn("Delete error:", e);
            }
          }}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
