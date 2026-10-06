import React from "react";
import { TrendingUp, BarChart2, Calendar, ArrowUpRight } from "lucide-react";

export const EditorialAnalytics: React.FC = () => {
  return (
    <section className="py-24 bg-[#F7F4EE] border-b border-[#E6E1D6]">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#15171A] leading-tight tracking-tight">
            Quiet trends over time.
          </h2>
          <p className="text-[#8C8983] text-base mt-4 leading-relaxed">
            Data drawn with delicate lines and generous margins.
            Understand your communication rhythms across days, weeks, and seasons.
          </p>
        </div>

        {/* 4 Clean Editorial Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Emotion Trend (Delicate Line Chart) */}
          <div className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 shadow-[0_2px_8px_rgba(21,23,26,0.02)] space-y-6">
            <div className="flex items-center justify-between border-b border-[#F7F4EE] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983]">Affect Trajectory</span>
                <h3 className="font-serif text-xl text-[#15171A]">30-Day Emotion Trajectory</h3>
              </div>
              <span className="text-xs font-mono text-[#708C74] bg-[#708C74]/10 px-2.5 py-1 rounded">
                +8% Positive Shift
              </span>
            </div>

            {/* Clean SVG Thin Line Chart */}
            <div className="h-44 w-full flex flex-col justify-end">
              <svg viewBox="0 0 500 120" className="w-full h-32 overflow-visible">
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F5F1E8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#F5F1E8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#F5F1E8" strokeWidth="1" strokeDasharray="3 3" />
                
                {/* Smooth Curve */}
                <path
                  d="M 10 90 Q 70 70 130 75 T 250 45 T 370 30 T 490 22"
                  fill="none"
                  stroke="#15171A"
                  strokeWidth="2"
                />

                {/* Subtle Data Points */}
                {[
                  { cx: 10, cy: 90 },
                  { cx: 130, cy: 75 },
                  { cx: 250, cy: 45 },
                  { cx: 370, cy: 30 },
                  { cx: 490, cy: 22 },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="3.5" fill="#FFFFFF" stroke="#15171A" strokeWidth="1.5" />
                ))}
              </svg>
              <div className="flex justify-between text-[10px] font-mono text-[#8C8983] pt-2 border-t border-[#F7F4EE]">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4 (Current)</span>
              </div>
            </div>

            <p className="text-xs text-[#8C8983] leading-relaxed">
              Steady upward trend in calm and affirmative affect markers during collaborative work.
            </p>
          </div>

          {/* Chart 2: Confidence Trend (Thin Bars) */}
          <div className="bg-[#FFFFFF] border border-[#DDD7CB] rounded-2xl p-8 shadow-[0_2px_8px_rgba(21,23,26,0.02)] space-y-6">
            <div className="flex items-center justify-between border-b border-[#F7F4EE] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8983]">Vocal Concordance</span>
                <h3 className="font-serif text-xl text-[#15171A]">Confidence & Vocal Presence</h3>
              </div>
              <span className="text-xs font-mono text-[#6D8192] bg-[#6D8192]/10 px-2.5 py-1 rounded">
                88% High Concordance
              </span>
            </div>

            {/* Thin Bar Chart */}
            <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#F7F4EE]">
              {[
                { day: "Mon", val: 68 },
                { day: "Tue", val: 74 },
                { day: "Wed", val: 82 },
                { day: "Thu", val: 79 },
                { day: "Fri", val: 88 },
                { day: "Sat", val: 85 },
                { day: "Sun", val: 91 },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-[#8C8983]">{item.val}%</span>
                  <div className="w-full bg-[#F5F1E8] rounded-xs h-24 flex items-end">
                    <div
                      className="w-full bg-[#6D8192] rounded-xs hover:bg-[#15171A] transition-colors"
                      style={{ height: `${item.val}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#8C8983]">{item.day}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#8C8983] leading-relaxed">
              Highest vocal assurance observed in presentations preceded by morning rehearsal sessions.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
