import React, { useState } from "react";
import { ImageAnalysisData } from "../../services/imageAnalysisApi";
import { EmotionDistribution } from "./EmotionDistribution";
import { SceneResult } from "./SceneResult";
import { ObjectResults } from "./ObjectResults";
import { ColorPalette } from "./ColorPalette";
import { VibeResult } from "./VibeResult";
import { EvidencePanel } from "./EvidencePanel";
import { SignalQuality } from "./SignalQuality";
import { ImageActionBar } from "./ImageActionBar";
import {
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  Heart,
  Box,
  Compass,
  Lightbulb,
} from "lucide-react";

interface ImageResultProps {
  analysis: ImageAnalysisData;
  onOpenCaptions: () => void;
  onOpenHashtags: () => void;
  onOpenMusic: () => void;
  onOpenTranslate: () => void;
  onAnalyzeAnother: () => void;
  onDelete: () => void;
  onNavigate?: (path: string) => void;
}

export const ImageResult: React.FC<ImageResultProps> = ({
  analysis,
  onOpenCaptions,
  onOpenHashtags,
  onOpenMusic,
  onOpenTranslate,
  onAnalyzeAnother,
  onDelete,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "emotions" | "objects" | "context" | "insights"
  >("overview");

  const formattedDate = new Date(analysis.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="rounded-3xl border border-[#DDD8CD] bg-white p-6 sm:p-7 space-y-6 shadow-2xs select-none animate-fadeIn">
      {/* Editorial Header with Status & Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD8CD]/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                analysis.isDemo
                  ? "bg-[#FDF8EC] text-[#91672C] border-[#F2DEB0]"
                  : "bg-[#EBF3EE] text-[#30483E] border-[#C8DFD2]"
              }`}
            >
              {analysis.isDemo ? "DEMO INSIGHT" : "AI ANALYZED"}
            </span>

            <span className="text-[10px] font-mono uppercase text-[#858881] flex items-center gap-1">
              <Calendar size={11} />
              <span>{formattedDate}</span>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-serif font-bold text-[#17191A] tracking-tight">
            Visual Signal Report
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#30483E] font-medium flex items-center gap-1.5 bg-[#EBF3EE] px-3 py-1 rounded-full border border-[#C8DFD2]">
            <CheckCircle2 size={13} />
            <span>Saved to history</span>
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#DDD8CD]/50 pb-2">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "emotions", label: "Emotions", icon: Heart },
          { id: "objects", label: "Objects", icon: Box },
          { id: "context", label: "Context & Color", icon: Compass },
          { id: "insights", label: "Guidance", icon: Lightbulb },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isActive
                  ? "bg-[#17191A] text-white"
                  : "bg-transparent text-[#555A58] hover:text-[#17191A] hover:bg-[#FAF8F5]"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="min-h-[300px]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Primary Emotion & Vibe Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EmotionDistribution
                primaryEmotion={analysis.primaryEmotion}
                confidence={analysis.primaryEmotionConfidence}
                explanation={analysis.emotionExplanation}
                distribution={analysis.emotionDistribution.slice(0, 3)}
              />
              <VibeResult
                vibe={analysis.vibe}
                confidence={analysis.vibeConfidence}
                radialProfile={analysis.vibeRadialProfile}
              />
            </div>

            {/* Evidence: Why this result? */}
            <EvidencePanel evidence={analysis.evidence} />

            {/* Quality & Confidence breakdown */}
            <SignalQuality
              signalQuality={analysis.signalQuality}
              signalQualityScore={analysis.signalQualityScore}
              signalQualityReasons={analysis.signalQualityReasons}
              aiConfidence={analysis.aiConfidence}
            />
          </div>
        )}

        {activeTab === "emotions" && (
          <div className="space-y-5">
            <EmotionDistribution
              primaryEmotion={analysis.primaryEmotion}
              confidence={analysis.primaryEmotionConfidence}
              explanation={analysis.emotionExplanation}
              distribution={analysis.emotionDistribution}
            />
          </div>
        )}

        {activeTab === "objects" && (
          <div className="space-y-5">
            <ObjectResults objects={analysis.objects} />
          </div>
        )}

        {activeTab === "context" && (
          <div className="space-y-6">
            <SceneResult
              scene={analysis.scene}
              confidence={analysis.sceneConfidence}
              context={analysis.sceneContext}
            />
            <ColorPalette
              colors={analysis.colorPalette}
              colorTone={analysis.colorTone}
            />
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#17191A]">
                Human Nuance Observations
              </div>
              <div className="space-y-2">
                {analysis.insights.map((ins, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DDD8CD]/80 text-xs text-[#555A58] leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="font-mono text-[#A97858] font-bold">0{i + 1}</span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#17191A]">
                Actionable Recommendations
              </div>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white border border-[#DDD8CD] text-xs text-[#17191A] leading-relaxed flex items-start gap-2.5 shadow-2xs font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30483E] mt-1.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar (Captions, Hashtags, Music, Translation, Export, Delete) */}
      <ImageActionBar
        analysis={analysis}
        onOpenCaptions={onOpenCaptions}
        onOpenHashtags={onOpenHashtags}
        onOpenMusic={onOpenMusic}
        onOpenTranslate={onOpenTranslate}
        onAnalyzeAnother={onAnalyzeAnother}
        onDelete={onDelete}
        onNavigate={onNavigate}
      />
    </div>
  );
};
