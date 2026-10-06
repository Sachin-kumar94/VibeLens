import React, { useState } from "react";
import {
  TrendingUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Layers,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface TrendPoint {
  id: string;
  index: number;
  date: string;
  rawDate: string;
  title: string;
  type: string;
  confidence: number;
  signalQuality: number;
  metricValue: number;
  metricName: string;
}

interface SignalTrendsChartProps {
  points: TrendPoint[];
  activeMetric: string;
  availableMetrics: Array<{ id: string; label: string; unit: string }>;
  trajectory: "Rising" | "Stable" | "Falling" | "No clear pattern" | "Single session";
  trajectoryDelta: number;
  onSelectMetric: (metricId: string) => void;
  onNavigate: (path: string) => void;
}

export const SignalTrendsChart: React.FC<SignalTrendsChartProps> = ({
  points,
  activeMetric,
  availableMetrics,
  trajectory,
  trajectoryDelta,
  onSelectMetric,
  onNavigate,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeMetricObj =
    availableMetrics.find((m) => m.id === activeMetric) || availableMetrics[0] || {
      id: "confidence",
      label: "Model Confidence",
      unit: "%",
    };

  // Trajectory badge styling
  const getTrajectoryBadge = () => {
    switch (trajectory) {
      case "Rising":
        return {
          icon: <ArrowUpRight size={13} />,
          text: `Rising (+${trajectoryDelta} pts)`,
          cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "Falling":
        return {
          icon: <ArrowDownRight size={13} />,
          text: `Falling (${trajectoryDelta} pts)`,
          cls: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "Stable":
        return {
          icon: <Minus size={13} />,
          text: "Steady Baseline",
          cls: "bg-[#F4EFE6] text-[#575A60] border-[#DDD7CB]",
        };
      default:
        return {
          icon: <Sparkles size={12} />,
          text: "Single Session Baseline",
          cls: "bg-[#FAF8F5] text-[#707582] border-[#DDD7CB]",
        };
    }
  };

  const badge = getTrajectoryBadge();

  // SVG Geometry Calculation
  const width = 600;
  const height = 220;
  const paddingX = 30;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  // Derive min and max value for vertical scaling
  const values = points.map((p) => p.metricValue);
  const minVal = Math.max(0, Math.min(40, ...values) - 10);
  const maxVal = Math.min(100, Math.max(90, ...values) + 10);
  const valRange = maxVal - minVal || 100;

  const getCoordinates = (p: TrendPoint, idx: number) => {
    const step = points.length > 1 ? graphWidth / (points.length - 1) : graphWidth / 2;
    const x = paddingX + idx * step;
    const normalizedY = (p.metricValue - minVal) / valRange;
    const y = height - paddingY - normalizedY * graphHeight;
    return { x, y };
  };

  // Build SVG path
  let pathD = "";
  let areaD = "";

  if (points.length > 1) {
    const coords = points.map((p, i) => getCoordinates(p, i));
    pathD = `M ${coords.map((c) => `${c.x},${c.y}`).join(" L ")}`;
    areaD = `M ${coords[0].x},${height - paddingY} L ${coords.map((c) => `${c.x},${c.y}`).join(" L ")} L ${coords[coords.length - 1].x},${height - paddingY} Z`;
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDD7CB] shadow-2xs space-y-6">
      {/* Header with Title, Metric Selector, and Trajectory */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EDE6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#8C8983]">
              CHRONOLOGICAL SIGNAL TRENDS
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#15171A]">
            Signal Progression Across Sessions
          </h2>
          <p className="text-xs text-[#575A60] mt-0.5">
            Hover over points to inspect session data or click to drill down into the recording.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trajectory Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${badge.cls}`}
          >
            {badge.icon}
            <span>{badge.text}</span>
          </span>

          {/* Metric Selector Dropdown */}
          <select
            value={activeMetric}
            onChange={(e) => onSelectMetric(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD7CB] text-xs font-semibold text-[#15171A] outline-hidden cursor-pointer hover:border-[#8C8983]"
          >
            {availableMetrics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.unit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative pt-2 pb-2">
        {points.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-xs font-semibold text-[#15171A]">No trend data available</p>
            <p className="text-[11px] text-[#8C8983]">
              Complete sessions in Voice, Body, Image, or Fusion to generate trajectory lines.
            </p>
          </div>
        ) : points.length === 1 ? (
          /* Single point representation */
          <div className="py-12 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E6F4EA] border border-[#A7F3D0] text-[#0D9488] text-xs font-mono font-bold">
              <span>{points[0].title}</span>
              <span>•</span>
              <span>{points[0].metricValue}{activeMetricObj.unit}</span>
            </div>
            <p className="text-xs text-[#575A60] max-w-sm mx-auto">
              1 session recorded in this window. Complete a few more sessions to reveal multi-point signal trajectories.
            </p>
          </div>
        ) : (
          <div className="relative">
            <svg
              className="w-full h-56 overflow-visible"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#F0EDE6" strokeDasharray="3,3" />
              <line x1={paddingX} y1={paddingY + graphHeight / 2} x2={width - paddingX} y2={paddingY + graphHeight / 2} stroke="#F0EDE6" strokeDasharray="3,3" />
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#DDD7CB" />

              {/* Area Fill */}
              {areaD && <path d={areaD} fill="url(#trendGradient)" />}

              {/* Main Curve Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Data Points */}
              {points.map((p, idx) => {
                const { x, y } = getCoordinates(p, idx);
                const isHovered = hoveredPoint?.id === p.id;

                return (
                  <g key={p.id}>
                    {/* Outer glow circle on hover */}
                    {isHovered && (
                      <circle cx={x} cy={y} r={9} fill="#10B981" fillOpacity={0.25} />
                    )}
                    {/* Main Point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      className="cursor-pointer transition duration-150"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoverPos({ x: rect.left, y: rect.top });
                        setHoveredPoint(p);
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => onNavigate("/history")}
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Date Labels */}
            <div className="flex justify-between text-[10px] font-mono text-[#8C8983] pt-2 border-t border-[#F0EDE6]">
              {points.map((p, i) => (
                <span
                  key={p.id}
                  className={`truncate max-w-[70px] ${
                    i !== 0 && i !== points.length - 1 && points.length > 8 ? "hidden sm:inline" : ""
                  }`}
                  title={`${p.title} (${p.date})`}
                >
                  {p.date}
                </span>
              ))}
            </div>

            {/* Hover Tooltip Card (Float overlay) */}
            {hoveredPoint && (
              <div
                className="absolute z-30 p-3 rounded-xl bg-[#14161B] text-white shadow-xl text-xs space-y-1 border border-white/10 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(hoveredPoint.index - 1) * (100 / Math.max(1, points.length - 1))}%`,
                  top: "10%",
                }}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-[#8C8983]">
                  <span className="uppercase">{hoveredPoint.type} scan</span>
                  <span>{hoveredPoint.date}</span>
                </div>
                <div className="font-semibold text-white truncate max-w-[190px]">
                  {hoveredPoint.title}
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10 font-mono text-[11px]">
                  <span className="text-[#8C8983]">{activeMetricObj.label}:</span>
                  <span className="text-[#10B981] font-bold">
                    {hoveredPoint.metricValue}{activeMetricObj.unit}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
