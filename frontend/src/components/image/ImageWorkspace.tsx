import React, { useState, useEffect } from "react";
import {
  Upload,
  Camera,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  FileText,
} from "lucide-react";
import { ImageDropzone } from "./ImageDropzone";
import { CameraCapture } from "./CameraCapture";
import { ImagePreview } from "./ImagePreview";
import { ImageQualityPanel } from "./ImageQualityPanel";
import { ImageProcessingState } from "./ImageProcessingState";
import { ImageResult } from "./ImageResult";
import { CaptionGenerator } from "./CaptionGenerator";
import { HashtagGenerator } from "./HashtagGenerator";
import { MusicSuggestions } from "./MusicSuggestions";
import { TranslationPanel } from "./TranslationPanel";
import { imageAnalysisApi, ImageAnalysisData } from "../../services/imageAnalysisApi";

type WorkspaceState = "EMPTY" | "READY" | "ANALYZING" | "SUCCESS" | "ERROR";

interface ImageWorkspaceProps {
  initialAnalysisId?: string | null;
  onNavigate?: (path: string) => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  initialAnalysisId,
  onNavigate,
}) => {
  // State Machine
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>("EMPTY");
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");

  // Selected File & Preview Data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileDimensions, setFileDimensions] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });

  // Analysis Output
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCaptionsOpen, setIsCaptionsOpen] = useState(false);
  const [isHashtagsOpen, setIsHashtagsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [translateTargetText, setTranslateTargetText] = useState("");

  // Load existing analysis if ID is provided
  useEffect(() => {
    if (initialAnalysisId) {
      loadExistingAnalysis(initialAnalysisId);
    }
  }, [initialAnalysisId]);

  const loadExistingAnalysis = async (id: string) => {
    setWorkspaceState("ANALYZING");
    try {
      const data = await imageAnalysisApi.getAnalysis(id);
      setAnalysisResult(data);
      if (data.fileUrl) {
        setPreviewUrl(data.fileUrl);
      }
      setWorkspaceState("SUCCESS");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load requested analysis.");
      setWorkspaceState("ERROR");
    }
  };

  // Handle File Selection
  const handleFileSelected = (file: File) => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);

    // Read natural dimensions
    const img = new Image();
    img.onload = () => {
      setFileDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;

    setWorkspaceState("READY");
  };

  // Handle Demo Mode Trigger
  const handleDemoClick = async () => {
    setWorkspaceState("ANALYZING");
    try {
      const data = await imageAnalysisApi.analyzeImage(undefined, { isDemo: true });
      setAnalysisResult(data);
      setPreviewUrl(data.fileUrl);
      setWorkspaceState("SUCCESS");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate demo insight.");
      setWorkspaceState("ERROR");
    }
  };

  // Trigger Analysis
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setWorkspaceState("ANALYZING");
    setErrorMessage(null);

    try {
      const data = await imageAnalysisApi.analyzeImage(selectedFile);
      setAnalysisResult(data);
      setWorkspaceState("SUCCESS");

      // Update URL query param if available
      if (window.history && data.id) {
        window.history.replaceState(null, "", `/image?id=${data.id}`);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "The visual analysis service is temporarily unavailable. Please try again."
      );
      setWorkspaceState("ERROR");
    }
  };

  // Reset to Empty
  const handleReset = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setWorkspaceState("EMPTY");
    setActiveTab("upload");

    if (window.history) {
      window.history.replaceState(null, "", "/image");
    }
  };

  // Delete Analysis
  const handleDelete = async () => {
    if (analysisResult?.id) {
      try {
        await imageAnalysisApi.deleteAnalysis(analysisResult.id);
      } catch (e) {
        console.warn("Delete call failed:", e);
      }
    }
    handleReset();
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17191A] tracking-tight">
          Image Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[#555A58] mt-1 font-sans">
          Upload an image to detect emotional cues, scene contexts, chromatic harmonies, and behavioral signals.
        </p>
      </div>

      {/* Main Grid Layout: Left (Workspace/Upload) & Right (Results/Empty) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* ============================================================
            LEFT COLUMN: Uploader / Camera / Preview Controls (5 or 6 cols)
           ============================================================ */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-5">
          {/* Top Switcher: Upload vs Camera */}
          {workspaceState !== "ANALYZING" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-white text-[#17191A] border border-[#DDD8CD] shadow-2xs"
                    : "text-[#858881] hover:text-[#17191A]"
                }`}
              >
                <Upload size={14} />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("camera")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "camera"
                    ? "bg-white text-[#17191A] border border-[#DDD8CD] shadow-2xs"
                    : "text-[#858881] hover:text-[#17191A]"
                }`}
              >
                <Camera size={14} />
                <span>Live Camera</span>
              </button>
            </div>
          )}

          {/* Tab 1: Upload Dropzone or Selected Preview */}
          {activeTab === "upload" && (
            <>
              {workspaceState === "EMPTY" && (
                <div className="bg-white rounded-3xl p-6 border border-[#DDD8CD] shadow-2xs space-y-5">
                  <ImageDropzone
                    onFileSelected={handleFileSelected}
                    onCameraClick={() => setActiveTab("camera")}
                    onDemoClick={handleDemoClick}
                  />
                </div>
              )}

              {(workspaceState === "READY" ||
                workspaceState === "ANALYZING" ||
                workspaceState === "SUCCESS" ||
                workspaceState === "ERROR") &&
                previewUrl && (
                  <div className="space-y-4">
                    <ImagePreview
                      imageUrl={previewUrl}
                      fileName={selectedFile?.name || analysisResult?.fileName || "analyzed-image.jpg"}
                      fileSize={selectedFile?.size || analysisResult?.fileSize}
                      mimeType={selectedFile?.type || analysisResult?.mimeType}
                      width={fileDimensions.width}
                      height={fileDimensions.height}
                      onChangeImage={handleReset}
                      disabled={workspaceState === "ANALYZING"}
                    />

                    {/* Pre-flight Quality Assessment (Before Analysis) */}
                    {workspaceState === "READY" && (
                      <>
                        <ImageQualityPanel
                          fileSize={selectedFile?.size}
                          width={fileDimensions.width}
                          height={fileDimensions.height}
                        />

                        {/* Big Start Analysis Button */}
                        <button
                          type="button"
                          onClick={handleAnalyze}
                          className="w-full py-4 rounded-2xl bg-[#17191A] hover:bg-[#2A2E2C] text-[#F6F3EC] text-sm font-semibold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition cursor-pointer active:scale-98"
                        >
                          <span>Analyze Image</span>
                          <ArrowRight size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
            </>
          )}

          {/* Tab 2: Camera Capture Mode */}
          {activeTab === "camera" && (
            <CameraCapture
              onCapture={(file) => {
                setActiveTab("upload");
                handleFileSelected(file);
              }}
              onCancel={() => setActiveTab("upload")}
            />
          )}
        </div>

        {/* ============================================================
            RIGHT COLUMN: Analysis Result / Processing / Empty State (6 or 7 cols)
           ============================================================ */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-5">
          {/* 1. INITIAL EMPTY STATE (No fake Happy 92%!) */}
          {workspaceState === "EMPTY" && (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#DDD8CD] shadow-2xs text-center space-y-5 select-none min-h-[420px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#DDD8CD] flex items-center justify-center text-[#858881]">
                <FileText size={28} strokeWidth={1.5} />
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-serif text-xl font-bold text-[#17191A] tracking-tight">
                  No analysis yet
                </h3>
                <p className="text-xs sm:text-sm text-[#555A58] leading-relaxed">
                  Upload an image or capture with your camera to explore emotion, scene context, and visual signals.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className="px-6 py-2.5 rounded-full bg-[#17191A] hover:bg-[#2C302E] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Upload an image
                </button>
                <button
                  type="button"
                  onClick={handleDemoClick}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#DDD8CD] text-[#17191A] text-xs font-medium transition cursor-pointer"
                >
                  Try demo mode
                </button>
              </div>
            </div>
          )}

          {/* 2. READY STATE (File selected, waiting for user to click analyze) */}
          {workspaceState === "READY" && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DDD8CD] shadow-2xs text-center space-y-4 select-none min-h-[380px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#EBF3EE] text-[#30483E] flex items-center justify-center">
                <ArrowRight size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#17191A]">
                  Image Ready for Analysis
                </h3>
                <p className="text-xs text-[#555A58] max-w-xs mx-auto">
                  Click &ldquo;Analyze Image&rdquo; on the left to begin tensor signal processing.
                </p>
              </div>
            </div>
          )}

          {/* 3. ANALYZING / PROCESSING STATE */}
          {workspaceState === "ANALYZING" && (
            <ImageProcessingState onCancel={handleReset} />
          )}

          {/* 4. SUCCESS RESULT REPORT */}
          {workspaceState === "SUCCESS" && analysisResult && (
            <ImageResult
              analysis={analysisResult}
              onOpenCaptions={() => setIsCaptionsOpen(true)}
              onOpenHashtags={() => setIsHashtagsOpen(true)}
              onOpenMusic={() => setIsMusicOpen(true)}
              onOpenTranslate={() => {
                setTranslateTargetText(
                  analysisResult.insights[0] ||
                    `A thoughtful, ${analysisResult.vibe.toLowerCase()} moment observed through VibeLens.`
                );
                setIsTranslateOpen(true);
              }}
              onAnalyzeAnother={handleReset}
              onDelete={handleDelete}
              onNavigate={onNavigate}
            />
          )}

          {/* 5. ERROR STATE */}
          {workspaceState === "ERROR" && (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F5C2BC] bg-[#FDF2F0]/20 shadow-2xs text-center space-y-4 select-none">
              <div className="w-12 h-12 rounded-full bg-[#F5C2BC] text-[#C23B22] flex items-center justify-center mx-auto">
                <AlertCircle size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#17191A]">
                  We couldn&rsquo;t complete the analysis
                </h3>
                <p className="text-xs text-[#555A58] max-w-sm mx-auto leading-relaxed">
                  {errorMessage || "An unexpected error occurred during processing."}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="px-5 py-2 rounded-xl bg-[#17191A] text-white text-xs font-semibold cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl bg-white border border-[#DDD8CD] text-[#17191A] text-xs font-medium cursor-pointer"
                >
                  Change Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals for Captions, Hashtags, Music, Translation */}
      <CaptionGenerator
        isOpen={isCaptionsOpen}
        onClose={() => setIsCaptionsOpen(false)}
        analysisId={analysisResult?.id}
        emotion={analysisResult?.primaryEmotion}
        vibe={analysisResult?.vibe}
        scene={analysisResult?.scene}
        onOpenTranslate={(text) => {
          setTranslateTargetText(text);
          setIsCaptionsOpen(false);
          setIsTranslateOpen(true);
        }}
      />

      <HashtagGenerator
        isOpen={isHashtagsOpen}
        onClose={() => setIsHashtagsOpen(false)}
        analysisId={analysisResult?.id}
        emotion={analysisResult?.primaryEmotion}
        vibe={analysisResult?.vibe}
        scene={analysisResult?.scene}
      />

      <MusicSuggestions
        isOpen={isMusicOpen}
        onClose={() => setIsMusicOpen(false)}
        analysisId={analysisResult?.id}
        emotion={analysisResult?.primaryEmotion}
        vibe={analysisResult?.vibe}
        scene={analysisResult?.scene}
      />

      <TranslationPanel
        isOpen={isTranslateOpen}
        onClose={() => setIsTranslateOpen(false)}
        initialText={translateTargetText}
      />
    </div>
  );
};
