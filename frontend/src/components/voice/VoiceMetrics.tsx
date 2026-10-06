import React from "react";
import {
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  Mic,
  Activity,
  Sliders
} from "lucide-react";
import { VoiceAnalysisData, UserVocalBaseline } from "../../services/voiceAnalysisApi";

interface VoiceMetricsProps {
  analysis: VoiceAnalysisData | null;
  baseline?: UserVocalBaseline | null;
  onViewDetails?: () => void;
  onNavigate?: (path: string) => void;
}

export const VoiceMetrics: React.FC<VoiceMetricsProps> = ({
  analysis,
  baseline,
  onViewDetails,
  onNavigate,
}) => {
  // 1. Initial Empty State
  if (!analysis) {
    return (
      <div className="p-7 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F4F1EA] pb-3">
          <h2 className="text-sm font-bold text-[#15171A] tracking-tight">
            Voice Metrics
          </h2>
          <span className="text-[10px] font-mono text-[#8C8983] uppercase tracking-wider">
            Awaiting Signal
          </span>
        </div>

        <div className="py-10 px-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] text-[#707582] flex items-center justify-center mx-auto border border-[#DDD8CD]">
            <Mic size={22} className="text-[#8C8983]" />
          </div>

          <div className="space-y-1.5 max-w-xs mx-auto">
            <h3 className="text-sm font-bold text-[#15171A]">
              No voice analysis yet
            </h3>
            <p className="text-xs text-[#707582] leading-relaxed">
              Record your voice or upload an audio file to view your real acoustic signals:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-left pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] text-[#575A60] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Tone & Prosody</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] text-[#575A60] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Estimated Emotion</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] text-[#575A60] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Speaking Pace (WPM)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] text-[#575A60] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Clarity & Loudness</span>
            </div>
          </div>

          <p className="text-[11px] text-[#8C8983] italic pt-2">
            Your analysis will appear here.
          </p>
        </div>
      </div>
    );
  }

  // 2. Populated Result State
  const paceDelta =
    baseline && baseline.hasBaseline
      ? analysis.wordsPerMinute - baseline.averagePaceWpm
      : null;

  return (
    <div className="p-6 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs space-y-5">
      {/* Header with AI or Demo Badge */}
      <div className="flex items-center justify-between border-b border-[#F4F1EA] pb-3">
        <div>
          <h2 className="text-sm font-bold text-[#15171A] tracking-tight">
            Voice Metrics
          </h2>
          <span className="text-[10px] text-[#8C8983]">
            {new Date(analysis.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border ${
            analysis.isDemo
              ? "bg-[#F4F1EA] text-[#575A60] border-[#DDD8CD]"
              : "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
          }`}
        >
          <Sparkles size={11} className={analysis.isDemo ? "text-[#707582]" : "text-[#10B981]"} />
          <span>{analysis.isDemo ? "Demo Insight" : "AI Analyzed"}</span>
        </span>
      </div>

      {/* Metrics List */}
      <div className="space-y-3.5 text-xs divide-y divide-[#F4F1EA]">
        {/* Primary Emotion */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[#707582] block font-medium">Primary Emotion</span>
            <span className="text-[10px] text-[#8C8983]">
              {analysis.emotionSubtitle || `Estimated signal: ${analysis.primaryEmotionConfidence}%`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#15171A] text-sm">
              {analysis.primaryEmotion}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] font-mono text-xs font-bold border border-[#A7F3D0]/50">
              {analysis.primaryEmotionConfidence}%
            </span>
          </div>
        </div>

        {/* Tone */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <span className="text-[#707582] font-medium block">Tone</span>
            {analysis.toneDescriptors && analysis.toneDescriptors.length > 0 && (
              <span className="text-[10px] text-[#8C8983]">
                {analysis.toneDescriptors.slice(0, 2).join(", ")}
              </span>
            )}
          </div>
          <span className="font-semibold text-[#15171A]">
            {analysis.tone}
          </span>
        </div>

        {/* Energy with Visual Indicator */}
        <div className="space-y-1.5 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[#707582] font-medium">Energy</span>
            <span className="font-semibold text-[#15171A]">
              {analysis.energy} ({analysis.energyScore}/100)
            </span>
          </div>
          {/* Low ─── Medium ─── High slider */}
          <div className="relative pt-1 pb-2">
            <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#15171A] rounded-full transition-all duration-500"
                style={{
                  width:
                    analysis.energy === "Low"
                      ? "25%"
                      : analysis.energy === "Medium"
                      ? "65%"
                      : "95%",
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#8C8983] mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Pace */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <span className="text-[#707582] font-medium block">Pace</span>
            {paceDelta !== null && (
              <span className="text-[10px] text-[#8C8983]">
                Your typical: {baseline?.averagePaceWpm} WPM (
                {paceDelta >= 0 ? `+${paceDelta}` : paceDelta} WPM)
              </span>
            )}
          </div>
          <span className="font-semibold font-mono text-[#15171A]">
            {analysis.wordsPerMinute} WPM
          </span>
        </div>

        {/* Clarity */}
        <div className="flex items-center justify-between pt-3">
          <span className="text-[#707582] font-medium">Clarity</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#15171A]">
              {analysis.clarityRating}
            </span>
            <span className="text-[11px] font-mono text-[#707582]">
              ({analysis.clarity}%)
            </span>
          </div>
        </div>

        {/* Loudness */}
        <div className="flex items-center justify-between pt-3">
          <span className="text-[#707582] font-medium">Loudness</span>
          <span className="font-mono font-semibold text-[#15171A]">
            {analysis.loudness}
          </span>
        </div>

        {/* Pitch */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <span className="text-[#707582] font-medium block">Average Pitch</span>
            <span className="text-[10px] text-[#8C8983]">
              Variation: {analysis.pitchVariation}
            </span>
          </div>
          <span className="font-mono font-semibold text-[#15171A]">
            {analysis.pitchHz} Hz
          </span>
        </div>

        {/* Pause Frequency */}
        <div className="flex items-center justify-between pt-3">
          <span className="text-[#707582] font-medium">Pause Frequency</span>
          <span className="font-mono font-semibold text-[#15171A]">
            {analysis.pauseFrequency} pauses/min
          </span>
        </div>

        {/* Signal Quality & AI Confidence split badges */}
        <div className="pt-3 grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1]">
            <span className="text-[9px] uppercase font-mono text-[#8C8983] block">
              Signal Quality
            </span>
            <span className="font-bold text-[#059669] font-mono text-xs">
              {analysis.signalQualityScore}%
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1]">
            <span className="text-[9px] uppercase font-mono text-[#8C8983] block">
              AI Confidence
            </span>
            <span className="font-bold text-[#15171A] font-mono text-xs">
              {analysis.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer CTA: View Detailed Analysis */}
      <div className="pt-2 border-t border-[#E6E2D8]">
        <button
          type="button"
          onClick={() => {
            if (onViewDetails) onViewDetails();
            else if (onNavigate) onNavigate("/analytics");
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
        >
          <span>View Detailed Analysis</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
