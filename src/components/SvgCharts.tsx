import React from "react";
import { AnalyticsSummary, MoodTrendPoint } from "../types";

interface SvgChartsProps {
  analytics: AnalyticsSummary;
  isDark: boolean;
}

export const SvgCharts: React.FC<SvgChartsProps> = ({ analytics, isDark }) => {
  const { weeklyTrends, emotionDistribution, vibeDistribution } = analytics;

  // Render Line Chart
  const renderWeeklyTrendLine = () => {
    if (!weeklyTrends || weeklyTrends.length === 0) return null;

    const width = 500;
    const height = 180;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find max value for scaling
    const maxVal = Math.max(
      ...weeklyTrends.map(t => Math.max(t.Happy, t.Neutral, t.Sad, t.Energetic, t.Calm, 1)),
      4
    );

    const getCoordinates = (index: number, value: number) => {
      const x = padding + (index / (weeklyTrends.length - 1)) * chartWidth;
      const y = padding + chartHeight - (value / maxVal) * chartHeight;
      return { x, y };
    };

    // Draw lines for Happy, Calm, Energetic
    const happyPoints = weeklyTrends.map((t, idx) => getCoordinates(idx, t.Happy));
    const calmPoints = weeklyTrends.map((t, idx) => getCoordinates(idx, t.Calm));
    const energeticPoints = weeklyTrends.map((t, idx) => getCoordinates(idx, t.Energetic));

    const getPathString = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return "";
      return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    };

    return (
      <div className="w-full h-full relative" id="weekly-trend-chart">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding + (i / 4) * chartHeight;
            const labelVal = Math.round(maxVal - (i / 4) * maxVal);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                  strokeDasharray="4 4"
                  id={`grid-line-${i}`}
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[9px] fill-current opacity-50 font-mono"
                  id={`grid-text-${i}`}
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Lines */}
          <path
            d={getPathString(happyPoints)}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
            id="happy-trend-path"
          />
          <path
            d={getPathString(calmPoints)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
            id="calm-trend-path"
          />
          <path
            d={getPathString(energeticPoints)}
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-[0_2px_8px_rgba(236,72,153,0.3)]"
            id="energetic-trend-path"
          />

          {/* Dots on points */}
          {weeklyTrends.map((t, idx) => {
            const hp = happyPoints[idx];
            const cp = calmPoints[idx];
            const ep = energeticPoints[idx];
            return (
              <g key={idx}>
                <circle cx={hp.x} cy={hp.y} r="4" fill="#10b981" stroke={isDark ? "#050505" : "#ffffff"} strokeWidth="1.5" />
                <circle cx={cp.x} cy={cp.y} r="4" fill="#3b82f6" stroke={isDark ? "#050505" : "#ffffff"} strokeWidth="1.5" />
                <circle cx={ep.x} cy={ep.y} r="4" fill="#ec4899" stroke={isDark ? "#050505" : "#ffffff"} strokeWidth="1.5" />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {weeklyTrends.map((t, idx) => {
            const x = padding + (idx / (weeklyTrends.length - 1)) * chartWidth;
            return (
              <text
                key={idx}
                x={x}
                y={height - padding + 16}
                textAnchor="middle"
                className="text-[10px] fill-current opacity-60 font-medium"
                id={`xaxis-text-${idx}`}
              >
                {t.date}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono opacity-85">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Happy Vibe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Calm State</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
            <span>Energetic/Party</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="svg-charts-grid">
      {/* 1. Trend analysis */}
      <div className={`p-5 rounded-2xl ${isDark ? "glass-panel" : "glass-panel-light shadow-sm"} flex flex-col`} id="trend-analysis-panel">
        <h3 className="text-sm font-semibold tracking-wide font-display mb-4 uppercase opacity-80">
          Emotional Mood Trends (Weekly)
        </h3>
        <div className="flex-1 min-h-[200px] flex items-center justify-center">
          {renderWeeklyTrendLine()}
        </div>
      </div>

      {/* 2. Distributions */}
      <div className={`p-5 rounded-2xl ${isDark ? "glass-panel" : "glass-panel-light shadow-sm"} flex flex-col`} id="distribution-analysis-panel">
        <h3 className="text-sm font-semibold tracking-wide font-display mb-4 uppercase opacity-80">
          Vibe & Emotion Distributions
        </h3>
        
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div>
            <span className="text-xs opacity-60 block mb-1.5 font-medium">Primary Emotions Encountered</span>
            <div className="space-y-2">
              {emotionDistribution.length === 0 ? (
                <div className="text-xs opacity-50 py-4">No data tracked yet.</div>
              ) : (
                emotionDistribution.slice(0, 4).map((item, idx) => {
                  const maxCount = Math.max(...emotionDistribution.map(e => e.count), 1);
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs" id={`emotion-dist-${idx}`}>
                      <span className="w-20 truncate font-semibold opacity-80">{item.name}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                      <span className="w-8 text-right font-mono font-medium opacity-60">{item.count}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs opacity-60 block mb-1.5 font-medium">Dominant Contextual Vibes</span>
            <div className="space-y-2">
              {vibeDistribution.length === 0 ? (
                <div className="text-xs opacity-50 py-4">No data tracked yet.</div>
              ) : (
                vibeDistribution.slice(0, 4).map((item, idx) => {
                  const maxCount = Math.max(...vibeDistribution.map(v => v.count), 1);
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs" id={`vibe-dist-${idx}`}>
                      <span className="w-20 truncate font-semibold opacity-80">{item.name}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                      <span className="w-8 text-right font-mono font-medium opacity-60">{item.count}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
