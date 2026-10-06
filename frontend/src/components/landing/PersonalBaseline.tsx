import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export const PersonalBaseline: React.FC = () => {
  const baselines = [
    {
      metric: "Confidence Index",
      avg: 82,
      today: 89,
      change: "+7",
      unit: "/ 100",
      isPositive: true,
      context: "Measured from acoustic steady-state & torso uprightness",
    },
    {
      metric: "Speech Pace",
      avg: 138,
      today: 152,
      change: "+14",
      unit: "WPM",
      isPositive: true,
      context: "Faster tempo with maintained articulate word boundary clarity",
    },
    {
      metric: "Calmness Level",
      avg: 76,
      today: 84,
      change: "+8",
      unit: "/ 100",
      isPositive: true,
      context: "Significant reduction in micro-hesitation & pitch jitter",
    },
    {
      metric: "Vocal Warmth",
      avg: 80,
      today: 85,
      change: "+5",
      unit: "/ 100",
      isPositive: true,
      context: "Rich harmonic fundamental frequency in lower register",
    },
  ];

  return (
    <section className="py-24 bg-[#F5F1E8] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            How you compare with yourself.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            Not compared to arbitrary stereotypes or general crowds.
            VibeLens compares today’s authentic moment with your own recorded historical baseline.
          </p>
        </div>

        {/* Clean Editorial Comparison Table */}
        <div className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(21,23,26,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6E1D6] bg-[#FAF8F5] text-[11px] font-mono uppercase tracking-wider text-[#8C8983]">
                  <th className="py-4 px-6 sm:px-8 font-medium">Dimension</th>
                  <th className="py-4 px-6 font-medium">Your 30-Day Avg</th>
                  <th className="py-4 px-6 font-medium">Today's Session</th>
                  <th className="py-4 px-6 font-medium">Delta Change</th>
                  <th className="py-4 px-6 sm:px-8 font-medium hidden md:table-cell">Contextual Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D6]">
                {baselines.map((row) => (
                  <tr key={row.metric} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-5 px-6 sm:px-8 font-medium text-sm text-[#15171A]">
                      {row.metric}
                    </td>
                    <td className="py-5 px-6 font-mono text-sm text-[#8C8983]">
                      {row.avg} <span className="text-[11px] font-normal">{row.unit}</span>
                    </td>
                    <td className="py-5 px-6 font-mono text-sm font-semibold text-[#15171A]">
                      {row.today} <span className="text-[11px] font-normal text-[#8C8983]">{row.unit}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#708C74]/12 text-[#708C74] font-mono text-xs font-semibold">
                        <ArrowUpRight size={13} />
                        {row.change}
                      </span>
                    </td>
                    <td className="py-5 px-6 sm:px-8 text-xs text-[#8C8983] hidden md:table-cell">
                      {row.context}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
