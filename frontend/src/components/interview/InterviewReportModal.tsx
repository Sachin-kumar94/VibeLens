import React from "react";
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Compass,
  Award,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Calendar,
  Bot,
} from "lucide-react";
import { InterviewReportPayload } from "../../services/interviewApi";

interface InterviewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: InterviewReportPayload | null;
  previousSessionScore?: number | null;
  onOpenStudyPlan?: () => void;
  onAskVibeLens?: () => void;
}

export const InterviewReportModal: React.FC<InterviewReportModalProps> = ({
  isOpen,
  onClose,
  report,
  previousSessionScore,
  onOpenStudyPlan,
  onAskVibeLens,
}) => {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    // Strip sensitive fields per Req 117
    const sanitized = {
      sessionId: report.sessionId,
      role: report.role,
      interviewType: report.interviewType,
      difficulty: report.difficulty,
      createdAt: report.createdAt,
      totalDurationSeconds: report.totalDurationSeconds,
      averageScore: report.averageScore,
      averageWpm: report.averageWpm,
      totalQuestionsAnswered: report.totalQuestionsAnswered,
      totalQuestionsPlanned: report.totalQuestionsPlanned,
      answers: report.answers,
      integritySummary: report.integritySummary,
      overallStrengths: report.overallStrengths,
      overallImprovements: report.overallImprovements,
      recommendedPracticePlan: report.recommendedPracticePlan,
      disclaimer: report.disclaimer,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sanitized, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vibelens-interview-report-${report.sessionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCsv = () => {
    const headers = [
      "Question",
      "Category",
      "ResponseScore",
      "StructureScore",
      "RelevanceScore",
      "ClarityScore",
      "DeliveryScore",
      "EvidenceScore",
      "DurationSeconds",
      "WPM",
      "PauseCount",
      "FillerCount",
      "CameraFacingSignal",
      "AudioQuality",
    ];

    const rows = report.answers.map((a) => [
      `"${(a.questionText || "").replace(/"/g, '""')}"`,
      `"${(a.category || "").replace(/"/g, '""')}"`,
      a.evaluation?.overallScore ?? "",
      a.evaluation?.structureScore ?? "",
      a.evaluation?.relevanceScore ?? "",
      a.evaluation?.clarityScore ?? "",
      a.evaluation?.deliveryScore ?? "",
      a.evaluation?.evidenceScore ?? "",
      a.duration ?? "",
      a.wpm ?? "",
      a.pauseCount ?? "",
      a.fillerCount ?? "",
      `"${(a.cameraFacingSignal || "N/A").replace(/"/g, '""')}"`,
      `"${(a.audioQuality || "N/A").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vibelens-interview-report-${report.sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const scoreDiff =
    previousSessionScore !== null && previousSessionScore !== undefined
      ? report.averageScore - previousSessionScore
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15171A]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F5] border border-[#DDD7CB] rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none print:bg-white">
        {/* Close Button (Hidden on Print) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-[#8C8983] hover:text-[#15171A] hover:bg-[#DDD7CB]/40 cursor-pointer print:hidden"
        >
          <X size={18} />
        </button>

        {/* Report Header */}
        <div className="border-b border-[#DDD7CB] pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#7D7971]">
              VibeLens Practice Simulation Report
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#15171A]">
            Interview Practice Summary
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#575A60] pt-1 font-mono">
            <span>Role: <strong>{report.role}</strong></span>
            <span>·</span>
            <span>Type: <strong>{report.interviewType}</strong></span>
            <span>·</span>
            <span>Difficulty: <strong>{report.difficulty}</strong></span>
            <span>·</span>
            <span>Date: {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Executive Score Card */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] text-center">
            <span className="text-[10px] font-mono text-[#7D7971] block">RESPONSE SCORE</span>
            <span className="text-3xl font-bold font-serif text-[#15171A] block mt-0.5">
              {report.averageScore}
              <span className="text-xs font-sans text-[#7D7971] font-normal"> / 100</span>
            </span>
            {scoreDiff !== null ? (
              <span
                className={`text-[10px] font-mono font-semibold ${
                  scoreDiff >= 0 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} vs prev session
              </span>
            ) : (
              <span className="text-[10px] text-[#8C8983]">Composite average</span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] text-center">
            <span className="text-[10px] font-mono text-[#7D7971] block">QUESTIONS COMPLETED</span>
            <span className="text-3xl font-bold font-serif text-[#15171A] block mt-0.5">
              {report.totalQuestionsAnswered} / {report.totalQuestionsPlanned}
            </span>
            <span className="text-[10px] text-[#8C8983]">Recorded answers</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] text-center">
            <span className="text-[10px] font-mono text-[#7D7971] block">AVERAGE CADENCE</span>
            <span className="text-3xl font-bold font-serif text-[#10B981] block mt-0.5">
              {report.averageWpm}
            </span>
            <span className="text-[10px] text-[#8C8983]">Words per minute</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] text-center">
            <span className="text-[10px] font-mono text-[#7D7971] block">TOTAL DURATION</span>
            <span className="text-3xl font-bold font-serif text-[#15171A] block mt-0.5">
              {formatDuration(report.totalDurationSeconds)}
            </span>
            <span className="text-[10px] text-[#8C8983]">Active speaking</span>
          </div>
        </div>

        {/* Detailed Question Answers Section */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#15171A] border-b border-[#DDD7CB]/70 pb-2">
            Prompt Delivery & Evidence Analysis
          </h3>

          <div className="space-y-3">
            {report.answers.map((ans, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-[#DDD7CB] space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDD7CB]/50 pb-2">
                  <span className="font-mono font-bold text-[#15171A]">
                    Q{idx + 1}: {ans.category}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-[#7D7971]">
                    <span>Duration: {ans.duration}s</span>
                    <span>Tempo: {ans.wpm} WPM</span>
                    {ans.evaluation && (
                      <span className="font-bold text-[#15171A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Score: {ans.evaluation.overallScore}
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-serif text-sm font-semibold text-[#15171A]">
                  "{ans.questionText}"
                </p>

                {ans.evaluation && (
                  <div className="space-y-2 pt-1 text-[11px]">
                    {/* Rubric Breakdown */}
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                      <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD7CB]">
                        Structure: {ans.evaluation.structureScore}
                      </span>
                      <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD7CB]">
                        Relevance: {ans.evaluation.relevanceScore}
                      </span>
                      <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD7CB]">
                        Clarity: {ans.evaluation.clarityScore}
                      </span>
                      <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD7CB]">
                        Evidence: {ans.evaluation.evidenceScore}
                      </span>
                      <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD7CB]">
                        Delivery: {ans.evaluation.deliveryScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>Strengths</span>
                        </span>
                        <ul className="space-y-1 text-[#575A60] list-disc list-inside">
                          {ans.evaluation.strengths.slice(0, 2).map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-amber-800 flex items-center gap-1">
                          <TrendingUp size={12} className="text-amber-600" />
                          <span>Improvements</span>
                        </span>
                        <ul className="space-y-1 text-[#575A60] list-disc list-inside">
                          {ans.evaluation.improvements.slice(0, 2).map((imp: string, i: number) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Distraction & Technical Integrity Signals Summary */}
        {report.integritySummary && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 text-xs">
            <div className="flex items-center gap-2 border-b border-[#DDD7CB]/60 pb-2">
              <Shield size={14} className="text-[#71889C]" />
              <span className="font-bold text-[#15171A] uppercase tracking-wider font-mono text-[11px]">
                Interview Distraction & Technical Integrity Signals
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="text-[10px] text-[#7D7971] block">MAJOR INTERRUPTIONS</span>
                <span className="font-bold text-sm text-[#15171A] mt-0.5 block">
                  {report.integritySummary.majorInterruptions}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="text-[10px] text-[#7D7971] block">FOCUS CHANGES</span>
                <span className="font-bold text-sm text-[#15171A] mt-0.5 block">
                  {report.integritySummary.focusChanges}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="text-[10px] text-[#7D7971] block">FACE VISIBILITY</span>
                <span className="font-bold text-sm text-[#15171A] mt-0.5 block">
                  {report.integritySummary.faceVisibilityPct}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="text-[10px] text-[#7D7971] block">AUDIO DISTURBANCES</span>
                <span className="font-bold text-sm text-[#15171A] mt-0.5 block">
                  {report.integritySummary.audioInterruptions}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[#8C8983] leading-relaxed pt-1">
              Note: Integrity signals track technical continuity and browser focus. They do not constitute a cheating or dishonesty score.
            </p>
          </div>
        )}

        {/* Global Actionable Next Steps */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 text-xs">
          <span className="font-bold text-[#15171A] flex items-center gap-1.5 font-mono uppercase text-[11px]">
            <Compass size={14} className="text-[#786D9D]" />
            <span>Recommended Multi-Session Practice Strategy</span>
          </span>
          <div className="space-y-1 text-[#575A60] pt-1">
            {report.recommendedPracticePlan.map((plan, i) => (
              <p key={i} className="leading-relaxed bg-[#FAF8F5] p-2.5 rounded-xl border border-[#DDD7CB]/70">
                {plan}
              </p>
            ))}
          </div>
        </div>

        {/* Central AI Intelligence Drivers */}
        {(onOpenStudyPlan || onAskVibeLens) && (
          <div className="p-4 rounded-2xl bg-linear-to-r from-[#786D9D]/10 via-[#FAF8F5] to-[#10B981]/10 border border-[#786D9D]/30 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#786D9D] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#15171A]">Personalized AI Intelligence Follow-Through</h4>
                <p className="text-[11px] text-[#575A60]">Turn this session's diagnosis into targeted daily drills and grounded explanations.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onOpenStudyPlan && (
                <button
                  type="button"
                  onClick={onOpenStudyPlan}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#786D9D] text-[#15171A] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:bg-[#FAF8F5] transition"
                >
                  <Calendar size={13} className="text-[#786D9D]" />
                  <span>7-Day Study Plan</span>
                </button>
              )}
              {onAskVibeLens && (
                <button
                  type="button"
                  onClick={onAskVibeLens}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <Bot size={13} className="text-[#10B981]" />
                  <span>Ask VibeLens</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-3.5 rounded-xl bg-white/70 border border-[#DDD7CB]/60 text-[11px] text-[#8C8983] leading-relaxed">
          {report.disclaimer}
        </div>

        {/* Action Toolbar (Hidden on Print) */}
        <div className="pt-4 border-t border-[#DDD7CB] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-[#15171A] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition hover:bg-[#FAF8F5]"
            >
              <Printer size={13} />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-[#15171A] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition hover:bg-[#FAF8F5]"
            >
              <FileSpreadsheet size={13} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-[#15171A] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition hover:bg-[#FAF8F5]"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold cursor-pointer shadow-md transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
