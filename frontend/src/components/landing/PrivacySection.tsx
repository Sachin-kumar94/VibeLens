import React from "react";
import { Lock, EyeOff, Trash2, KeyRound, Shield } from "lucide-react";

export const PrivacySection: React.FC = () => {
  const privacyPillars = [
    {
      icon: <KeyRound size={20} className="text-[#15171A]" />,
      title: "What is stored",
      summary: "Encrypted personal records only",
      desc: "Your historical baseline averages, journal notes, and session timestamps are saved with AES-256 local client encryption. No one else has keys to your personal reflections.",
    },
    {
      icon: <EyeOff size={20} className="text-[#6D8192]" />,
      title: "What is analyzed",
      summary: "Transient geometry, not identity",
      desc: "VibeLens processes facial mesh geometry and vocal acoustics strictly to compute real-time signal ratios. We never perform face-recognition searches or build demographic advertising profiles.",
    },
    {
      icon: <Trash2 size={20} className="text-[#C88A63]" />,
      title: "What is deleted",
      summary: "Ephemeral audio & video buffers",
      desc: "Live camera feeds and voice audio buffers are analyzed in transient memory and automatically purged immediately after the reading completes.",
    },
    {
      icon: <Lock size={20} className="text-[#708C74]" />,
      title: "How you control your data",
      summary: "Complete export and one-click erase",
      desc: "You have total sovereignty. Export your complete journal and signal history as clean JSON or markdown, or wipe all records permanently with a single click.",
    },
  ];

  return (
    <section className="py-24 bg-[#F7F4EE] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            Human dignity by design.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            Observation without surveillance. We believe a tool for human understanding
            must hold user privacy as its most sacred ethical foundation.
          </p>
        </div>

        {/* 4 Clear Privacy Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {privacyPillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-7 shadow-[0_1px_4px_rgba(21,23,26,0.02)] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F1E8] border border-[#DDD7CB] flex items-center justify-center">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#15171A]">
                    {pillar.title}
                  </h3>
                  <div className="text-[11px] font-mono text-[#708C74] font-medium mt-0.5">
                    {pillar.summary}
                  </div>
                </div>
                <p className="text-xs text-[#8C8983] leading-relaxed pt-1">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F7F4EE] text-[10px] font-mono text-[#8C8983]">
                Zero third-party model training
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
