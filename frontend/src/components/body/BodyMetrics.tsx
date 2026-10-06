import React from "react";
import {
  Activity,
  Eye,
  Hand,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
} from "lucide-react";
import { BodyAnalysisResponse } from "../../services/bodyAnalysisApi";

interface BodyMetricsProps {
  analysis: BodyAnalysisResponse | null;
  onViewDetails?: () => void;
}

export const BodyMetrics: React.FC<BodyMetricsProps> = ({ analysis, onViewDetails }) => {
  if (!analysis) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-[#15171A]">Body Analysis Result</h3>
        <p className="text-xs text-[#707582]">
          No body analysis yet. Start a camera session or upload a portrait photo to explore your observable movement signals.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white border border-[#E6E2D8] shadow-2xs space-y-6">
      {/* Header & Status */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#707582] uppercase tracking-wider block">
            Observable Kinesic Signals
          </span>
          <h3 className="text-base font-bold text-[#15171A]">
            {analysis.title}
          </h3>
        </div>

        {analysis.isDemo && (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-semibold">
            Studio Demo
          </span>
        )}
      </div>

      {/* Primary Metrics List */}
      <div className="space-y-3.5">
        {/* Posture Alignment */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-emerald-600 shrink-0" />
              <span className="font-semibold text-[#15171A]">Posture Alignment</span>
              <div className="group relative cursor-pointer" title="An estimate derived from observed bi-acromial shoulder and spinal alignment.">
                <Info size={11} className="text-[#8C8983]" />
              </div>
            </div>
            <span className="font-mono font-semibold text-emerald-700">
              {analysis.posture.score}/100
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#707582]">
            <span>{analysis.posture.state}</span>
            <span>{analysis.posture.alignment}</span>
          </div>
        </div>

        {/* Eye Gaze Contact */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-blue-600 shrink-0" />
              <span className="font-semibold text-[#15171A]">Gaze Orientation</span>
              <div className="group relative cursor-pointer" title="Estimated gaze direction based on facial and eye landmark orientation.">
                <Info size={11} className="text-[#8C8983]" />
              </div>
            </div>
            <span className="font-mono font-semibold text-blue-700">
              {analysis.gaze.score}/100
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#707582]">
            <span>Direction: {analysis.gaze.direction}</span>
            <span>Signal: {analysis.gaze.quality}</span>
          </div>
        </div>

        {/* Gestures */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Hand size={14} className="text-indigo-600 shrink-0" />
              <span className="font-semibold text-[#15171A]">Gesture Expression</span>
              <div className="group relative cursor-pointer" title="Observable hand and wrist positioning relative to upper torso.">
                <Info size={11} className="text-[#8C8983]" />
              </div>
            </div>
            <span className="font-mono font-semibold text-indigo-700">
              {analysis.gestures.openness}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#707582]">
            <span>Activity: {analysis.gestures.activity}</span>
            <span>{analysis.gestures.spanRating}</span>
          </div>
        </div>

        {/* Engagement Estimate */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-600 shrink-0" />
              <span className="font-semibold text-[#15171A]">Estimated Engagement</span>
              <div className="group relative cursor-pointer" title="Derived strictly from observed gaze stability, posture presence, and framing.">
                <Info size={11} className="text-[#8C8983]" />
              </div>
            </div>
            <span className="font-mono font-semibold text-amber-700">
              {analysis.engagement.score}/100
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#707582]">
            <span>Level: {analysis.engagement.level}</span>
            <span>{analysis.engagement.presenceDescriptor}</span>
          </div>
        </div>

        {/* Movement Stability */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-600 shrink-0" />
              <span className="font-semibold text-[#15171A]">Movement Stability</span>
              <div className="group relative cursor-pointer" title="Physical steadiness and low lateral skeletal jitter.">
                <Info size={11} className="text-[#8C8983]" />
              </div>
            </div>
            <span className="font-mono font-semibold text-emerald-700">
              {analysis.movementStability.stability}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#707582]">
            <span>Rating: {analysis.movementStability.jitterRating}</span>
            <span>{analysis.movementStability.score}/100</span>
          </div>
        </div>
      </div>

      {/* Strict Metric Separation: Model Confidence vs Signal Quality */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#707582]">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span className="font-medium">Model Confidence</span>
          </div>
          <span className="text-base font-bold font-mono text-[#15171A]">
            {analysis.confidence}%
          </span>
          <span className="text-[10px] text-[#8C8983] block">
            33-point tracking confidence
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#707582]">
            <CheckCircle2 size={12} className="text-blue-600" />
            <span className="font-medium">Signal Quality</span>
          </div>
          <span className="text-base font-bold font-mono text-[#15171A]">
            {analysis.signalQuality.score}%
          </span>
          <span className="text-[10px] text-[#8C8983] block">
            {analysis.signalQuality.framing}
          </span>
        </div>
      </div>

      {/* Detailed Analysis Slide-over Trigger */}
      {onViewDetails && (
        <button
          type="button"
          onClick={onViewDetails}
          className="w-full py-2.5 rounded-xl bg-[#F4F1EA] hover:bg-[#EFEAE1] border border-[#DDD8CD] text-xs font-semibold text-[#15171A] transition cursor-pointer text-center"
        >
          View Full Evidence & Presentation Coach
        </button>
      )}
    </div>
  );
};
