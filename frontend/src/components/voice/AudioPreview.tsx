import React from "react";
import { Sparkles, RotateCcw, AlertCircle, ArrowRight } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { AudioQuality, QualityMetrics } from "./AudioQuality";

interface AudioPreviewProps {
  audioUrl: string;
  audioBlob?: Blob | null;
  audioFile?: File | null;
  fileName: string;
  fileSize: number;
  duration: number;
  mimeType?: string;
  qualityMetrics: QualityMetrics | null;
  isAnalyzing: boolean;
  errorMessage?: string | null;
  onRecordAgain: () => void;
  onAnalyze: () => void;
  isUploadMode?: boolean;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  audioUrl,
  audioBlob,
  audioFile,
  fileName,
  fileSize,
  duration,
  mimeType,
  qualityMetrics,
  isAnalyzing,
  errorMessage,
  onRecordAgain,
  onAnalyze,
  isUploadMode = false,
}) => {
  const hasAudioSource = Boolean(audioBlob || audioFile || (audioUrl && fileSize > 0));

  // Determine if speech is marginal
  const isSpeechMarginal = qualityMetrics?.speechPresence === "Marginal";
  const isSpeechInsufficient = qualityMetrics?.speechPresence === "Insufficient";

  return (
    <div className="space-y-5">
      {/* Audio Player with Scrubbing, Speed, Volume, and Diagnostics */}
      <AudioPlayer
        audioUrl={audioUrl}
        audioBlob={audioBlob || audioFile}
        fileName={fileName}
        fileSize={fileSize}
        duration={duration}
        mimeType={mimeType}
        onRecordAgain={onRecordAgain}
      />

      {/* Signal Quality Inspection */}
      {qualityMetrics && (
        <AudioQuality
          metrics={qualityMetrics}
          onRecordAgain={onRecordAgain}
          onUploadDifferent={onRecordAgain}
        />
      )}

      {/* Warning if speech volume or presence is low, but audio is still playable */}
      {isSpeechInsufficient && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Low vocal volume or silence detected.</span>
            <span>
              Your recording is playable above, but speech signals may be quiet. You can still analyze this clip or record again closer to the mic.
            </span>
          </div>
        </div>
      )}

      {/* Analysis Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onRecordAgain}
          disabled={isAnalyzing}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#F4F1EA] text-xs font-semibold text-[#15171A] transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-50"
        >
          <RotateCcw size={13} />
          <span>{isUploadMode ? "Upload Another File" : "Record Again"}</span>
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing || !hasAudioSource}
          className="px-6 py-2.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!hasAudioSource ? "No usable audio file" : "Analyze voice tone & emotion"}
        >
          <Sparkles size={14} className="text-emerald-400" />
          <span>{isAnalyzing ? "Analyzing Voice Signal..." : "Analyze Voice"}</span>
          <ArrowRight size={13} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};
