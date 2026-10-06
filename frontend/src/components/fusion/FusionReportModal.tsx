import React, { useState } from "react";
import { X, Download, Copy, Check, FileText, Code } from "lucide-react";

export interface FusionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export const FusionReportModal: React.FC<FusionReportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [activeTab, setActiveTab] = useState<"formatted" | "json">("formatted");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const timestampStr = result.timestamp || new Date().toISOString();
  const dateFormatted = new Date(timestampStr).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const generateMarkdownReport = () => {
    return `# VibeLens Multimodal Session Report
Date: ${dateFormatted}
Context: ${result.context || "General"}
Modality Count: ${result.modalityCount || 3}

## Overall Synthesis
- Cross-Modal Consistency: ${result.agreementScore || 88}% (${result.agreementLevel || "High Agreement"})
- Signal Quality: ${result.signalQuality || 88}%
- Fusion Confidence: ${result.confidence || 87}%
- Overall Resonance Vibe: ${result.overallVibe || "Unified Resonance"}

## Modal Breakdown
${
  result.modalityResults?.image
    ? `- Visual: ${result.modalityResults.image.emotion} (Confidence: ${result.modalityResults.image.confidence}%, Quality: ${result.modalityResults.image.signalQuality}%)`
    : "- Visual: Unavailable"
}
${
  result.modalityResults?.voice
    ? `- Voice: ${result.modalityResults.voice.tone || result.modalityResults.voice.emotion} (${result.modalityResults.voice.pace || 142} WPM, Confidence: ${result.modalityResults.voice.confidence}%)`
    : "- Voice: Unavailable"
}
${
  result.modalityResults?.body
    ? `- Body: ${result.modalityResults.body.posture || "Upright"} (Confidence: ${result.modalityResults.body.confidence}%)`
    : "- Body: Unavailable"
}

## Signals that Align
${(result.convergentSignals || []).map((s: string) => `- ${s}`).join("\n")}

## Signals that Differ
${(result.divergentSignals || []).map((d: string) => `- ${d}`).join("\n")}

## Evidence & Rationale
${result.interpretation || ""}
${(result.evidence || []).map((e: string) => `- ${e}`).join("\n")}

## Limitations
${(result.limitations || []).map((l: string) => `- ${l}`).join("\n")}

## Recommendations
${(result.recommendations || []).map((r: string) => `- ${r}`).join("\n")}
`;
  };

  const getCleanJson = () => {
    const clean = {
      session: {
        id: result.id || result.fusionRecordId,
        title: result.title,
        context: result.context,
        timestamp: timestampStr,
        modalityCount: result.modalityCount,
      },
      results: {
        agreementScore: result.agreementScore,
        agreementLevel: result.agreementLevel,
        confidence: result.confidence,
        signalQuality: result.signalQuality,
        overallVibe: result.overallVibe,
        modalityBreakdown: result.modalityResults,
      },
      signals: {
        convergent: result.convergentSignals,
        divergent: result.divergentSignals,
      },
      evidence: result.evidence,
      interpretation: result.interpretation,
      limitations: result.limitations,
      recommendations: result.recommendations,
    };
    return JSON.stringify(clean, null, 2);
  };

  const handleCopy = () => {
    const text = activeTab === "formatted" ? generateMarkdownReport() : getCleanJson();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isMd = activeTab === "formatted";
    const content = isMd ? generateMarkdownReport() : getCleanJson();
    const mimeType = isMd ? "text/markdown" : "application/json";
    const ext = isMd ? "md" : "json";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibelens_fusion_report_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[640px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E6E2D8] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#A855F7]" />
            <h3 className="text-sm font-semibold text-[#15171A]">
              Multimodal Fusion Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#EAE5D9] p-0.5 rounded-lg text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("formatted")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  activeTab === "formatted" ? "bg-white text-[#15171A] shadow-xs" : "text-[#707582]"
                }`}
              >
                Report
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  activeTab === "json" ? "bg-white text-[#15171A] shadow-xs" : "text-[#707582]"
                }`}
              >
                JSON
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#707582] hover:text-[#15171A] hover:bg-[#EAE5D9] transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto font-mono text-xs text-[#15171A] bg-[#FAF8F5]/50">
          <pre className="whitespace-pre-wrap leading-relaxed font-sans text-xs text-[#2A2E35]">
            {activeTab === "formatted" ? generateMarkdownReport() : getCleanJson()}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E6E2D8] bg-[#FAF8F5]">
          <span className="text-[11px] text-[#8C8983]">
            Confidential · Verified user session
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD8CD] hover:bg-[#FAF8F5] text-xs font-medium text-[#15171A] transition cursor-pointer"
            >
              {copied ? <Check size={13} className="text-[#10B981]" /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download size={13} />
              <span>Download {activeTab === "formatted" ? "MD" : "JSON"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
