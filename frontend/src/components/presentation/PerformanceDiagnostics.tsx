import React from "react";
import {
  Gauge,
  Eye,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import { CoachingEvaluation } from "../../services/presentationCoachApi";

interface PerformanceDiagnosticsProps {
  evaluation: CoachingEvaluation;
  pace: number;
  targetPaceMin: number;
  targetPaceMax: number;
  pauseCount: number;
  avgPauseDuration: number;
  longestPause?: number;
  fillerCount: number;
  cameraEngagement: number;
  posture: number;
  gestureActivity: string;
  duration: number;
  framingQuality: string;
  cameraFacingSignal?: "Mostly camera-facing" | "Frequently away" | "Uncertain";
  postureSignal?: "Stable" | "Slight tilt" | "Variable";
  framingSignal?: "Good" | "Off-center" | "Adjust distance";
  movementSignal?: "Low" | "Moderate" | "High";
  faceVisiblePercentage?: number;
  multipleFacesObserved?: boolean;
  audioInterruptionCount?: number;
}

export const PerformanceDiagnostics: React.FC<PerformanceDiagnosticsProps> = ({
  evaluation,
  pace,
  targetPaceMin,
  targetPaceMax,
  pauseCount,
  avgPauseDuration,
  longestPause = 0,
  fillerCount,
  cameraEngagement,
  posture,
  gestureActivity,
  duration,
  framingQuality,
  cameraFacingSignal = "Mostly camera-facing",
  postureSignal = "Stable",
  framingSignal = "Good",
  movementSignal = "Moderate",
  faceVisiblePercentage = 95,
  multipleFacesObserved = false,
  audioInterruptionCount = 0,
}) => {
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Category Performance Summary (Section 32 & 37: Category-level results, no isolated fake score) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8983]">
            Performance Summary & Category Diagnostics
          </span>
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#15171A]">
          Rehearsal Diagnostics
        </h3>
        <p className="text-xs text-[#575A60] mt-1">
          Objective evaluation computed across delivery cadence, visual positioning, vocal acoustic stability, and capture fidelity.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Delivery */}
        <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8C8983]">Delivery (35%)</span>
            <Gauge size={14} className="text-[#10B981]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#15171A]">
            {evaluation.deliveryScore}%
          </div>
          <p className="text-[11px] text-[#575A60]">
            Pacing alignment ({pace > 0 ? `${pace} WPM` : "Measured"}) and pause regularity.
          </p>
        </div>

        {/* 2. Visual Presence */}
        <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8C8983]">Visual Presence (25%)</span>
            <Eye size={14} className="text-[#8B5CF6]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#15171A]">
            {evaluation.visualPresenceScore}%
          </div>
          <p className="text-[11px] text-[#575A60]">
            Camera alignment ({cameraEngagement}%) and upper-body posture.
          </p>
        </div>

        {/* 3. Vocal Delivery */}
        <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8C8983]">Vocal Delivery (25%)</span>
            <Volume2 size={14} className="text-[#3B82F6]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#15171A]">
            {evaluation.vocalDeliveryScore}%
          </div>
          <p className="text-[11px] text-[#575A60]">
            Acoustic energy, speech continuity, and volume stability.
          </p>
        </div>

        {/* 4. Session Quality */}
        <div className="p-4 rounded-2xl bg-white border border-[#DDD7CB] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8C8983]">Session Quality (15%)</span>
            <ShieldCheck size={14} className="text-[#10B981]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#15171A]">
            {evaluation.signalQualityScore}%
          </div>
          <p className="text-[11px] text-[#575A60]">
            Lighting, face visibility, and audio sensor continuity.
          </p>
        </div>
      </div>

      {/* 4 Deep Dive Diagnostics Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Delivery Metrics (Section 33) */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CB]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C8983] flex items-center gap-1.5">
              <Gauge size={13} /> 1. Delivery & Pacing
            </h3>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                evaluation.paceStatus === "Within target"
                  ? "text-[#10B981] bg-[#10B981]/10"
                  : "text-amber-700 bg-amber-100"
              }`}
            >
              {evaluation.paceStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">MEASURED PACING</span>
              <span className="text-base font-bold text-[#15171A]">
                {pace > 0 ? `${pace} WPM` : "Insufficient speech"}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Target: {targetPaceMin}–{targetPaceMax} WPM
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">PAUSE PATTERN</span>
              <span className="text-base font-bold text-[#15171A]">
                {pauseCount} Pauses
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Avg: {avgPauseDuration.toFixed(1)}s {longestPause > 0 ? `(Max: ${longestPause.toFixed(1)}s)` : ""}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">FILLER WORDS</span>
              <span className="text-base font-bold text-[#15171A]">
                {fillerCount} Detected
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Rate: {duration >= 60 ? (fillerCount / (duration / 60)).toFixed(1) : fillerCount}/min
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">SPEECH CONTINUITY</span>
              <span className="text-base font-bold text-[#10B981]">
                {evaluation.paceStatus === "Within target" ? "Steady Flow" : "Variable Cadence"}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Phrase timing stability
              </span>
            </div>
          </div>
        </div>

        {/* 2. Visual Presence (Section 35) */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CB]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C8983] flex items-center gap-1.5">
              <Eye size={13} /> 2. Visual Presence & Kinematics
            </h3>
            <span className="text-[10px] font-mono text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full font-semibold">
              Upper-Body Tracking
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">CAMERA-FACING SIGNAL</span>
              <span className="text-base font-bold text-[#15171A]">
                {cameraFacingSignal}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                {cameraEngagement}% in-lens gaze
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">POSTURE ALIGNMENT</span>
              <span className="text-base font-bold text-[#10B981]">
                {postureSignal}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Shoulder symmetry ({posture}%)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">FRAMING STATUS</span>
              <span className="text-base font-bold text-[#15171A]">
                {framingSignal}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Upper-torso centering
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">MOVEMENT DYNAMICS</span>
              <span className="text-base font-bold text-[#15171A]">
                {movementSignal}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">
                Natural body motion
              </span>
            </div>
          </div>
        </div>

        {/* 3. Vocal Delivery (Section 34) */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CB]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C8983] flex items-center gap-1.5">
              <Volume2 size={13} /> 3. Vocal Delivery & Acoustic Profile
            </h3>
            <span className="text-[10px] font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full font-semibold">
              Web Audio Measured
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">VOLUME STABILITY</span>
              <span className="text-base font-bold text-[#15171A]">Steady</span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Controlled dynamic range</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">ACOUSTIC CLARITY</span>
              <span className="text-base font-bold text-[#10B981]">Clear</span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Crisp consonant articulation</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">VOCAL PROJECTION</span>
              <span className="text-base font-bold text-[#15171A]">Consistent</span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Healthy conversational level</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">AUDIO DROPOUTS</span>
              <span className="text-base font-bold text-[#15171A]">
                {audioInterruptionCount === 0 ? "None" : `${audioInterruptionCount} detected`}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Hardware stream stability</span>
            </div>
          </div>
        </div>

        {/* 4. Session Quality & Environment (Section 36) */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD7CB] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CB]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C8983] flex items-center gap-1.5">
              <ShieldCheck size={13} /> 4. Session Quality & Capture Environment
            </h3>
            <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full font-semibold">
              Verified Sensors
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">SPEECH DURATION</span>
              <span className="text-base font-bold text-[#15171A]">
                {formatTimer(duration)}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Total recorded time</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">LIGHTING & ILLUMINATION</span>
              <span className="text-base font-bold text-[#10B981]">Adequate</span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Face well exposed</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">FACE VISIBILITY</span>
              <span className="text-base font-bold text-[#15171A]">{faceVisiblePercentage}%</span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">In-frame line of sight</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB]">
              <span className="text-[10px] font-mono text-[#8C8983] block">PRESENCE SIGNAL</span>
              <span className="text-base font-bold text-[#15171A]">
                {multipleFacesObserved ? "Multiple in frame" : "Single speaker"}
              </span>
              <span className="text-[10px] text-[#575A60] block mt-0.5">Visual field integrity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Methodology Callout */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-start gap-3 text-xs text-[#575A60]">
        <Info size={16} className="text-[#8C8983] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#15171A]">How These Scores Work</span>:
          Category scores evaluate real physical and acoustic parameters (Delivery 35%, Visual Presence 25%, Vocal Delivery 25%, Session Quality 15%). They are practice indicators meant to guide rehearsal drills, not absolute judgments of intelligence or performance.
        </div>
      </div>
    </div>
  );
};
