import React from "react";

export const PersonalVibe: React.FC = () => {
  const metrics = [
    { label: "Calmness", value: 84, color: "#6D8192", note: "Steady breathing & relaxed brow" },
    { label: "Energy", value: 72, color: "#C88A63", note: "Moderate, sustained vitality" },
    { label: "Confidence", value: 88, color: "#708C74", note: "Assertive vocal delivery, zero tremor" },
    { label: "Focus", value: 91, color: "#15171A", note: "Direct eye contact & sustained presence" },
    { label: "Engagement", value: 86, color: "#7566A8", note: "Active listening & affirmative nodding" },
  ];

  return (
    <section className="py-24 bg-[#F7F4EE] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            Your human baseline.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            Minimal, understated horizontal meters that let you reflect without
            cognitive overload or sensory distraction.
          </p>
        </div>

        {/* Clean Minimal Horizontal Bars & Indicators */}
        <div className="max-w-4xl mx-auto bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 sm:p-12 shadow-[0_2px_12px_rgba(21,23,26,0.03)] space-y-8">
          
          <div className="flex items-center justify-between border-b border-[#E6E1D6] pb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8C8983]">
              Affect Dimensions (Normalized 0–100)
            </span>
            <span className="text-xs font-mono text-[#708C74]">
              Composite Vibe: Grounded
            </span>
          </div>

          <div className="space-y-6">
            {metrics.map((m) => (
              <div key={m.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#15171A]">{m.label}</span>
                    <span className="text-xs text-[#8C8983] hidden sm:inline">— {m.note}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-[#15171A]">
                    {m.value}%
                  </span>
                </div>

                {/* Minimal Thin Horizontal Bar */}
                <div className="h-2 w-full bg-[#F5F1E8] rounded-full overflow-hidden border border-[#DDD7CB]/60">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${m.value}%`,
                      backgroundColor: m.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Minimal Weekly Thin Trend Line */}
          <div className="pt-6 border-t border-[#E6E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#8C8983]">
              7-Day Stability Index: <span className="font-semibold text-[#15171A]">94.2%</span> (Consistently grounded across 14 analyses)
            </div>
            <div className="flex items-center gap-1">
              {[78, 80, 82, 79, 85, 84, 88].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-4 rounded-xs bg-[#DDD7CB] hover:bg-[#15171A] transition-colors"
                    style={{ height: `${val * 0.35}px` }}
                  />
                  <span className="text-[9px] font-mono text-[#8C8983]">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
