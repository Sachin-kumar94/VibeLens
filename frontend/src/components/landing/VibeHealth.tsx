import React from "react";
import { ShieldCheck, HeartPulse, Sparkles } from "lucide-react";

export const VibeHealth: React.FC = () => {
  const healthIndicators = [
    {
      label: "Emotional Balance",
      score: "86 / 100",
      status: "Harmonious",
      color: "#708C74",
      desc: "Low variance in abrupt affect swings; smooth transitions between dialogue states.",
    },
    {
      label: "Vocal Stability",
      score: "92 / 100",
      status: "Steady",
      color: "#6D8192",
      desc: "Diaphragmatic resonance present; absence of vocal cord strain or hyper-ventilation.",
    },
    {
      label: "Active Engagement",
      score: "88 / 100",
      status: "Attentive",
      color: "#7566A8",
      desc: "Consistent forward torso incline and natural reciprocal nodding patterns.",
    },
    {
      label: "Focus & Presence",
      score: "84 / 100",
      status: "Grounded",
      color: "#15171A",
      desc: "Unrushed visual attention with low eye-darting frequency in 10-minute intervals.",
    },
    {
      label: "Tension Markers",
      score: "14 / 100",
      status: "Minimal",
      color: "#C88A63",
      desc: "Relaxed jawline and low trapezius tightness detected via kinesic baseline.",
    },
  ];

  return (
    <section className="py-24 bg-[#F5F1E8] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            A calm mirror for personal wellness.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            Observation designed to foster self-compassion, not self-judgment.
            Track your inner equilibrium across peaceful longitudinal timelines.
          </p>
        </div>

        {/* Health Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {healthIndicators.map((item) => (
            <div
              key={item.label}
              className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-6 shadow-[0_1px_4px_rgba(21,23,26,0.02)] flex flex-col justify-between h-[200px]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#F7F4EE] pb-3 mb-3">
                  <span className="text-xs font-semibold text-[#15171A]">{item.label}</span>
                  <span
                    className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
                    style={{ color: item.color, backgroundColor: `${item.color}15` }}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="font-serif text-2xl text-[#15171A]">{item.score}</div>
                <p className="text-xs text-[#8C8983] mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F7F4EE] text-[10px] font-mono text-[#8C8983]">
                Baseline Consistency: Optimal
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
