import React from "react";
import { Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Calendar, Compass, ExternalLink } from "lucide-react";
import { Modal } from "../ui/Modal";

interface InsightDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: {
    id: string;
    category: "trend" | "pattern" | "quality" | "action";
    title: string;
    observation: string;
    supportingData: string;
    sampleSize: number;
    dateRange: string;
    metric: string;
    dataStrength: "High" | "Moderate" | "Preliminary";
    limitations: string;
    recommendedAction?: {
      label: string;
      path: string;
    };
  } | null;
  onNavigate: (path: string) => void;
}

export const InsightDetailModal: React.FC<InsightDetailModalProps> = ({
  isOpen,
  onClose,
  insight,
  onNavigate,
}) => {
  if (!insight) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={insight.title}
      subtitle={`Signal Pattern Extraction // Category: ${insight.category.toUpperCase()}`}
      maxWidth="md"
    >
      <div className="space-y-5 text-xs text-[#15171A]">
        {/* Core Observation Callout */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-2">
          <div className="flex items-center gap-1.5 text-[#10B981] font-mono text-[10px] uppercase font-bold tracking-wider">
            <Compass size={13} />
            <span>Primary Signal Observation</span>
          </div>
          <p className="font-serif text-base font-bold leading-relaxed text-[#15171A]">
            "{insight.observation}"
          </p>
        </div>

        {/* Supporting Evidence Data */}
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase font-bold text-[#8C8983] tracking-wider block">
            Supporting Telemetry & Dataset
          </span>
          <div className="p-3.5 rounded-xl bg-white border border-[#DDD7CB] space-y-1 leading-relaxed text-[#575A60]">
            <p>{insight.supportingData}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2 mt-2 border-t border-[#F0EDE6] text-[11px] font-mono text-[#707582]">
              <span>Sample Size: <strong>{insight.sampleSize} sessions</strong></span>
              <span>•</span>
              <span>Metric: <strong>{insight.metric}</strong></span>
              <span>•</span>
              <span>Data Strength: <strong className="text-[#10B981]">{insight.dataStrength}</strong></span>
            </div>
          </div>
        </div>

        {/* Scientific Limitations & Guardrails */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[11px]">
            <ShieldAlert size={14} className="text-amber-700 shrink-0" />
            <span>Scientific Guardrails & Context Limitations</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {insight.limitations}
          </p>
          <p className="text-[10px] text-amber-700/80 pt-1 border-t border-amber-200/60">
            VibeLens insights describe observable acoustic and kinesic patterns and are strictly non-diagnostic.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DDD7CB]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate("/history");
            }}
            className="text-xs text-[#707582] hover:text-[#15171A] flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>View sessions in History</span>
            <ExternalLink size={12} />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-[#DDD7CB] text-xs font-medium text-[#15171A] hover:bg-[#FAF8F5] cursor-pointer"
            >
              Close
            </button>
            {insight.recommendedAction && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate(insight.recommendedAction!.path);
                }}
                className="px-4 py-2 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>{insight.recommendedAction.label}</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
