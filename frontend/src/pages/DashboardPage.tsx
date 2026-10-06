import React, { useEffect, useState, useRef } from "react";
import {
  Camera,
  Mic,
  Activity,
  Layers,
  ArrowRight,
  Plus,
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Award,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authApi, DashboardData } from "../services/authApi";

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Analysis Menu Popover
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement | null>(null);

  // Recent Analyses Filter Tab
  const [selectedFilter, setSelectedFilter] = useState<"all" | "image" | "voice" | "body" | "fusion">("all");

  // Trend Controls
  const [trendPeriod, setTrendPeriod] = useState<"7d" | "30d">("7d");
  const [trendMetric, setTrendMetric] = useState<"confidence" | "emotion" | "engagement">("confidence");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    try {
      setError(null);
      const res = await authApi.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError("We couldn't load your dashboard. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Invalidate & refresh on window focus (after returning from an analysis)
    const handleFocus = () => {
      authApi.getDashboard().then(setData).catch(() => {});
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Close New Analysis Popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    if (isNewMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isNewMenuOpen]);

  // Dynamic Time-of-Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.name || data?.user?.name || "there";

  // Today's Date String
  const todayDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  // Date Formatter: Today · 10:32 PM, Yesterday · 6:45 PM, Sep 18 · 8:20 PM
  const formatTimestamp = (rawDate?: string) => {
    if (!rawDate) return "Recently";
    try {
      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return rawDate;

      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

      const timeStr = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(date);

      if (isToday) return `Today · ${timeStr}`;
      if (isYesterday) return `Yesterday · ${timeStr}`;

      const dateStr = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
      return `${dateStr} · ${timeStr}`;
    } catch {
      return rawDate;
    }
  };

  // Filtered Recent Analyses
  const recentList = (data?.recentAnalyses || []).filter((item) => {
    if (selectedFilter === "all") return true;
    return item.type?.toLowerCase() === selectedFilter;
  });

  // Trend Data for Active Period
  const activeTrendData =
    trendPeriod === "7d"
      ? data?.trend?.trend7d || []
      : data?.trend?.trend30d || [];

  // SVG Chart Calculation
  const svgWidth = 640;
  const svgHeight = 200;
  const paddingX = 35;
  const paddingY = 25;
  const chartInnerWidth = svgWidth - paddingX * 2;
  const chartInnerHeight = svgHeight - paddingY * 2;

  const chartPoints = activeTrendData.map((pt, idx) => {
    const rawVal = pt[trendMetric] ?? 80;
    const x = paddingX + (idx / Math.max(1, activeTrendData.length - 1)) * chartInnerWidth;
    const minVal = 50;
    const maxVal = 100;
    const normalized = Math.max(0, Math.min(1, (rawVal - minVal) / (maxVal - minVal)));
    const y = paddingY + chartInnerHeight * (1 - normalized);
    return { x, y, val: rawVal, label: pt.label || pt.date, date: pt.date };
  });

  const pathD = chartPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    const cpy2 = pt.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD =
    chartPoints.length > 0
      ? `${pathD} L ${chartPoints[chartPoints.length - 1].x} ${svgHeight - paddingY} L ${chartPoints[0].x} ${svgHeight - paddingY} Z`
      : "";

  // Helper for Modality Icon
  const renderModalityIcon = (type: string, size = 16) => {
    switch (type.toLowerCase()) {
      case "image":
        return <Camera size={size} className="text-[#36B889]" />;
      case "voice":
        return <Mic size={size} className="text-[#786D9D]" />;
      case "body":
        return <Activity size={size} className="text-[#0284C7]" />;
      case "fusion":
      default:
        return <Layers size={size} className="text-[#C28B6B]" />;
    }
  };

  // Helper to open specific analysis detail
  const handleOpenAnalysis = (item: { id: string; type: string }) => {
    const t = item.type.toLowerCase();
    if (t === "image") onNavigate(`/image?id=${item.id}`);
    else if (t === "voice") onNavigate(`/voice?id=${item.id}`);
    else if (t === "body") onNavigate(`/body?id=${item.id}`);
    else onNavigate(`/fusion?id=${item.id}`);
  };

  // --------------------------------------------------------------------------
  // RENDER: LOADING STATE (Clean Skeletons)
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-8 max-w-[1380px] mx-auto pb-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E2D8]">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-[#EBE7DF] rounded-xl" />
            <div className="h-4 w-80 bg-[#EBE7DF] rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-[#EBE7DF] rounded-xl" />
        </div>

        {/* 4 Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E2D8] space-y-3">
              <div className="h-3 w-24 bg-[#F2EDE4] rounded" />
              <div className="h-8 w-20 bg-[#EBE7DF] rounded-lg" />
              <div className="h-3 w-32 bg-[#F2EDE4] rounded" />
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#E6E2D8] space-y-4">
            <div className="h-5 w-40 bg-[#EBE7DF] rounded" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-[#FAF8F5] rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#E6E2D8] space-y-4">
            <div className="h-5 w-32 bg-[#EBE7DF] rounded" />
            <div className="h-20 bg-[#FAF8F5] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: ERROR STATE
  // --------------------------------------------------------------------------
  if (error && !data) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-[#E6E2D8] shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#17191A]">We couldn't load your dashboard</h2>
        <p className="text-xs text-[#66706D] leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadDashboardData();
          }}
          className="px-5 py-2.5 rounded-xl bg-[#17191A] text-white text-xs font-semibold hover:bg-black transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  // Derived values from real data
  const totalAnalyses = data?.summary?.totalAnalyses ?? 0;
  const avgConfidence = data?.summary?.averageConfidence ?? 0;
  const currentVibe = data?.summary?.currentVibe ?? "Not yet recorded";
  const lastAnalysis = data?.summary?.lastAnalysis;

  const hasAnalyses = totalAnalyses > 0 && (data?.recentAnalyses?.length ?? 0) > 0;

  return (
    <div className="max-w-[1380px] mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* ===================================================================== */}
      {/* SECTION 2: WELCOME + PRIMARY ACTION (HERO SECTION)                   */}
      {/* ===================================================================== */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E2D8]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#17191A] tracking-tight">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-[#66706D] mt-1 leading-relaxed">
              Your recent VibeLens activity at a glance.
            </p>
          </div>

          {/* Action Controls: Date Badge & [ + New Analysis ▾ ] Button */}
          <div className="flex items-center gap-3 relative">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#DDD8CD] text-xs text-[#66706D] shadow-2xs">
              <Calendar size={13} className="text-[#8C8983]" />
              <span>{todayDate}</span>
            </div>

            {/* New Analysis Menu Popover Container */}
            <div className="relative" ref={newMenuRef}>
              <button
                type="button"
                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                className="px-4 py-2.5 rounded-xl bg-[#17191A] hover:bg-[#252833] text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Plus size={15} />
                <span>New Analysis</span>
                <ChevronDown size={13} className={`transition-transform duration-150 ${isNewMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Popover Menu */}
              {isNewMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E6E2D8] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-[#8C8983] border-b border-[#F4F1EA]">
                    Select Modality
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      onNavigate("/image");
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#FAF8F5] flex items-center gap-2.5 transition cursor-pointer font-medium text-[#17191A]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                      <Camera size={13} className="text-[#36B889]" />
                    </div>
                    <div>
                      <div className="font-semibold">Analyze Image</div>
                      <div className="text-[10px] text-[#66706D]">Upload photo or selfie</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      onNavigate("/voice");
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#FAF8F5] flex items-center gap-2.5 transition cursor-pointer font-medium text-[#17191A]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#F5F3FF] flex items-center justify-center">
                      <Mic size={13} className="text-[#786D9D]" />
                    </div>
                    <div>
                      <div className="font-semibold">Analyze Voice</div>
                      <div className="text-[10px] text-[#66706D]">Record voice audio</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      onNavigate("/body");
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#FAF8F5] flex items-center gap-2.5 transition cursor-pointer font-medium text-[#17191A]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#F0F9FF] flex items-center justify-center">
                      <Activity size={13} className="text-[#0284C7]" />
                    </div>
                    <div>
                      <div className="font-semibold">Analyze Body</div>
                      <div className="text-[10px] text-[#66706D]">Camera posture & poise</div>
                    </div>
                  </button>

                  <div className="border-t border-[#F4F1EA] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      onNavigate("/fusion");
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#FAF8F5] flex items-center gap-2.5 transition cursor-pointer font-medium text-[#17191A]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                      <Layers size={13} className="text-[#C28B6B]" />
                    </div>
                    <div>
                      <div className="font-semibold">Run Fusion</div>
                      <div className="text-[10px] text-[#66706D]">Multi-channel synthesis</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      onNavigate("/interview");
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#FAF8F5] flex items-center gap-2.5 transition cursor-pointer font-medium text-[#17191A]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                      <Award size={13} className="text-[#059669]" />
                    </div>
                    <div>
                      <div className="font-semibold">Practice Interview</div>
                      <div className="text-[10px] text-[#66706D]">Simulator & question bank</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content Stream */}
      <div className="space-y-8">
        {/* ===================================================================== */}
        {/* SECTION 3: KEY OVERVIEW METRICS (4 Real Cards)                        */}
        {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Analyses */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs flex flex-col justify-between space-y-3">
          <span className="text-xs font-medium text-[#66706D]">Total Analyses</span>
          <div>
            <div className="text-3xl font-serif font-bold text-[#17191A]">
              {totalAnalyses}
            </div>
            <div className="text-[11px] text-[#66706D] mt-1">
              {data?.summary?.thisMonthCount ? `${data.summary.thisMonthCount} recorded this month` : "All-time recordings"}
            </div>
          </div>
        </div>

        {/* Card 2: Average Confidence */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs flex flex-col justify-between space-y-3">
          <span className="text-xs font-medium text-[#66706D]">Average Confidence</span>
          <div>
            <div className="text-3xl font-serif font-bold text-[#17191A]">
              {avgConfidence > 0 ? `${avgConfidence}%` : "—"}
            </div>
            <div className="text-[11px] text-[#66706D] mt-1">
              {avgConfidence > 0 ? "Estimated signal confidence" : "Requires at least 1 session"}
            </div>
          </div>
        </div>

        {/* Card 3: Current / Top Vibe */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs flex flex-col justify-between space-y-3">
          <span className="text-xs font-medium text-[#66706D]">Current Vibe</span>
          <div>
            <div className="text-xl font-serif font-bold text-[#17191A] truncate">
              {currentVibe}
            </div>
            <div className="text-[11px] text-[#66706D] mt-1">
              {hasAnalyses ? "Based on recent sessions" : "Establish through your first session"}
            </div>
          </div>
        </div>

        {/* Card 4: Last Analysis */}
        <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs flex flex-col justify-between space-y-3">
          <span className="text-xs font-medium text-[#66706D]">Last Analysis</span>
          <div>
            <div className="text-lg font-serif font-bold text-[#17191A] truncate">
              {lastAnalysis ? formatTimestamp(lastAnalysis.timestamp) : "None yet"}
            </div>
            <div className="text-[11px] text-[#66706D] mt-1 truncate">
              {lastAnalysis ? `${lastAnalysis.type.charAt(0).toUpperCase() + lastAnalysis.type.slice(1)} analysis` : "No sessions completed"}
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* MAIN 12-COLUMN GRID (Recent Analyses & Personal Insight)              */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Recent Analyses */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#17191A]">Recent Analyses</h2>
              <p className="text-xs text-[#66706D]">Your latest sessions and insights.</p>
            </div>

            {/* Filter Tabs: All, Image, Voice, Body, Fusion */}
            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E2D8] text-xs">
              {(["all", "image", "voice", "body", "fusion"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition cursor-pointer ${
                    selectedFilter === tab
                      ? "bg-white text-[#17191A] shadow-xs font-semibold"
                      : "text-[#66706D] hover:text-[#17191A]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List of Analyses or Empty State */}
          {!hasAnalyses || recentList.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#DDD8CD] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#DDD8CD] flex items-center justify-center mx-auto text-[#8C8983]">
                <Layers size={18} />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-sm font-bold text-[#17191A]">
                  {!hasAnalyses ? "No analyses yet" : `No ${selectedFilter} sessions recorded yet`}
                </h3>
                <p className="text-xs text-[#66706D] leading-relaxed">
                  {!hasAnalyses
                    ? "Start by analyzing your first image, voice recording, or body-language session."
                    : "Record or upload your first session in this category to view it here."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(selectedFilter === "all" ? "/image" : `/${selectedFilter}`)}
                className="px-4 py-2 rounded-xl bg-[#17191A] text-white text-xs font-semibold hover:bg-black transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Start an Analysis</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F4F1EA]">
              {recentList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenAnalysis(item)}
                  className="py-3 px-2 flex items-center justify-between gap-4 group cursor-pointer hover:bg-[#FAF8F5] rounded-xl transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail or Brand Modality Icon */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F4F1EA] border border-[#DDD8CD] flex items-center justify-center shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if thumbnail fails
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        renderModalityIcon(item.type, 18)
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#17191A] truncate group-hover:text-black">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#66706D]">
                        <span className="capitalize font-mono">{item.type}</span>
                        <span>•</span>
                        <span className="truncate">{item.primaryResult}</span>
                        <span>•</span>
                        <span className="text-[#8C8983]">{formatTimestamp(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#17191A] block">
                        {item.confidence}%
                      </span>
                      <span className="text-[10px] text-[#36B889] font-medium block">
                        {item.status || "Complete"}
                      </span>
                    </div>
                    <ChevronRight size={15} className="text-[#DDD8CD] group-hover:text-[#17191A] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer View All link */}
          <div className="pt-2 border-t border-[#F4F1EA] flex items-center justify-between text-xs">
            <span className="text-[#8C8983]">
              {recentList.length > 0 ? `Showing ${recentList.length} session${recentList.length > 1 ? "s" : ""}` : ""}
            </span>
            <button
              type="button"
              onClick={() => onNavigate("/history")}
              className="font-semibold text-[#17191A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Personal Insight */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#17191A]">Personal Insight</h2>
              <span className="w-2 h-2 rounded-full bg-[#36B889]" />
            </div>

            {data?.latestInsight ? (
              <div className="space-y-3">
                <p className="text-sm text-[#17191A] font-serif leading-relaxed italic border-l-2 border-[#786D9D]/40 pl-3">
                  &ldquo;{data.latestInsight.summary}&rdquo;
                </p>
                <p className="text-xs text-[#66706D] leading-relaxed">
                  {data.latestInsight.evidence}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E2D8] text-xs text-[#66706D] leading-relaxed space-y-1">
                <p className="font-semibold text-[#17191A]">Insights will appear here</p>
                <p>Complete your first few analyses to unlock personal signal observations.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F4F1EA]">
            <button
              type="button"
              onClick={() => onNavigate("/analytics")}
              className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#DDD8CD] text-xs font-semibold text-[#17191A] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View insights</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* LOWER 12-COLUMN GRID (Your Trend & Quick Actions)                     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Your Trend */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#17191A]" />
                <h2 className="font-serif text-lg font-bold text-[#17191A]">Your Trend</h2>
              </div>
              <p className="text-xs text-[#66706D]">Single progression curve based on actual session history.</p>
            </div>

            {/* Controls: Period Tabs & Metric Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Selector */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E2D8] text-xs">
                {(["confidence", "emotion", "engagement"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTrendMetric(m)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                      trendMetric === m
                        ? "bg-white text-[#17191A] shadow-xs font-semibold"
                        : "text-[#66706D] hover:text-[#17191A]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Period Tabs */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E2D8] text-xs font-mono">
                {(["7d", "30d"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTrendPeriod(p)}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer uppercase ${
                      trendPeriod === p
                        ? "bg-[#17191A] text-white font-semibold shadow-xs"
                        : "text-[#66706D] hover:text-[#17191A]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SVG Chart or Grounded Empty State */}
          {chartPoints.length < 2 ? (
            <div className="py-16 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#DDD8CD] space-y-2">
              <TrendingUp size={24} className="text-[#8C8983] mx-auto" />
              <h3 className="text-sm font-semibold text-[#17191A]">Your trend will appear after a few analyses</h3>
              <p className="text-xs text-[#66706D] max-w-sm mx-auto">
                We only draw curves from verified historical sessions, avoiding fabricated data points.
              </p>
            </div>
          ) : (
            <div className="relative pt-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 sm:h-52 overflow-visible">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#36B889" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#36B889" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                {[100, 80, 60].map((level) => {
                  const y = paddingY + chartInnerHeight * (1 - (level - 50) / 50);
                  return (
                    <g key={level}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#F0EDE6"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text x={paddingX - 8} y={y + 3} fill="#A0A4AB" fontSize="10" fontFamily="monospace" textAnchor="end">
                        {level}%
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                <path d={areaD} fill="url(#trendGradient)" />

                {/* Primary Curve */}
                <path d={pathD} fill="none" stroke="#36B889" strokeWidth="2.5" strokeLinecap="round" />

                {/* Points */}
                {chartPoints.map((pt, i) => (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(i)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPointIndex === i ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#36B889"
                      strokeWidth={hoveredPointIndex === i ? 3 : 2}
                      className="transition-all duration-100"
                    />
                    {/* Tooltip */}
                    {hoveredPointIndex === i && (
                      <g>
                        <rect x={pt.x - 30} y={pt.y - 30} width="60" height="22" rx="6" fill="#17191A" />
                        <text
                          x={pt.x}
                          y={pt.y - 15}
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="600"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {pt.val}%
                        </text>
                      </g>
                    )}
                    {/* Label below */}
                    <text x={pt.x} y={svgHeight - 6} fill="#8C8983" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}

          <div className="pt-2 border-t border-[#F4F1EA] flex items-center justify-between text-xs">
            <span className="text-[#8C8983]">
              {chartPoints.length >= 2 ? `${chartPoints.length} verified daily intervals` : ""}
            </span>
            <button
              type="button"
              onClick={() => onNavigate("/analytics")}
              className="font-semibold text-[#17191A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Analytics</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Analysis Actions */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs space-y-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#17191A]">Start a new analysis</h2>
            <p className="text-xs text-[#66706D]">Select a direct input modality.</p>
          </div>

          {/* 4 Compact Action Tiles */}
          <div className="space-y-2.5">
            {/* Image Tile */}
            <div
              onClick={() => onNavigate("/image")}
              className="p-3.5 rounded-xl border border-[#DDD8CD] hover:border-[#36B889] hover:bg-[#FAF8F5] transition cursor-pointer flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                  <Camera size={16} className="text-[#36B889]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#17191A] group-hover:text-black">Image</h3>
                  <p className="text-[11px] text-[#66706D]">Upload a photo</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#8C8983] group-hover:text-[#36B889] group-hover:translate-x-0.5 transition" />
            </div>

            {/* Voice Tile */}
            <div
              onClick={() => onNavigate("/voice")}
              className="p-3.5 rounded-xl border border-[#DDD8CD] hover:border-[#786D9D] hover:bg-[#FAF8F5] transition cursor-pointer flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center">
                  <Mic size={16} className="text-[#786D9D]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#17191A] group-hover:text-black">Voice</h3>
                  <p className="text-[11px] text-[#66706D]">Record your voice</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#8C8983] group-hover:text-[#786D9D] group-hover:translate-x-0.5 transition" />
            </div>

            {/* Body Tile */}
            <div
              onClick={() => onNavigate("/body")}
              className="p-3.5 rounded-xl border border-[#DDD8CD] hover:border-[#0284C7] hover:bg-[#FAF8F5] transition cursor-pointer flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F0F9FF] flex items-center justify-center">
                  <Activity size={16} className="text-[#0284C7]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#17191A] group-hover:text-black">Body</h3>
                  <p className="text-[11px] text-[#66706D]">Use your camera</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#8C8983] group-hover:text-[#0284C7] group-hover:translate-x-0.5 transition" />
            </div>

            {/* Fusion Tile */}
            <div
              onClick={() => onNavigate("/fusion")}
              className="p-3.5 rounded-xl border border-[#DDD8CD] hover:border-[#C28B6B] hover:bg-[#FAF8F5] transition cursor-pointer flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                  <Layers size={16} className="text-[#C28B6B]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#17191A] group-hover:text-black">Fusion</h3>
                  <p className="text-[11px] text-[#66706D]">Combine signals</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#8C8983] group-hover:text-[#C28B6B] group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* SECTION 8: OPTIONAL PERSONAL BASELINE (Conditional: sampleSize >= 3)   */}
      {/* ===================================================================== */}
      {data?.baseline && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DDD8CD] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#786D9D]" />
              <h3 className="font-serif text-base font-bold text-[#17191A]">Personal Baseline</h3>
            </div>
            <p className="text-xs text-[#66706D]">
              Calibrated from {data.baseline.sampleSize} verified sessions. Shifts adapt gradually to protect against outlier bias.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-[#8C8983] block">Baseline</span>
              <span className="text-xl font-serif font-bold text-[#17191A]">
                {data.baseline.baselineValue}%
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-[#8C8983] block">Recent</span>
              <span className="text-xl font-serif font-bold text-[#17191A]">
                {data.baseline.currentValue}%
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-[#8C8983] block">Difference</span>
              <span
                className={`text-sm font-mono font-bold px-2 py-0.5 rounded-lg ${
                  data.baseline.change >= 0
                    ? "bg-[#ECFDF5] text-[#36B889]"
                    : "bg-[#FEF2F2] text-[#DC2626]"
                }`}
              >
                {data.baseline.change >= 0 ? `+${data.baseline.change}%` : `${data.baseline.change}%`}
              </span>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default DashboardPage;
