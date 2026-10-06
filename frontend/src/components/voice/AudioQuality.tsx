import React from "react";
import { CheckCircle2, AlertTriangle, Info, Volume2, ShieldCheck } from "lucide-react";

export interface QualityMetrics {
  volume: "Low" | "Good" | "High";
  noise: "Low" | "Moderate" | "High";
  clarity: "Good" | "Fair" | "Poor";
  durationSec: number;
  speechPresence: "Detected" | "Marginal" | "Insufficient";
  signalQualityScore: number;
}

interface AudioQualityProps {
  metrics: QualityMetrics;
  onRecordAgain?: () => void;
  onUploadDifferent?: () => void;
}

export const AudioQuality: React.FC<AudioQualityProps> = ({
  metrics,
  onRecordAgain,
  onUploadDifferent,
}) => {
  const isSpeechInsufficient = metrics.speechPresence === "Insufficient";
  const isHighNoise = metrics.noise === "High";

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#E6E2D8] space-y-3.5 text-xs shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#F4F1EA] pb-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-[#15171A]">
          <ShieldCheck size={15} className="text-[#10B981]" />
          <span>Acoustic Signal Quality</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-[#707582]">Fidelity:</span>
          <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#059669] font-mono font-bold text-xs">
            {metrics.signalQualityScore}%
          </span>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1]">
          <span className="text-[10px] uppercase font-mono text-[#8C8983] block">Volume</span>
          <span
            className={`font-semibold mt-0.5 inline-block ${
              metrics.volume === "Good"
                ? "text-[#15171A]"
                : metrics.volume === "Low"
                ? "text-amber-600"
                : "text-rose-600"
            }`}
          >
            {metrics.volume === "Good" ? "Optimal" : metrics.volume}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1]">
          <span className="text-[10px] uppercase font-mono text-[#8C8983] block">Noise Level</span>
          <span
            className={`font-semibold mt-0.5 inline-block ${
              metrics.noise === "Low"
                ? "text-[#15171A]"
                : metrics.noise === "Moderate"
                ? "text-amber-600"
                : "text-rose-600"
            }`}
          >
            {metrics.noise}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1]">
          <span className="text-[10px] uppercase font-mono text-[#8C8983] block">Clarity</span>
          <span className="font-semibold text-[#15171A] mt-0.5 inline-block">
            {metrics.clarity}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1]">
          <span className="text-[10px] uppercase font-mono text-[#8C8983] block">Speech</span>
          <span
            className={`font-semibold mt-0.5 inline-block ${
              metrics.speechPresence === "Detected"
                ? "text-[#059669]"
                : "text-amber-600"
            }`}
          >
            {metrics.speechPresence}
          </span>
        </div>
      </div>

      {/* Warnings & alerts */}
      {isSpeechInsufficient && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <span>Not enough speech was detected in this recording.</span>
          </div>
          <p className="text-[11px] text-amber-800">
            For best vocal resonance measurements, record at least 3 seconds of spoken words.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {onRecordAgain && (
              <button
                type="button"
                onClick={onRecordAgain}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
              >
                Record Again
              </button>
            )}
            {onUploadDifferent && (
              <button
                type="button"
                onClick={onUploadDifferent}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
              >
                Upload Another File
              </button>
            )}
          </div>
        </div>
      )}

      {isHighNoise && !isSpeechInsufficient && (
        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
          <Info size={13} className="text-amber-600 shrink-0" />
          <span>Background noise detected. Analysis will proceed with acoustic filtering.</span>
        </div>
      )}

      {/* Important note keeping Signal Quality separate from AI Confidence */}
      <div className="flex items-start gap-1.5 text-[11px] text-[#8C8983] leading-relaxed pt-1">
        <Info size={12} className="shrink-0 mt-0.5 text-[#8C8983]" />
        <span>
          Signal Quality reflects technical acoustic clarity and microphone headroom, kept separate from AI interpretation confidence.
        </span>
      </div>
    </div>
  );
};
