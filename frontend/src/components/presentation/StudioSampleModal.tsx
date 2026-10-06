import React from "react";
import {
  X,
  Sparkles,
  Play,
  Gauge,
  Eye,
  Volume2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface StudioSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudioSampleModal: React.FC<StudioSampleModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-2xl border border-[#DDD7CB] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD7CB] bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8983]">
                Studio Sample &bull; Demo Mode
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-[#15171A]">
              Curated Keynote Rehearsal Walkthrough
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C8983] hover:text-[#15171A] hover:bg-[#FAF8F5] transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Demo Callout */}
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
            <Sparkles size={16} className="text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Isolated Studio Demonstration</span>
              This reference walkthrough demonstrates how live tempo, eye-facing availability, and pause pacing are synthesized. No sample records will pollute your account history.
            </div>
          </div>

          {/* Sample Video Preview */}
          <div className="aspect-video rounded-xl overflow-hidden border border-[#DDD7CB] relative bg-[#14161B] flex items-center justify-center shadow-sm">
            <img
              src="/assets/editorial/body-man-frontal.jpg"
              alt="Studio Presenter Sample"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>SAMPLE 03:42</span>
            </div>
            <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-mono flex items-center justify-between">
              <span>Target: 140–150 WPM</span>
              <span className="text-[#10B981]">Cadence Steady (144 WPM)</span>
            </div>
          </div>

          {/* Sample Diagnostics Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">MEASURED PACE</span>
              <span className="text-base font-bold text-[#15171A]">144 WPM</span>
              <span className="text-[10px] text-[#10B981] block mt-0.5">Within Target ✓</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">CAMERA-FACING</span>
              <span className="text-base font-bold text-[#10B981]">89%</span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Steady Orientation</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">PAUSE PROFILE</span>
              <span className="text-base font-bold text-[#15171A]">5 Pauses</span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">1.9s average</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">POSTURE</span>
              <span className="text-base font-bold text-[#10B981]">91%</span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Bilateral Balance</span>
            </div>
          </div>

          {/* Sample Coaching Tips */}
          <div className="p-4 rounded-xl bg-white border border-[#DDD7CB] space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#15171A] font-bold">
              Synthesized Coaching Takeaways
            </h4>
            <div className="space-y-2 text-xs text-[#575A60]">
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="font-bold text-[#15171A] block mb-0.5">Pacing Consistency:</span>
                Cadence maintained reliably between 142 and 146 WPM across major proposition transitions.
              </div>
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#DDD7CB]">
                <span className="font-bold text-[#15171A] block mb-0.5">Pause Punctuation:</span>
                Breath pauses followed core assertions consistently, allowing audience cognitive retention.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DDD7CB] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#15171A] hover:bg-[#252833] text-white text-xs font-semibold transition"
          >
            Close Sample Walkthrough
          </button>
        </div>
      </div>
    </div>
  );
};
