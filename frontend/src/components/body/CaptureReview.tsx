import React from "react";
import { RotateCcw, Sparkles, Check, FileText, Image as ImageIcon } from "lucide-react";
import { CapturedPortrait } from "../../hooks/useCamera";

interface CaptureReviewProps {
  capture: CapturedPortrait;
  isAnalyzing: boolean;
  onRetake: () => void;
  onAnalyze: () => void;
}

export const CaptureReview: React.FC<CaptureReviewProps> = ({
  capture,
  isAnalyzing,
  onRetake,
  onAnalyze,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      {/* 9:16 Portrait Image Preview Card */}
      <div className="relative mx-auto w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#121316] border border-[#DDD8CD] shadow-sm">
        <img
          src={capture.url}
          alt="Captured Portrait"
          className="w-full h-full object-cover"
        />

        {/* Framing Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white flex items-center gap-1.5">
          <ImageIcon size={12} className="text-emerald-400" />
          <span>9:16 Portrait</span>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-medium text-[#15171A] block truncate max-w-[200px]" title={capture.fileName}>
            {capture.fileName}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-[#707582] font-mono">
            <span>{capture.width} × {capture.height}</span>
            <span>•</span>
            <span>{formatSize(capture.sizeBytes)}</span>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
          <Check size={12} />
          <span>Frame Validated</span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onRetake}
          disabled={isAnalyzing}
          className="px-4 py-2.5 rounded-xl border border-[#DDD8CD] hover:bg-[#F4F1EA] text-xs font-semibold text-[#15171A] transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <RotateCcw size={14} />
          <span>Retake Photo</span>
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#2A2E39] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
        >
          <Sparkles size={14} className="text-emerald-400" />
          <span>{isAnalyzing ? "Analyzing Signals..." : "Analyze Body Language"}</span>
        </button>
      </div>
    </div>
  );
};
