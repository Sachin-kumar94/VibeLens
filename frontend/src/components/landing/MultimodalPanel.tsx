import React from "react";
import { Layers, ArrowDown, Check } from "lucide-react";

export const MultimodalPanel: React.FC = () => {
  const inputPanels = [
    {
      title: "Visual Signal",
      label: "IMAGE",
      sample: "Gentle eye crinkles, relaxed brow",
      weight: "28% weight",
      tone: "Positive affect",
    },
    {
      title: "Acoustic Signal",
      label: "VOICE",
      sample: "Harmonic 210Hz resonance, 142 WPM",
      weight: "32% weight",
      tone: "Calm & steady",
    },
    {
      title: "Kinesic Signal",
      label: "BODY",
      sample: "88° upright alignment, 5° forward lean",
      weight: "24% weight",
      tone: "Attentive posture",
    },
    {
      title: "Contextual Signal",
      label: "CONTEXT",
      sample: "Quiet indoor room, daylight, 1-on-1 dialogue",
      weight: "16% weight",
      tone: "Supportive space",
    },
  ];

  return (
    <section className="py-24 bg-[#F7F4EE] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            Synthesized with restraint.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            Four physical data channels converge into a singular, grounded human reading.
            No theatrical animations—just clear, readable synthesis.
          </p>
        </div>

        {/* 4 Physical-Looking Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {inputPanels.map((panel) => (
            <div
              key={panel.label}
              className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-xl p-6 shadow-[0_2px_8px_rgba(21,23,26,0.03)] flex flex-col justify-between h-[180px]"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8983] border-b border-[#F7F4EE] pb-2 mb-3">
                  <span className="font-bold text-[#15171A]">{panel.label}</span>
                  <span>{panel.weight}</span>
                </div>
                <div className="font-serif text-lg text-[#15171A]">{panel.title}</div>
                <p className="text-xs text-[#8C8983] mt-2 leading-relaxed">
                  {panel.sample}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#708C74]">
                <Check size={12} />
                <span>{panel.tone}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Convergence Indicator */}
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <div className="w-[1px] h-8 bg-[#DDD7CB]" />
          <div className="w-2 h-2 rounded-full bg-[#15171A]" />
        </div>

        {/* Central Insight Block (Pure Typography & Whitespace) */}
        <div className="max-w-3xl mx-auto bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 sm:p-12 shadow-[0_4px_20px_rgba(21,23,26,0.04)] text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F1E8] border border-[#DDD7CB] text-[11px] font-mono text-[#15171A]">
            <span>Synthesis Outcome</span>
          </div>

          <blockquote className="font-serif text-3xl sm:text-4xl text-[#15171A] leading-snug tracking-tight">
            “Signals suggest a calm, engaged moment.”
          </blockquote>

          <p className="text-sm text-[#8C8983] max-w-lg mx-auto leading-relaxed">
            Visual openness and melodic vocal pacing show strong mutual alignment.
            Estimated signal concordance is 92%.
          </p>
        </div>

      </div>
    </section>
  );
};
