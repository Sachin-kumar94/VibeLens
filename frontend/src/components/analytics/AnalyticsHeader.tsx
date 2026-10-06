import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  RefreshCw,
  Download,
  Filter,
  Layers,
  Check,
  Clock,
} from "lucide-react";

interface AnalyticsHeaderProps {
  timeRange: string;
  onSelectTimeRange: (range: string) => void;
  modality: string;
  onSelectModality: (modality: string) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshedText: string;
  onOpenCustomRange: () => void;
  onOpenExport: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  timeRange,
  onSelectTimeRange,
  modality,
  onSelectModality,
  onRefresh,
  isRefreshing,
  lastRefreshedText,
  onOpenCustomRange,
  onOpenExport,
}) => {
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [isModalityOpen, setIsModalityOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);
  const modalityRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) {
        setIsRangeOpen(false);
      }
      if (modalityRef.current && !modalityRef.current.contains(e.target as Node)) {
        setIsModalityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const rangeLabels: Record<string, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "6m": "Last 6 Months",
    "1y": "Last 1 Year",
    all: "All Time",
    custom: "Custom Range",
  };

  const modalityLabels: Record<string, string> = {
    all: "All Modalities",
    image: "Image Only",
    voice: "Voice Only",
    body: "Body Only",
    fusion: "Fusion Only",
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#DDD7CB] gap-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C8983]">
            PERSONAL SIGNAL ARCHIVE & TELEMETRY
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#15171A] tracking-tight">
          Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-[#575A60] mt-2 max-w-xl">
          Track your communication signals, composure progression, and modality distributions over time.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Modality Filter Dropdown */}
        <div className="relative" ref={modalityRef}>
          <button
            type="button"
            onClick={() => {
              setIsModalityOpen(!isModalityOpen);
              setIsRangeOpen(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-medium text-[#15171A] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Layers size={13} className="text-[#8C8983]" />
            <span>{modalityLabels[modality] || "All Modalities"}</span>
            <ChevronDown size={13} className="text-[#8C8983]" />
          </button>

          {isModalityOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl border border-[#DDD7CB] shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {Object.entries(modalityLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onSelectModality(key);
                    setIsModalityOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-[#FAF8F5] transition cursor-pointer ${
                    modality === key ? "font-bold text-[#15171A] bg-[#FAF8F5]" : "text-[#575A60]"
                  }`}
                >
                  <span>{label}</span>
                  {modality === key && <Check size={13} className="text-[#10B981]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Dropdown */}
        <div className="relative" ref={rangeRef}>
          <button
            type="button"
            onClick={() => {
              setIsRangeOpen(!isRangeOpen);
              setIsModalityOpen(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-xs font-medium text-[#15171A] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Calendar size={13} className="text-[#8C8983]" />
            <span>{rangeLabels[timeRange] || "Last 30 Days"}</span>
            <ChevronDown size={13} className="text-[#8C8983]" />
          </button>

          {isRangeOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-[#DDD7CB] shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {Object.entries(rangeLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setIsRangeOpen(false);
                    if (key === "custom") {
                      onOpenCustomRange();
                    } else {
                      onSelectTimeRange(key);
                    }
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-[#FAF8F5] transition cursor-pointer ${
                    timeRange === key ? "font-bold text-[#15171A] bg-[#FAF8F5]" : "text-[#575A60]"
                  }`}
                >
                  <span>{label}</span>
                  {timeRange === key && <Check size={13} className="text-[#10B981]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="p-2 rounded-xl bg-white border border-[#DDD7CB] hover:border-[#8C8983] text-[#575A60] hover:text-[#15171A] transition cursor-pointer shadow-2xs"
          title="Export Analytics (CSV, JSON, Report)"
        >
          <Download size={14} />
        </button>

        {/* Refresh Button with dynamic state */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-xl bg-[#15171A] text-white hover:bg-[#2B2E33] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60"
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#10B981]" : ""} />
          <span>{isRefreshing ? "Refreshing..." : lastRefreshedText || "Refresh"}</span>
        </button>
      </div>
    </div>
  );
};
