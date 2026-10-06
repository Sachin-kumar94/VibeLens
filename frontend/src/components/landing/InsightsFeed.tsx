import React from "react";
import { MessageSquare, ArrowRight, Sparkles, TrendingUp, Compass } from "lucide-react";

export const InsightsFeed: React.FC = () => {
  const insights = [
    {
      time: "Today, 11:20 AM",
      text: "Your engagement has been higher in recent morning sessions.",
      detail: "Eye contact duration increased by 18% during collaborative dialogues before noon.",
      category: "Engagement",
      color: "#708C74",
    },
    {
      time: "Yesterday, 04:45 PM",
      text: "Your speaking pace was slightly faster today, with vocal stability remaining steady.",
      detail: "Average cadence clocked at 152 WPM without rising into higher, strained pitch bands.",
      category: "Acoustics",
      color: "#6D8192",
    },
    {
      time: "Oct 11, 01:10 PM",
      text: "Visual and vocal signals were strongly aligned throughout the interview practice.",
      detail: "Smiles corresponded naturally with melodic upward vocal inflection rather than nervous masking.",
      category: "Concordance",
      color: "#C88A63",
    },
    {
      time: "Oct 08, 10:00 AM",
      text: "Noticeable drop in micro-tension markers when taking two deep breaths before answering.",
      detail: "Trapezius muscle elevation lowered by 2.4cm on camera within 5 seconds of diaphragmatic inhale.",
      category: "Kinesics",
      color: "#7566A8",
    },
  ];

  return (
    <section id="insights" className="py-24 bg-[#F5F1E8] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            Clear observations. <br />
            No algorithmic jargon.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            Quiet, human-readable sentences written to support self-awareness rather than
            flood you with hyperactive notifications.
          </p>
        </div>

        {/* Insights Feed */}
        <div className="max-w-3xl mx-auto space-y-4">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-xl p-6 shadow-[0_1px_3px_rgba(21,23,26,0.02)] hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span
                  className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold"
                  style={{ color: item.color, backgroundColor: `${item.color}15` }}
                >
                  {item.category}
                </span>
                <span className="font-mono text-[#8C8983] text-[11px]">{item.time}</span>
              </div>

              <h4 className="font-serif text-xl text-[#15171A] leading-snug mt-1">
                “{item.text}”
              </h4>

              <p className="text-xs text-[#8C8983] leading-relaxed mt-2 pt-2 border-t border-[#F7F4EE]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
