import React from "react";
import { Camera, Volume2, UserCheck, Compass, Sparkles, ArrowRight } from "lucide-react";

export const HorizontalStory: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Image",
      tag: "Visual Signal",
      desc: "Facial expressions, micro-smiles, and eye crinkles reveal genuine warmth.",
      color: "#15171A",
      bg: "#FFFFFF",
    },
    {
      num: "02",
      title: "Voice",
      tag: "Acoustic Signal",
      desc: "Pitch stability, pacing, and resonance expose calmness or latent tension.",
      color: "#6D8192",
      bg: "#FFFFFF",
    },
    {
      num: "03",
      title: "Body",
      tag: "Kinesic Signal",
      desc: "Shoulder openness and torso orientation signal receptivity and attention.",
      color: "#708C74",
      bg: "#FFFFFF",
    },
    {
      num: "04",
      title: "Context",
      tag: "Environmental",
      desc: "Ambient daylight, acoustic space, and social setting frame the interaction.",
      color: "#C88A63",
      bg: "#FFFFFF",
    },
    {
      num: "05",
      title: "Vibe",
      tag: "Multimodal Synthesis",
      desc: "A singular, holistic interpretation of what the moment truly feels like.",
      color: "#7566A8",
      bg: "#F5F1E8",
    },
  ];

  return (
    <section className="py-24 bg-[#F5F1E8] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            One moment. <br className="hidden sm:inline" />
            Many signals.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            No single metric explains human intent. VibeLens connects multimodal
            dimensions into a single coherent narrative using quiet, thoughtful synthesis.
          </p>
        </div>

        {/* Horizontal Storytelling Sequence */}
        <div className="relative">
          {/* Thin Editorial Connecting Rule behind the cards */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-[1px] bg-[#DDD7CB] -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E6E1D6] shadow-[0_1px_4px_rgba(21,23,26,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[230px] group"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#F7F4EE] pb-3 mb-4">
                    <span className="font-mono text-xs font-bold text-[#8C8983]">
                      {step.num}
                    </span>
                    <span
                      className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded"
                      style={{ color: step.color, backgroundColor: `${step.color}15` }}
                    >
                      {step.tag}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#15171A] group-hover:text-[#25282C] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#8C8983] leading-relaxed mt-2">
                    {step.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F7F4EE] text-[11px] font-mono text-[#8C8983]">
                  <span>Step {idx + 1} of 5</span>
                  {idx < steps.length - 1 ? (
                    <ArrowRight size={12} className="text-[#DDD7CB]" />
                  ) : (
                    <span className="text-[#708C74] font-semibold">Synthesized</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
