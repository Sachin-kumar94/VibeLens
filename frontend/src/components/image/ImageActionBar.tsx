import React, { useState } from "react";
import {
  Sparkles,
  Hash,
  Music,
  Globe,
  Download,
  Share2,
  Trash2,
  RefreshCw,
  Check,
  FileText,
  Copy,
} from "lucide-react";
import { ImageAnalysisData } from "../../services/imageAnalysisApi";

interface ImageActionBarProps {
  analysis: ImageAnalysisData;
  onOpenCaptions: () => void;
  onOpenHashtags: () => void;
  onOpenMusic: () => void;
  onOpenTranslate: () => void;
  onAnalyzeAnother: () => void;
  onDelete: () => void;
  onNavigate?: (path: string) => void;
}

export const ImageActionBar: React.FC<ImageActionBarProps> = ({
  analysis,
  onOpenCaptions,
  onOpenHashtags,
  onOpenMusic,
  onOpenTranslate,
  onAnalyzeAnother,
  onDelete,
  onNavigate,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sharedCopied, setSharedCopied] = useState(false);

  const handleShare = () => {
    const summary = `VibeLens Visual Signal Analysis:
• Primary Emotion: ${analysis.primaryEmotion} (${analysis.primaryEmotionConfidence}%)
• Vibe: ${analysis.vibe} (${analysis.vibeConfidence}%)
• Scene: ${analysis.scene}
• Color Tone: ${analysis.colorTone}
• Observed Evidence: "${analysis.evidence.expression}"
• Analyzed with VibeLens Human Insights.`;

    navigator.clipboard.writeText(summary);
    setSharedCopied(true);
    setTimeout(() => setSharedCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `vibelens-analysis-${analysis.id || "report"}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  };

  const handlePrintPDF = () => {
    setShowExportMenu(false);
    window.print();
  };

  return (
    <div className="space-y-4 select-none">
      {/* 4 Bottom Signal Content Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={onOpenCaptions}
          className="p-3 rounded-2xl bg-white border border-[#DDD8CD] hover:border-[#17191A] text-[#17191A] text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer hover:shadow-xs"
        >
          <Sparkles size={14} className="text-[#A97858]" />
          <span>Generate Captions</span>
        </button>

        <button
          type="button"
          onClick={onOpenHashtags}
          className="p-3 rounded-2xl bg-white border border-[#DDD8CD] hover:border-[#17191A] text-[#17191A] text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer hover:shadow-xs"
        >
          <Hash size={14} className="text-[#30483E]" />
          <span>Get Hashtags</span>
        </button>

        <button
          type="button"
          onClick={onOpenMusic}
          className="p-3 rounded-2xl bg-white border border-[#DDD8CD] hover:border-[#17191A] text-[#17191A] text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer hover:shadow-xs"
        >
          <Music size={14} className="text-[#756B91]" />
          <span>Suggest Music</span>
        </button>

        <button
          type="button"
          onClick={onOpenTranslate}
          className="p-3 rounded-2xl bg-white border border-[#DDD8CD] hover:border-[#17191A] text-[#17191A] text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer hover:shadow-xs"
        >
          <Globe size={14} className="text-[#78909B]" />
          <span>Translate</span>
        </button>
      </div>

      {/* Utility Actions Bar: Export, Share, Compare, Delete, Analyze Another */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDD8CD]/60">
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-1.5 rounded-full border border-[#DDD8CD] hover:border-[#17191A] bg-white text-[#17191A] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download size={13} />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-44 rounded-2xl bg-white border border-[#DDD8CD] shadow-lg p-1.5 z-30 space-y-1 animate-fadeIn text-xs">
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-[#17191A] flex items-center gap-2 cursor-pointer"
                >
                  <FileText size={13} />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-[#17191A] flex items-center gap-2 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-full border border-[#DDD8CD] hover:border-[#17191A] bg-white text-[#17191A] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            {sharedCopied ? <Check size={13} className="text-[#30483E]" /> : <Share2 size={13} />}
            <span>{sharedCopied ? "Summary Copied!" : "Share"}</span>
          </button>

          {/* Compare Button */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("/compare")}
              className="px-3.5 py-1.5 rounded-full border border-[#DDD8CD] hover:border-[#17191A] bg-white text-[#17191A] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Compare Sessions</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Analyze Another Button */}
          <button
            type="button"
            onClick={onAnalyzeAnother}
            className="px-4 py-1.5 rounded-full bg-[#17191A] hover:bg-[#2C302E] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <RefreshCw size={12} />
            <span>Analyze Another</span>
          </button>

          {/* Delete Button */}
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-full text-[#858881] hover:text-[#C23B22] hover:bg-[#FDF2F0] transition cursor-pointer"
              title="Delete Analysis"
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className="text-[11px] text-[#C23B22] font-semibold">Confirm delete?</span>
              <button
                type="button"
                onClick={onDelete}
                className="px-2.5 py-1 rounded-lg bg-[#C23B22] text-white text-[11px] font-semibold cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 rounded-lg bg-white border border-[#DDD8CD] text-[11px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
