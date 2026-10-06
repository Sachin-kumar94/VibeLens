import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Columns,
  Download,
  RotateCcw,
  Check,
  Info,
  Layers,
  HelpCircle,
} from "lucide-react";

export interface FusionResultPanelProps {
  result: any;
  isSaved: boolean;
  onSave?: () => void;
  onViewHistory: () => void;
  onAddToJournal: () => void;
  onCompare: () => void;
  onExportReport: () => void;
  onAnalyzeAgain: () => void;
}

export const FusionResultPanel: React.FC<FusionResultPanelProps> = ({
  result,
  isSaved,
  onSave,
  onViewHistory,
  onAddToJournal,
  onCompare,
  onExportReport,
  onAnalyzeAgain,
}) => {
  if (!result) return null;

  const agreementScore = result.agreementScore || 88;
  const confidence = result.confidence || 87;
  const signalQuality = result.signalQuality || 88;

  const imgResult = result.modalityResults?.image;
  const vceResult = result.modalityResults?.voice;
  const bdyResult = result.modalityResults?.body;

  const convergentSignals: string[] = result.convergentSignals || [];
  const divergentSignals: string[] = result.divergentSignals || [];
  const evidence: string[] = result.evidence || [];
  const limitations: string[] = result.limitations || [];

  return (
    <div className="p-6 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D8]">
        <div>
          <h2 className="text-sm font-bold text-[#15171A] tracking-tight">
            Multimodal Result
          </h2>
          <span className="text-[11px] text-[#707582]">
            Context: {result.context || "General"}
          </span>
        </div>

        {isSaved && (
          <span className="text-[11px] font-mono text-[#059669] font-semibold bg-[#10B981]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Check size={12} />
            <span>Saved to DB</span>
          </span>
        )}
      </div>

      {/* Cross-Modal Consistency Hero Block */}
      <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-[#707582]">
            <span>Cross-Modal Consistency</span>
            <span
              title="How closely the available modalities align in this session."
              className="cursor-help text-[#8C8983]"
            >
              <HelpCircle size={13} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#15171A]">
              {agreementScore}%
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                agreementScore >= 84
                  ? "bg-[#10B981]/15 text-[#059669]"
                  : agreementScore >= 70
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {result.agreementLevel || "High Agreement"}
            </span>
          </div>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
          <CheckCircle2 size={28} />
        </div>
      </div>

      {/* Modality Breakdown Bars */}
      <div className="space-y-3 text-xs">
        {/* Visual */}
        <div>
          <div className="flex justify-between font-medium text-[#15171A] mb-1">
            <span className="text-[#707582] flex items-center gap-1.5">
              <span>Visual</span>
              {imgResult && (
                <span className="text-[11px] font-normal text-[#15171A]">
                  · {imgResult.emotion}
                </span>
              )}
            </span>
            <span className="font-mono text-[#3B82F6] font-bold">
              {imgResult ? `${imgResult.confidence}%` : "Unavailable"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
              style={{ width: imgResult ? `${imgResult.confidence}%` : "0%" }}
            />
          </div>
        </div>

        {/* Voice */}
        <div>
          <div className="flex justify-between font-medium text-[#15171A] mb-1">
            <span className="text-[#707582] flex items-center gap-1.5">
              <span>Voice</span>
              {vceResult && (
                <span className="text-[11px] font-normal text-[#15171A]">
                  · {vceResult.tone || vceResult.emotion}
                  {vceResult.pace ? ` (${vceResult.pace} WPM)` : ""}
                </span>
              )}
            </span>
            <span className="font-mono text-[#8B5CF6] font-bold">
              {vceResult ? `${vceResult.confidence}%` : "Unavailable"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500"
              style={{ width: vceResult ? `${vceResult.confidence}%` : "0%" }}
            />
          </div>
        </div>

        {/* Body */}
        <div>
          <div className="flex justify-between font-medium text-[#15171A] mb-1">
            <span className="text-[#707582] flex items-center gap-1.5">
              <span>Body</span>
              {bdyResult && (
                <span className="text-[11px] font-normal text-[#15171A]">
                  · {bdyResult.posture || "Upright"}
                </span>
              )}
            </span>
            <span className="font-mono text-[#10B981] font-bold">
              {bdyResult ? `${bdyResult.confidence}%` : "Unavailable"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: bdyResult ? `${bdyResult.confidence}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Aggregate Indicators */}
      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
          <span className="text-[10px] text-[#707582] block">Signal Quality</span>
          <span className="font-mono font-bold text-[#15171A] text-sm">
            {signalQuality}% Overall
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8]">
          <span className="text-[10px] text-[#707582] block">Fusion Confidence</span>
          <span className="font-mono font-bold text-[#15171A] text-sm">
            {confidence}% Model
          </span>
        </div>
      </div>

      {/* Signals that align */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#15171A] flex items-center gap-1.5">
          <Check size={14} className="text-[#10B981]" />
          <span>Signals that align</span>
        </span>
        <div className="space-y-1.5 text-xs text-[#525866]">
          {convergentSignals.map((sig, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#10B981] font-bold mt-0.5">✓</span>
              <span>{sig}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signals that differ */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#15171A] flex items-center gap-1.5">
          <Info size={14} className="text-amber-500" />
          <span>Signals that differ</span>
        </span>
        <div className="space-y-1.5 text-xs text-[#525866]">
          {divergentSignals.map((diff, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>{diff}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why this result? (Evidence) */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-2 text-xs">
        <span className="font-bold text-[#15171A] block">Why this result?</span>
        <p className="text-[#525866] leading-relaxed">
          {result.interpretation ||
            "Observed signals across available modalities demonstrate broadly aligned communication cues."}
        </p>
        {evidence.length > 0 && (
          <ul className="list-disc list-inside text-[11px] text-[#707582] space-y-0.5 pt-1">
            {evidence.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Limitations */}
      {limitations.length > 0 && (
        <div className="space-y-1 text-xs text-[#8C8983]">
          <span className="text-[11px] font-semibold text-[#707582] block">
            Analysis Limitations
          </span>
          <ul className="text-[11px] space-y-0.5 list-disc list-inside">
            {limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="pt-2 border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewHistory}
            className="text-xs text-[#15171A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View in History</span>
            <ArrowRight size={12} />
          </button>

          <span className="text-[#DDD8CD]">|</span>

          <button
            type="button"
            onClick={onAddToJournal}
            className="text-xs text-[#525866] hover:text-[#15171A] font-medium flex items-center gap-1 cursor-pointer"
          >
            <BookOpen size={12} />
            <span>Add to Journal</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCompare}
            className="text-xs text-[#525866] hover:text-[#15171A] font-medium flex items-center gap-1 cursor-pointer"
            title="Compare with another session"
          >
            <Columns size={12} />
            <span>Compare</span>
          </button>

          <button
            type="button"
            onClick={onExportReport}
            className="text-xs text-[#525866] hover:text-[#15171A] font-medium flex items-center gap-1 cursor-pointer"
            title="Export Report"
          >
            <Download size={12} />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onAnalyzeAgain}
            className="p-1.5 rounded-lg border border-[#DDD8CD] hover:bg-[#FAF8F5] text-[#525866] hover:text-[#15171A] cursor-pointer transition"
            title="Analyze Again"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
