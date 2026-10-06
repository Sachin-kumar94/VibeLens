import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sliders,
  Check,
} from "lucide-react";
import { api } from "../services/api";
import { ContextSelector } from "../components/fusion/ContextSelector";
import { ModalityCard, ConnectedSignalData } from "../components/fusion/ModalityCard";
import { PortraitCameraModal } from "../components/fusion/PortraitCameraModal";
import { VoiceRecorderModal } from "../components/fusion/VoiceRecorderModal";
import { HistorySelectorModal } from "../components/fusion/HistorySelectorModal";
import { FusionProcessingView } from "../components/fusion/FusionProcessingView";
import { FusionResultPanel } from "../components/fusion/FusionResultPanel";
import { FusionReportModal } from "../components/fusion/FusionReportModal";
import { FusionJournalModal } from "../components/fusion/FusionJournalModal";

interface FusionPageProps {
  onNavigate: (path: string) => void;
}

export const FusionPage: React.FC<FusionPageProps> = ({ onNavigate }) => {
  // Input mode tab: Quick Fusion vs Existing Analyses
  const [activeTab, setActiveTab] = useState<"quick" | "existing">("quick");

  // Interaction Context
  const [context, setContext] = useState<string>("Presentation");
  const [customContext, setCustomContext] = useState<string>("");

  // Connected signals for Image, Voice, Body
  const [imageSignal, setImageSignal] = useState<ConnectedSignalData | null>(null);
  const [voiceSignal, setVoiceSignal] = useState<ConnectedSignalData | null>(null);
  const [bodySignal, setBodySignal] = useState<ConnectedSignalData | null>(null);

  // Modals state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraTargetModality, setCameraTargetModality] = useState<"image" | "body">("image");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [historyModalTarget, setHistoryModalTarget] = useState<"image" | "voice" | "body" | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  // Synthesis & Result State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [fusionResult, setFusionResult] = useState<any>(null);
  const [isResultSaved, setIsResultSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [journalSuccessToast, setJournalSuccessToast] = useState(false);

  // Load existing analyses for auto-fill or recent suggestion
  useEffect(() => {
    loadRecentAnalyses();
  }, []);

  const loadRecentAnalyses = async () => {
    try {
      const analyses = await api.getAnalyses();
      if (!analyses || analyses.length === 0) return;

      // Only auto-connect if user has existing analyses and none are currently connected
      const latestImg = analyses.find((a: any) => a.type === "image");
      const latestVce = analyses.find((a: any) => a.type === "voice");
      const latestBdy = analyses.find((a: any) => a.type === "body");

      if (latestImg && !imageSignal) {
        setImageSignal({
          sourceType: "history",
          analysisId: latestImg.id,
          title: latestImg.title,
          fileName: latestImg.fileName || "portrait_archive.webp",
          previewUrl: latestImg.fileUrl || latestImg.inputUrl,
          signalQuality: latestImg.signalQuality === "Good" ? 92 : 78,
          confidence: latestImg.confidence || 88,
          emotion: latestImg.emotion || "Composed & Focused",
          vibe: latestImg.vibe || "Natural Lighting",
          rawPayload: latestImg,
        });
      }

      if (latestVce && !voiceSignal) {
        setVoiceSignal({
          sourceType: "history",
          analysisId: latestVce.id,
          title: latestVce.title,
          previewUrl: latestVce.fileUrl,
          signalQuality: latestVce.signalQuality === "Good" ? 90 : 76,
          confidence: latestVce.confidence || 87,
          emotion: latestVce.emotion || "Measured",
          tone: latestVce.vibe || "Warm & Measured",
          pace: 142,
          energy: 80,
          rawPayload: latestVce,
        });
      }

      if (latestBdy && !bodySignal) {
        setBodySignal({
          sourceType: "history",
          analysisId: latestBdy.id,
          title: latestBdy.title,
          previewUrl: latestBdy.fileUrl,
          signalQuality: latestBdy.signalQuality === "Good" ? 88 : 74,
          confidence: latestBdy.confidence || 88,
          posture: "Upright & Centered",
          gaze: "Direct",
          rawPayload: latestBdy,
        });
      }
    } catch (e) {
      console.warn("Could not load recent analyses for fusion:", e);
    }
  };

  // Connected modalities count
  const connectedCount =
    (imageSignal ? 1 : 0) + (voiceSignal ? 1 : 0) + (bodySignal ? 1 : 0);

  const activeContextText = context === "Custom" ? customContext : context;

  // Handle Photo Capture from Portrait Camera
  const handlePhotoCaptureComplete = (captured: {
    blob: Blob;
    url: string;
    width: number;
    height: number;
    fileName: string;
  }) => {
    if (cameraTargetModality === "image") {
      setImageSignal({
        sourceType: "capture",
        title: "Portrait Capture (9:16)",
        fileName: captured.fileName,
        previewUrl: captured.url,
        signalQuality: 93,
        confidence: 90,
        emotion: "Composed & Grounded",
        vibe: "Natural Portrait Lighting",
        rawPayload: {
          emotion: "Composed & Grounded",
          confidence: 90,
          signalQuality: 93,
          fileUrl: captured.url,
        },
      });
    } else {
      setBodySignal({
        sourceType: "capture",
        title: "Kinetic Frame Capture",
        fileName: captured.fileName,
        previewUrl: captured.url,
        signalQuality: 89,
        confidence: 88,
        posture: "Upright & Open",
        gaze: "Centered",
        rawPayload: {
          posture: "Upright & Open",
          postureScore: 89,
          engagement: 88,
          confidence: 88,
          signalQuality: 89,
          imageUrl: captured.url,
        },
      });
    }
  };

  // Handle Voice Recording Complete
  const handleVoiceRecordingComplete = (recorded: {
    blob: Blob;
    url: string;
    duration: number;
    mimeType: string;
  }) => {
    setVoiceSignal({
      sourceType: "capture",
      title: `Live Voice Session (${Math.round(recorded.duration)}s)`,
      previewUrl: recorded.url,
      signalQuality: 91,
      confidence: 88,
      emotion: "Resonant & Measured",
      tone: "Warm Declarative",
      pace: 144,
      energy: 82,
      rawPayload: {
        emotion: "Resonant & Measured",
        tone: "Warm Declarative",
        pace: 144,
        energy: 82,
        clarity: 92,
        confidence: 88,
        signalQuality: 91,
        audioUrl: recorded.url,
        duration: recorded.duration,
      },
    });
  };

  // Handle Local File Upload for Image
  const handleImageFileUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setImageSignal({
      sourceType: "upload",
      title: file.name,
      fileName: file.name,
      previewUrl,
      signalQuality: 89,
      confidence: 87,
      emotion: "Authentic Focus",
      vibe: "Natural Workspace Ambient",
      rawPayload: {
        emotion: "Authentic Focus",
        confidence: 87,
        signalQuality: 89,
        fileUrl: previewUrl,
      },
    });
  };

  // Handle Local File Upload for Voice
  const handleVoiceFileUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setVoiceSignal({
      sourceType: "upload",
      title: file.name,
      previewUrl,
      signalQuality: 88,
      confidence: 86,
      emotion: "Articulate & Clear",
      tone: "Balanced Conversational",
      pace: 138,
      energy: 78,
      rawPayload: {
        emotion: "Articulate & Clear",
        tone: "Balanced Conversational",
        pace: 138,
        energy: 78,
        clarity: 89,
        confidence: 86,
        signalQuality: 88,
        audioUrl: previewUrl,
      },
    });
  };

  // Handle Local File Upload for Body
  const handleBodyFileUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setBodySignal({
      sourceType: "upload",
      title: file.name,
      previewUrl,
      signalQuality: 87,
      confidence: 86,
      posture: "Aligned & Grounded",
      gaze: "Direct",
      rawPayload: {
        posture: "Aligned & Grounded",
        postureScore: 87,
        engagement: 86,
        confidence: 86,
        signalQuality: 87,
        imageUrl: previewUrl,
      },
    });
  };

  // Handle History Selection
  const handleHistorySelect = (item: any) => {
    if (historyModalTarget === "image") {
      setImageSignal({
        sourceType: "history",
        analysisId: item.id,
        title: item.title,
        fileName: item.fileName || "portrait_archive.webp",
        previewUrl: item.fileUrl || item.imageUrl,
        signalQuality: item.signalQuality === "Good" ? 92 : 78,
        confidence: item.confidence || 88,
        emotion: item.emotion || "Composed & Focused",
        vibe: item.vibe,
        rawPayload: item,
      });
    } else if (historyModalTarget === "voice") {
      setVoiceSignal({
        sourceType: "history",
        analysisId: item.id,
        title: item.title,
        previewUrl: item.fileUrl || item.audioUrl,
        signalQuality: item.signalQuality === "Good" ? 90 : 76,
        confidence: item.confidence || 87,
        emotion: item.emotion || "Measured",
        tone: item.vibe || item.tone || "Warm & Measured",
        pace: 142,
        energy: 80,
        rawPayload: item,
      });
    } else if (historyModalTarget === "body") {
      setBodySignal({
        sourceType: "history",
        analysisId: item.id,
        title: item.title,
        previewUrl: item.fileUrl || item.imageUrl,
        signalQuality: item.signalQuality === "Good" ? 88 : 74,
        confidence: item.confidence || 88,
        posture: item.postureSignal || "Upright & Centered",
        gaze: item.gazeSignal || "Direct",
        rawPayload: item,
      });
    }
  };

  // Studio Sample Loader for Demonstration
  const handleLoadStudioSample = () => {
    setImageSignal({
      sourceType: "studio",
      title: "Studio Portrait Sample (DEMO)",
      fileName: "studio_portrait_sample.webp",
      previewUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      signalQuality: 93,
      confidence: 91,
      emotion: "Warm Composure",
      vibe: "Optimal Soft Studio Illumination",
      rawPayload: {
        emotion: "Warm Composure",
        confidence: 91,
        signalQuality: 93,
        visualTone: "Optimal Soft Studio Illumination",
      },
    });

    setVoiceSignal({
      sourceType: "studio",
      title: "Studio Acoustic Sample (DEMO)",
      signalQuality: 90,
      confidence: 88,
      emotion: "Measured Assertiveness",
      tone: "Warm Resonant",
      pace: 142,
      energy: 82,
      rawPayload: {
        emotion: "Measured Assertiveness",
        tone: "Warm Resonant",
        pace: 142,
        energy: 82,
        clarity: 92,
        confidence: 88,
        signalQuality: 90,
      },
    });

    setBodySignal({
      sourceType: "studio",
      title: "Studio Posture Sample (DEMO)",
      signalQuality: 89,
      confidence: 89,
      posture: "Open & Grounded",
      gaze: "Direct Attentive",
      rawPayload: {
        posture: "Open & Grounded",
        postureScore: 89,
        engagement: 89,
        confidence: 89,
        signalQuality: 89,
      },
    });
  };

  // Run Synthesis & Fusion
  const handleRunFusion = async () => {
    if (connectedCount < 2) {
      setErrorMessage("Select at least two signal sources for multimodal fusion.");
      return;
    }

    setIsSynthesizing(true);
    setErrorMessage(null);

    try {
      const payload = {
        image: imageSignal?.rawPayload || (imageSignal ? {
          emotion: imageSignal.emotion,
          confidence: imageSignal.confidence,
          signalQuality: imageSignal.signalQuality,
          fileUrl: imageSignal.previewUrl,
        } : null),
        voice: voiceSignal?.rawPayload || (voiceSignal ? {
          emotion: voiceSignal.emotion,
          tone: voiceSignal.tone,
          pace: voiceSignal.pace,
          energy: voiceSignal.energy,
          confidence: voiceSignal.confidence,
          signalQuality: voiceSignal.signalQuality,
        } : null),
        body: bodySignal?.rawPayload || (bodySignal ? {
          posture: bodySignal.posture,
          postureScore: bodySignal.confidence,
          engagement: bodySignal.confidence,
          confidence: bodySignal.confidence,
          signalQuality: bodySignal.signalQuality,
        } : null),
        context: activeContextText || "Presentation",
        imageAnalysisId: imageSignal?.analysisId,
        voiceAnalysisId: voiceSignal?.analysisId,
        bodyAnalysisId: bodySignal?.analysisId,
      };

      const res = await api.analyzeFusion(payload);
      setFusionResult(res);
      setIsResultSaved(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to synthesize multimodal fusion.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4 border-b border-[#E6E2D8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#15171A] tracking-tight">
              Multimodal Fusion
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#A855F7]/10 text-[#7E22CE]">
              Synthesis Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#707582] mt-0.5">
            Combine available image, voice, and body signals for a broader view of the moment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadStudioSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#FAF8F5] text-xs font-medium text-[#525866] hover:text-[#15171A] cursor-pointer transition"
            title="Load reference studio sample for demonstration"
          >
            <Sliders size={13} />
            <span>Load Studio Sample</span>
          </button>

          <button
            type="button"
            onClick={loadRecentAnalyses}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#FAF8F5] text-xs font-medium text-[#15171A] cursor-pointer transition shadow-2xs"
          >
            <RefreshCw size={13} />
            <span>Refresh Inputs</span>
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {journalSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Successfully saved multimodal session to your personal archive!</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("/history")}
            className="font-bold underline hover:text-emerald-900 cursor-pointer"
          >
            View in History
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Column (Inputs & Fusion Engine) + Right Column (Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Signal Sources & Orchestration */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs space-y-6">
            {/* Interaction Context */}
            <ContextSelector
              context={context}
              onChange={setContext}
              customContext={customContext}
              onCustomChange={setCustomContext}
            />

            {/* Signal Input Source Cards (3 Modules: IMAGE, VOICE, BODY) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#15171A] tracking-wider uppercase font-mono">
                  Signal Sources ({connectedCount}/3 Connected)
                </span>
                <span className="text-[11px] text-[#8C8983]">
                  Minimum 2 required for cross-modal synthesis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Image Modality Card */}
                <ModalityCard
                  modality="image"
                  connectedSignal={imageSignal}
                  onCaptureClick={() => {
                    setCameraTargetModality("image");
                    setIsCameraModalOpen(true);
                  }}
                  onUploadFile={handleImageFileUpload}
                  onHistoryClick={() => setHistoryModalTarget("image")}
                  onRemove={() => setImageSignal(null)}
                  onChange={() => {
                    setCameraTargetModality("image");
                    setIsCameraModalOpen(true);
                  }}
                />

                {/* 2. Voice Modality Card */}
                <ModalityCard
                  modality="voice"
                  connectedSignal={voiceSignal}
                  onCaptureClick={() => setIsVoiceModalOpen(true)}
                  onUploadFile={handleVoiceFileUpload}
                  onHistoryClick={() => setHistoryModalTarget("voice")}
                  onRemove={() => setVoiceSignal(null)}
                  onChange={() => setIsVoiceModalOpen(true)}
                />

                {/* 3. Body Modality Card */}
                <ModalityCard
                  modality="body"
                  connectedSignal={bodySignal}
                  onCaptureClick={() => {
                    setCameraTargetModality("body");
                    setIsCameraModalOpen(true);
                  }}
                  onLiveCameraClick={() => {
                    setCameraTargetModality("body");
                    setIsCameraModalOpen(true);
                  }}
                  onUploadFile={handleBodyFileUpload}
                  onHistoryClick={() => setHistoryModalTarget("body")}
                  onRemove={() => setBodySignal(null)}
                  onChange={() => {
                    setCameraTargetModality("body");
                    setIsCameraModalOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Pre-Fusion Summary Bar */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD8CD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#15171A] block">
                  Ready to Fuse: {connectedCount} Modalities
                </span>
                <div className="flex items-center gap-3 pt-0.5 text-[11px] text-[#707582]">
                  <span className={imageSignal ? "text-[#10B981] font-semibold" : "text-[#8C8983]"}>
                    Image {imageSignal ? "✓" : "—"}
                  </span>
                  <span>·</span>
                  <span className={voiceSignal ? "text-[#10B981] font-semibold" : "text-[#8C8983]"}>
                    Voice {voiceSignal ? "✓" : "—"}
                  </span>
                  <span>·</span>
                  <span className={bodySignal ? "text-[#10B981] font-semibold" : "text-[#8C8983]"}>
                    Body {bodySignal ? "✓" : "—"}
                  </span>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] text-[#8C8983] block">Active Context</span>
                <span className="font-semibold text-[#15171A] truncate block max-w-[200px]">
                  {activeContextText || "General"}
                </span>
              </div>
            </div>

            {/* Synthesis Trigger Button */}
            <div className="flex flex-col items-center justify-center space-y-2 pt-2">
              <button
                type="button"
                onClick={handleRunFusion}
                disabled={connectedCount < 2 || isSynthesizing}
                className="px-9 py-3.5 rounded-full bg-[#15171A] hover:bg-[#252833] text-white flex items-center gap-2.5 text-xs font-semibold shadow-lg hover:scale-102 active:scale-98 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                title={
                  connectedCount < 2
                    ? "Select at least two signal sources for fusion."
                    : "Synthesize multimodal signals"
                }
              >
                <Layers size={16} className="text-[#A855F7]" />
                <span>
                  {isSynthesizing ? "Synthesizing Multimodal Matrix..." : "Synthesize & Fuse Signals"}
                </span>
              </button>

              {connectedCount < 2 && (
                <span className="text-[11px] text-amber-700 font-medium">
                  Select at least two signal sources for fusion.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Result Panel or Processing View */}
        <div className="lg:col-span-5 space-y-4">
          {isSynthesizing ? (
            <FusionProcessingView />
          ) : fusionResult ? (
            <FusionResultPanel
              result={fusionResult}
              isSaved={isResultSaved}
              onViewHistory={() => onNavigate("/history")}
              onAddToJournal={() => setIsJournalModalOpen(true)}
              onCompare={() => {
                if (fusionResult.id) {
                  sessionStorage.setItem("vibelens_compare_ids", JSON.stringify([fusionResult.id]));
                }
                onNavigate("/compare");
              }}
              onExportReport={() => setIsReportModalOpen(true)}
              onAnalyzeAgain={() => {
                setFusionResult(null);
                setIsResultSaved(false);
              }}
            />
          ) : (
            /* Awaiting Synthesis State */
            <div className="p-8 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#FAF8F5] border border-[#DDD8CD] flex items-center justify-center mx-auto text-[#8C8983]">
                <Layers size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#15171A]">
                  Awaiting Signal Synthesis
                </h3>
                <p className="text-xs text-[#707582] leading-relaxed max-w-[280px] mx-auto">
                  Connect your portrait photo, voice audio, or body posture, then click Synthesize to view cross-modal concordance.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6E2D8] text-[11px] text-[#525866] text-left space-y-1">
                <span className="font-semibold text-[#15171A] block">What gets analyzed:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[#707582]">
                  <li>Cross-modal affective valence alignment</li>
                  <li>Acoustic cadence vs postural engagement</li>
                  <li>Signals that align & signals that differ</li>
                  <li>Confidence and aggregate fidelity metrics</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PortraitCameraModal
        title={cameraTargetModality === "image" ? "Capture Portrait Photo" : "Capture Kinetic Body Posture"}
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureComplete={handlePhotoCaptureComplete}
      />

      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onRecordingComplete={handleVoiceRecordingComplete}
      />

      <HistorySelectorModal
        isOpen={historyModalTarget !== null}
        targetModality={historyModalTarget || "image"}
        onClose={() => setHistoryModalTarget(null)}
        onSelect={handleHistorySelect}
      />

      <FusionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={fusionResult}
      />

      <FusionJournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        result={fusionResult}
        onSuccess={() => {
          setJournalSuccessToast(true);
          setTimeout(() => setJournalSuccessToast(false), 5000);
        }}
      />
    </div>
  );
};
