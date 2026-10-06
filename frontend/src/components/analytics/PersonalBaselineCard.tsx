import React from "react";
import { Compass, ArrowUpRight, ArrowDownRight, Minus, AlertCircle, ArrowRight } from "lucide-react";

interface PersonalBaselineCardProps {
  baseline: {
    hasSufficientHistory: boolean;
    baselineConfidence: number;
    currentConfidence: number;
    deltaPp: number;
    sampleCount: number;
    message: string;
  };
  onNavigate: (path: string) => void;
}

export const PersonalBaselineCard: React.FC<PersonalBaselineCardProps> = ({
  baseline,
  onNavigate,
}) => {
  const { hasSufficientHistory, baselineConfidence, currentConfidence, deltaPp, sampleCount, message } =
    baseline;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#DDD7CB] shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-[#10B981]" />
          <h3 className="font-serif text-lg font-bold text-[#15171A]">
            Personal Composure Baseline
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#8C8983] uppercase">
          Calibration Status
        </span>
      </div>

      {!hasSufficientHistory ? (
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[#15171A]">
                Baseline Calibration In Progress
              </h4>
              <p className="text-xs text-[#575A60] mt-0.5">
                {message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("/voice")}
              className="px-4 py-2 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <span>Start an Analysis</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#8C8983] block">
              Calibrated Baseline
            </span>
            <div className="font-serif text-2xl font-bold text-[#15171A]">
              {baselineConfidence}%
            </div>
            <span className="text-[10px] text-[#707582] block">
              User target reference
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#8C8983] block">
              Current Period Average
            </span>
            <div className="font-serif text-2xl font-bold text-[#10B981]">
              {currentConfidence}%
            </div>
            <span className="text-[10px] text-[#707582] block">
              Active window score
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#8C8983] block">
              Baseline Deviation
            </span>
            <div className="flex items-center gap-1">
              {deltaPp > 0 ? (
                <ArrowUpRight size={16} className="text-[#10B981]" />
              ) : deltaPp < 0 ? (
                <ArrowDownRight size={16} className="text-rose-600" />
              ) : (
                <Minus size={16} className="text-[#8C8983]" />
              )}
              <span
                className={`font-serif text-2xl font-bold ${
                  deltaPp > 0 ? "text-[#10B981]" : deltaPp < 0 ? "text-rose-600" : "text-[#15171A]"
                }`}
              >
                {deltaPp > 0 ? `+${deltaPp} pp` : `${deltaPp} pp`}
              </span>
            </div>
            <span className="text-[10px] text-[#707582] block">
              Sample size: {sampleCount} sessions
            </span>
          </div>
        </div>
      )}

      <p className="text-[11px] text-[#8C8983]">
        {message} Baseline calibrations are continuously adapted from authenticated historical captures.
      </p>
    </div>
  );
};
