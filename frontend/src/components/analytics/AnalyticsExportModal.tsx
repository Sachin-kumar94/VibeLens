import React, { useState } from "react";
import { Download, FileText, Code2, Printer, Copy, Check } from "lucide-react";
import { Modal } from "../ui/Modal";
import { analyticsApi, AnalyticsResponseData } from "../../services/analyticsApi";

interface AnalyticsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalyticsResponseData | null;
}

export const AnalyticsExportModal: React.FC<AnalyticsExportModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [format, setFormat] = useState<"report" | "csv" | "json">("report");
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { summary, trends, emotionDistribution, modalityDistribution, signalQuality, insights, baseline, metadata } = data;

  const generateMarkdownReport = () => {
    return `# VibeLens Personal Signal Analytics & Intelligence Report
Generated: ${new Date().toLocaleString()}
Period: ${metadata.range.toUpperCase()} (${metadata.from.split("T")[0]} to ${metadata.to.split("T")[0]})

## 1. Key Performance Indicators
- **Total Analyses**: ${summary.totalAnalyses} (${summary.totalAnalysesDelta >= 0 ? `+${summary.totalAnalysesDelta}` : summary.totalAnalysesDelta} vs previous period)
- **Average Confidence**: ${summary.averageConfidence !== null ? `${summary.averageConfidence}%` : "Not enough data"} (${summary.confidenceDelta >= 0 ? `+${summary.confidenceDelta} pp` : `${summary.confidenceDelta} pp`} vs previous period)
- **Top Dominant Emotion**: ${summary.topEmotion} (${summary.topEmotionPercentage}% of sessions)
- **Top Observed Vibe**: ${summary.topVibe} (${summary.topVibePercentage}% of sessions)

## 2. Signal Progression Trajectory
- **Active Metric**: ${trends.activeMetric}
- **Trajectory Assessment**: ${trends.trajectory} (${trends.trajectoryDelta >= 0 ? `+${trends.trajectoryDelta}` : trends.trajectoryDelta} points over window)
- **Sample Datapoints**: ${trends.points.length} sessions

## 3. Emotion Distribution
${emotionDistribution.map((e) => `- **${e.emotion}**: ${e.percentage}% (${e.count} sessions)`).join("\n") || "- None"}

## 4. Modality Mix & Performance
${modalityDistribution.mix
  .map(
    (m) =>
      `- **${m.type.toUpperCase()}**: ${m.count} sessions (${m.percentage}%) | Avg Confidence: ${
        m.averageConfidence !== null ? `${m.averageConfidence}%` : "N/A"
      }`
  )
  .join("\n")}

## 5. Signal Quality Integrity
- **Overall Quality Score**: ${signalQuality.overallScore}% (${signalQuality.overallRating})
${Object.entries(signalQuality.byModality)
  .map(([mod, q]) => `- **${mod.toUpperCase()}**: ${q.score}% (${q.rating}, ${q.count} sessions)`)
  .join("\n")}

## 6. Personal Composure Baseline
- **Calibrated Baseline**: ${baseline.baselineConfidence}%
- **Current Window Reading**: ${baseline.currentConfidence}% (${baseline.deltaPp >= 0 ? `+${baseline.deltaPp} pp` : `${baseline.deltaPp} pp`})
- **Status**: ${baseline.message}

## 7. Synthesized Dynamic Insights
${insights
  .map(
    (ins) => `### ${ins.title} (${ins.category.toUpperCase()})
> ${ins.observation}
- Evidence: ${ins.supportingData}
- Sample Size: ${ins.sampleSize} sessions
- Guardrail: ${ins.limitations}`
  )
  .join("\n\n")}

---
*Notice: VibeLens signal calculations measure observable sensory patterns (prosody, gaze, posture) and do not evaluate clinical health, deception, or psychological character.*
`;
  };

  const handleDownload = () => {
    if (format === "csv") {
      window.location.href = analyticsApi.getExportUrl("csv");
      return;
    }

    if (format === "json") {
      window.location.href = analyticsApi.getExportUrl("json");
      return;
    }

    // Markdown / Report
    const content = generateMarkdownReport();
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibelens-analytics-${metadata.range}-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const text = format === "report" ? generateMarkdownReport() : JSON.stringify(data, null, 2);
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
      title="Export Analytics & Insights"
      subtitle="Export or copy your personal signal intelligence dataset for external tracking or archiving."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Format Selector */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFormat("report")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                format === "report"
                  ? "bg-[#15171A] text-white"
                  : "bg-[#FAF8F5] text-[#575A60] border border-[#DDD7CB]"
              }`}
            >
              <FileText size={13} />
              <span>Report (.md)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("csv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                format === "csv"
                  ? "bg-[#15171A] text-white"
                  : "bg-[#FAF8F5] text-[#575A60] border border-[#DDD7CB]"
              }`}
            >
              <Download size={13} />
              <span>Spreadsheet (.csv)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("json")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                format === "json"
                  ? "bg-[#15171A] text-white"
                  : "bg-[#FAF8F5] text-[#575A60] border border-[#DDD7CB]"
              }`}
            >
              <Code2 size={13} />
              <span>JSON (.json)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB] text-[#15171A] hover:bg-[#F2ECE1] transition cursor-pointer"
              title="Print Report"
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

        {/* Preview Box */}
        <pre className="p-4 rounded-xl bg-[#14161B] text-[#E6E2D8] font-mono text-[11px] max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
          {format === "report"
            ? generateMarkdownReport()
            : format === "json"
            ? JSON.stringify(data, null, 2)
            : `ID,Timestamp,Modality,Title,Confidence,SignalQualityScore,SignalQualityRating,Emotion,Vibe,Context\n... (${summary.totalAnalyses} user session records)`}
        </pre>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#DDD7CB]">
          <span className="text-[11px] text-[#8C8983]">
            Sanitized user-scoped telemetry. Excludes auth tokens and private secrets.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-[#DDD7CB] text-xs font-medium text-[#15171A] hover:bg-[#FAF8F5] cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download size={13} />
              <span>Download .{format === "report" ? "md" : format}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
