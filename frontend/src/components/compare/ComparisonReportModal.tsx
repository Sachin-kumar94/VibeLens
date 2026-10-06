import React, { useState } from "react";
import { Download, Copy, Check, FileText, Code2, Printer } from "lucide-react";
import { Modal } from "../ui/Modal";

interface ComparisonReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export const ComparisonReportModal: React.FC<ComparisonReportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<"markdown" | "json">("markdown");

  if (!result) return null;

  const { sessionA, sessionB, summary, changes, matrix, evidence, limitations, insight } = result;

  const generateMarkdownReport = () => {
    return `# VibeLens Side-by-Side Signal Comparison Report
Generated: ${new Date().toLocaleString()}

## Session Overview
- **Moment A (Target/Current)**: ${sessionA.title} (${sessionA.type.toUpperCase()})
  - Date: ${new Date(sessionA.timestamp).toLocaleString()}
  - Context: ${sessionA.context || "Standard"}
  - Confidence: ${sessionA.confidence}%
  - Vibe: ${sessionA.vibe}
  - Signal Quality: ${sessionA.signalQuality}% (${sessionA.signalQualityRating})

- **Moment B (Baseline/Previous)**: ${sessionB.title} (${sessionB.type.toUpperCase()})
  - Date: ${new Date(sessionB.timestamp).toLocaleString()}
  - Context: ${sessionB.context || "Standard"}
  - Confidence: ${sessionB.confidence}%
  - Vibe: ${sessionB.vibe}
  - Signal Quality: ${sessionB.signalQuality}% (${sessionB.signalQualityRating})

## Comparison Summary
- **Main Change**: ${summary.mainChange}
- **Confidence Delta**: ${summary.confidenceDeltaFormatted} (${sessionB.confidence}% → ${sessionA.confidence}%)
- **Signal Quality Delta**: ${summary.signalQualityDeltaFormatted}
- **Vibe Progression**: ${summary.vibeProgression}
- **Timeline Delta**: ${summary.dateComparison}
- **Context Relation**: ${summary.contextComparison}
- **Dataset Comparability**: ${summary.comparisonQuality} (${summary.comparisonQualityExplanation})

## What Changed
### Improved / Higher
${changes.improved.map((i: any) => `- **${i.label}**: ↑ ${i.delta} (${i.detail})`).join("\n") || "- None"}

### Stable / Consistent
${changes.stable.map((i: any) => `- **${i.label}**: → ${i.delta} (${i.detail})`).join("\n") || "- None"}

### Decreased / Lower
${changes.decreased.map((i: any) => `- **${i.label}**: ↓ ${i.delta} (${i.detail})`).join("\n") || "- None"}

## Modality Matrix
| Metric | Moment B (Baseline) | Moment A (Target) | Delta |
| :--- | :--- | :--- | :--- |
${matrix.map((r: any) => `| ${r.label} | ${r.valueB} ${r.unit || ""} | ${r.valueA} ${r.unit || ""} | ${r.deltaFormatted} |`).join("\n")}

## Comparison Insight
> "${insight}"

## Supporting Evidence
${evidence.map((e: string) => `- ${e}`).join("\n")}

## Methodological Limitations
${limitations.map((l: string) => `- ${l}`).join("\n")}

---
*Notice: VibeLens signal calculations measure observable sensory patterns and do not evaluate clinical health, deception, or personality character.*
`;
  };

  const downloadReport = () => {
    let content = "";
    let filename = "";
    let mimeType = "";

    if (exportFormat === "markdown") {
      content = generateMarkdownReport();
      filename = `vibelens-comparison-${sessionA.id.slice(0, 6)}-vs-${sessionB.id.slice(0, 6)}.md`;
      mimeType = "text/markdown";
    } else {
      // Clean JSON output without sensitive tokens
      const cleanData = {
        meta: {
          exportedAt: new Date().toISOString(),
          app: "VibeLens",
        },
        sessionA: {
          id: sessionA.id,
          title: sessionA.title,
          type: sessionA.type,
          timestamp: sessionA.timestamp,
          confidence: sessionA.confidence,
          vibe: sessionA.vibe,
          signalQuality: sessionA.signalQuality,
        },
        sessionB: {
          id: sessionB.id,
          title: sessionB.title,
          type: sessionB.type,
          timestamp: sessionB.timestamp,
          confidence: sessionB.confidence,
          vibe: sessionB.vibe,
          signalQuality: sessionB.signalQuality,
        },
        summary,
        changes,
        matrix,
        evidence,
        limitations,
        insight,
      };
      content = JSON.stringify(cleanData, null, 2);
      filename = `vibelens-comparison-${sessionA.id.slice(0, 6)}-vs-${sessionB.id.slice(0, 6)}.json`;
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const text = exportFormat === "markdown" ? generateMarkdownReport() : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Comparison Report"
      subtitle="Download or copy calibrated side-by-side progression data."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Format Selector */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExportFormat("markdown")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                exportFormat === "markdown"
                  ? "bg-[#15171A] text-white"
                  : "bg-[#FAF8F5] text-[#575A60] border border-[#DDD7CB]"
              }`}
            >
              <FileText size={13} />
              <span>Markdown / Report</span>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat("json")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                exportFormat === "json"
                  ? "bg-[#15171A] text-white"
                  : "bg-[#FAF8F5] text-[#575A60] border border-[#DDD7CB]"
              }`}
            >
              <Code2 size={13} />
              <span>Structured JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] text-[#15171A] hover:bg-[#F2ECE1] transition cursor-pointer"
              title="Print Page"
            >
              <Printer size={14} />
            </button>
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] text-[#15171A] hover:bg-[#F2ECE1] transition cursor-pointer flex items-center gap-1 text-xs"
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
              <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Content Preview Box */}
        <pre className="p-4 rounded-xl bg-[#14161B] text-[#E6E2D8] font-mono text-[11px] max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
          {exportFormat === "markdown" ? generateMarkdownReport() : JSON.stringify(result, null, 2)}
        </pre>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#DDD7CB]">
          <span className="text-[11px] text-[#8C8983]">
            Sanitized document (omits auth tokens and private server keys).
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DDD7CB] text-xs font-medium text-[#15171A] hover:bg-[#FAF8F5] cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={downloadReport}
              className="px-4 py-2 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download size={13} />
              <span>Download .{exportFormat === "markdown" ? "md" : "json"}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
