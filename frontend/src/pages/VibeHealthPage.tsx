import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  Shield,
  Sparkles,
  CheckCircle2,
  Wind,
  Info,
  Clock,
  ArrowRight
} from "lucide-react";

interface VibeHealthPageProps {
  onNavigate: (path: string) => void;
}

export const VibeHealthPage: React.FC<VibeHealthPageProps> = ({ onNavigate }) => {
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathTimer, setBreathTimer] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev > 1) return prev - 1;
        if (breathPhase === "Inhale") {
          setBreathPhase("Hold");
          return 4;
        } else if (breathPhase === "Hold") {
          setBreathPhase("Exhale");
          return 4;
        } else {
          setBreathPhase("Inhale");
          return 4;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathPhase]);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#DDD7CB] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#748D76]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C8983]">
              Equilibrium Reflection Mirror
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#15171A] tracking-tight">
            Vibe Health & Equilibrium
          </h1>
          <p className="text-sm sm:text-base text-[#575A60] mt-2 max-w-xl">
            A calm mirror summarizing bodily tension, acoustic resonance, and overall composure without clinical pathologizing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#748D76]/15 text-[#748D76] border border-[#748D76]/30 text-xs font-mono font-semibold">
            EQUILIBRIUM: 91 / 100
          </span>
        </div>
      </div>

      {/* 3 Equilibrium Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-3 shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-[#8C8983] block">
            Physical Somatic Ease
          </span>
          <div className="font-serif text-3xl font-bold text-[#15171A]">93% Relaxed</div>
          <p className="text-xs text-[#575A60] leading-relaxed">
            Zero jaw masseter clenching; shoulders rest 2.5 inches below ears without defensive hunching.
          </p>
          <div className="pt-2 border-t border-[#DDD7CB]/60 text-[11px] font-mono text-[#748D76]">
            Optimal Somatic Balance
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-3 shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-[#8C8983] block">
            Acoustic Resonance
          </span>
          <div className="font-serif text-3xl font-bold text-[#71889C]">88% Resonant</div>
          <p className="text-xs text-[#575A60] leading-relaxed">
            Spoken cadence averages 140 WPM with natural diaphragmatic pauses; no hurried breathlessness.
          </p>
          <div className="pt-2 border-t border-[#DDD7CB]/60 text-[11px] font-mono text-[#71889C]">
            Steady Vocal Envelope
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-3 shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-[#8C8983] block">
            Cognitive Presence
          </span>
          <div className="font-serif text-3xl font-bold text-[#748D76]">94% Centered</div>
          <p className="text-xs text-[#575A60] leading-relaxed">
            Gaze stability maintained across 3–4 second intervals without restless visual scanning.
          </p>
          <div className="pt-2 border-t border-[#DDD7CB]/60 text-[11px] font-mono text-[#748D76]">
            High Attunement
          </div>
        </div>
      </div>

      {/* Guided Breath Practice Box */}
      <div className="p-8 rounded-3xl bg-[#EFEAE1] border border-[#DDD7CB] flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="flex items-center gap-2">
            <Wind size={18} className="text-[#15171A]" />
            <h2 className="font-serif text-2xl font-bold text-[#15171A]">
              Paced Diaphragmatic Reset
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#575A60] leading-relaxed">
            Take four cycles of box breathing to lower vocal pitch jitter and release periocular tension before your next keynote rehearsal.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#15171A]">
            <span>4s Inhale</span>
            <span>•</span>
            <span>4s Hold</span>
            <span>•</span>
            <span>4s Exhale</span>
          </div>
        </div>

        {/* Visual Breathing Bubble */}
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-[#DDD7CB] w-full md:w-64 text-center shrink-0 shadow-xs">
          <div
            className={`w-24 h-24 rounded-full border-2 border-[#15171A] flex flex-col items-center justify-center transition-all duration-1000 ${
              breathPhase === "Inhale"
                ? "scale-110 bg-[#748D76]/20"
                : breathPhase === "Hold"
                ? "scale-110 bg-[#71889C]/20"
                : "scale-90 bg-transparent"
            }`}
          >
            <span className="font-serif text-lg font-bold text-[#15171A]">{breathPhase}</span>
            <span className="font-mono text-xs text-[#8C8983]">{breathTimer}s</span>
          </div>
        </div>
      </div>

      {/* Mandatory Non-Medical Philosophical Disclaimer */}
      <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-[#DDD7CB]">
          <Shield size={16} className="text-[#C48A66]" />
          <h3 className="font-mono text-xs uppercase font-bold text-[#15171A]">
            Responsible Non-Medical Wellness Disclaimer
          </h3>
        </div>
        <p className="text-xs text-[#575A60] leading-relaxed">
          Vibe Health measures physical and acoustic indicators of self-possession, thoracic posture, and communicative presence. It is strictly an observational mindfulness tool and does not provide clinical diagnoses for medical anxiety, clinical depression, cardiovascular illness, or neurological conditions. For any clinical or medical concerns, always consult a licensed healthcare professional.
        </p>
      </div>
    </div>
  );
};
