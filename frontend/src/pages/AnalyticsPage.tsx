import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FolderOpen,
  HelpCircle,
} from "lucide-react";
import { analyticsApi, AnalyticsResponseData, AnalyticsQueryParams } from "../services/analyticsApi";
import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { AnalyticsKPICards } from "../components/analytics/AnalyticsKPICards";
import { SignalTrendsChart } from "../components/analytics/SignalTrendsChart";
import { DynamicSignalInsights } from "../components/analytics/DynamicSignalInsights";
import { EmotionDistribution } from "../components/analytics/EmotionDistribution";
import { AnalysisMix } from "../components/analytics/AnalysisMix";
import { SignalQualityCard } from "../components/analytics/SignalQualityCard";
import { RecentActivityList } from "../components/analytics/RecentActivityList";
import { PersonalBaselineCard } from "../components/analytics/PersonalBaselineCard";
import { ActionCenter } from "../components/analytics/ActionCenter";
import { CustomDateRangeModal } from "../components/analytics/CustomDateRangeModal";
import { AnalyticsExportModal } from "../components/analytics/AnalyticsExportModal";
import { InsightDetailModal } from "../components/analytics/InsightDetailModal";

interface AnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  // Read initial filter values from URL query string if available
  const getInitialParams = (): AnalyticsQueryParams => {
    const params = new URLSearchParams(window.location.search);
    return {
      range: (params.get("range") as any) || "30d",
      startDate: params.get("startDate") || undefined,
      endDate: params.get("endDate") || undefined,
      modality: (params.get("modality") as any) || "all",
      metric: params.get("metric") || "confidence",
      context: params.get("context") || undefined,
    };
  };

  const [filterParams, setFilterParams] = useState<AnalyticsQueryParams>(getInitialParams);
  const [data, setData] = useState<AnalyticsResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedText, setLastRefreshedText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null);

  // Ref for scrolling to emotion distribution
  const emotionSectionRef = useRef<HTMLDivElement>(null);

  // Sync filters with URL query parameters
  const updateParams = (newParams: Partial<AnalyticsQueryParams>) => {
    const updated = { ...filterParams, ...newParams };
    setFilterParams(updated);

    const url = new URL(window.location.href);
    if (updated.range) url.searchParams.set("range", updated.range);
    if (updated.startDate) url.searchParams.set("startDate", updated.startDate);
    else url.searchParams.delete("startDate");
    if (updated.endDate) url.searchParams.set("endDate", updated.endDate);
    else url.searchParams.delete("endDate");
    if (updated.modality && updated.modality !== "all") {
      url.searchParams.set("modality", updated.modality);
    } else {
      url.searchParams.delete("modality");
    }
    if (updated.metric && updated.metric !== "confidence") {
      url.searchParams.set("metric", updated.metric);
    } else {
      url.searchParams.delete("metric");
    }

    window.history.replaceState({}, "", url.toString());
  };

  // Fetch analytics from backend
  const fetchAnalytics = useCallback(
    async (showFullLoader: boolean = true) => {
      if (showFullLoader) setLoading(true);
      setError(null);
      try {
        const res = await analyticsApi.getAnalytics(filterParams);
        setData(res);
        setLastRefreshedText("Updated just now");
        setTimeout(() => setLastRefreshedText(""), 4000);
      } catch (err: any) {
        console.error("Analytics fetch failed:", err);
        setError(err.message || "We couldn't load your personal analytics.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [filterParams]
  );

  // Initial and parameter change loading
  useEffect(() => {
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics(false);
  };

  // Custom date range apply
  const handleApplyCustomRange = (startDate: string, endDate: string) => {
    updateParams({
      range: "custom",
      startDate,
      endDate,
    });
  };

  const handleResetCustomRange = () => {
    updateParams({
      range: "30d",
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleScrollToEmotion = () => {
    emotionSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const totalUserRecords = data?.metadata?.totalUserRecords ?? 0;
  const filteredCount = data?.metadata?.filteredCount ?? 0;

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-9 animate-in fade-in duration-200">
      {/* 1. Header (Title, Range Filter, Modality Filter, Export, Refresh) */}
      <AnalyticsHeader
        timeRange={filterParams.range || "30d"}
        onSelectTimeRange={(r) => updateParams({ range: r as any, startDate: undefined, endDate: undefined })}
        modality={filterParams.modality || "all"}
        onSelectModality={(m) => updateParams({ modality: m as any })}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshedText={lastRefreshedText}
        onOpenCustomRange={() => setIsCustomRangeOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* 2. Loading State */}
      {loading ? (
        <div className="py-24 text-center text-xs text-[#707582] flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs">Computing personal signal metrics and trajectory lines...</p>
        </div>
      ) : error ? (
        /* 3. Error State (Section 80, 128, 130) */
        <div className="p-10 rounded-3xl bg-rose-50/70 border border-rose-200 text-center space-y-3 max-w-lg mx-auto shadow-xs">
          <AlertCircle size={28} className="mx-auto text-rose-600" />
          <h3 className="font-serif text-xl font-bold text-rose-900">
            We couldn't load your analytics
          </h3>
          <p className="text-xs text-rose-700">{error}</p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => fetchAnalytics(true)}
              className="px-4 py-2 rounded-xl bg-rose-900 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/history")}
              className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-xs font-medium text-rose-900 hover:bg-rose-100 cursor-pointer"
            >
              View History
            </button>
          </div>
        </div>
      ) : totalUserRecords === 0 ? (
        /* 4. Total User Empty State (Section 4, 103) */
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[#DDD7CB] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CB] flex items-center justify-center mx-auto text-[#8C8983]">
            <FolderOpen size={24} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#15171A]">
            Your personal analytics will appear here
          </h3>
          <p className="text-sm text-[#575A60] max-w-md mx-auto">
            Your personal signal intelligence dashboard activates as soon as you record your first image, voice, body, or fusion analysis.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate("/voice")}
              className="px-5 py-2.5 rounded-xl bg-[#15171A] text-white text-xs font-semibold hover:bg-[#2B2E33] inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Start an Analysis</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/history")}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD7CB] text-xs font-medium text-[#15171A] hover:bg-[#FAF8F5] cursor-pointer"
            >
              View Features
            </button>
          </div>
        </div>
      ) : filteredCount === 0 ? (
        /* 5. Filter Window Empty State */
        <div className="p-10 rounded-3xl bg-white border border-[#DDD7CB] text-center space-y-3 max-w-xl mx-auto shadow-xs">
          <HelpCircle size={24} className="mx-auto text-[#8C8983]" />
          <h3 className="font-serif text-xl font-bold text-[#15171A]">
            No analyses found in this timeframe
          </h3>
          <p className="text-xs text-[#575A60]">
            You have {totalUserRecords} total session records, but none matched your current filter criteria.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => updateParams({ range: "all", modality: "all" })}
              className="px-4 py-2 rounded-xl bg-[#15171A] text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              Show All Time & Modalities
            </button>
          </div>
        </div>
      ) : (
        /* 6. Active Multi-Section Analytics Workspace */
        <div className="space-y-8">
          {/* Row 1: KPI Cards (Sections 12-18) */}
          {data && (
            <AnalyticsKPICards
              summary={data.summary}
              onNavigate={onNavigate}
              onScrollToEmotion={handleScrollToEmotion}
            />
          )}

          {/* Row 2: Signal Trends Chart (8 cols) + Dynamic Insights (4 cols) */}
          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8">
                <SignalTrendsChart
                  points={data.trends.points}
                  activeMetric={data.trends.activeMetric}
                  availableMetrics={data.trends.availableMetrics}
                  trajectory={data.trends.trajectory}
                  trajectoryDelta={data.trends.trajectoryDelta}
                  onSelectMetric={(m) => updateParams({ metric: m })}
                  onNavigate={onNavigate}
                />
              </div>

              <div className="lg:col-span-4">
                <DynamicSignalInsights
                  insights={data.insights}
                  onSelectInsight={(ins) => setSelectedInsight(ins)}
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          )}

          {/* Row 3: Emotion Distribution + Modality Analysis Mix (Sections 27-30) */}
          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={emotionSectionRef}>
              <EmotionDistribution
                emotions={data.emotionDistribution}
                totalAnalyses={data.summary.totalAnalyses}
              />
              <AnalysisMix
                mix={data.modalityDistribution.mix}
                total={data.modalityDistribution.total}
                onNavigate={onNavigate}
              />
            </div>
          )}

          {/* Row 4: Signal Quality + Recent Activity (Sections 31, 43, 101) */}
          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SignalQualityCard signalQuality={data.signalQuality} />
              <RecentActivityList items={data.recentActivity} onNavigate={onNavigate} />
            </div>
          )}

          {/* Row 5: Personal Baseline + Contextual Action Center (Sections 45-48, 99, 100) */}
          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PersonalBaselineCard baseline={data.baseline} onNavigate={onNavigate} />
              <ActionCenter
                modalityMix={data.modalityDistribution.mix}
                totalAnalyses={data.summary.totalAnalyses}
                onNavigate={onNavigate}
              />
            </div>
          )}
        </div>
      )}

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        isOpen={isCustomRangeOpen}
        onClose={() => setIsCustomRangeOpen(false)}
        initialStart={filterParams.startDate}
        initialEnd={filterParams.endDate}
        onApply={handleApplyCustomRange}
        onReset={handleResetCustomRange}
      />

      {/* Export Report Modal */}
      <AnalyticsExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={data}
      />

      {/* Insight Deep-Dive Modal */}
      <InsightDetailModal
        isOpen={Boolean(selectedInsight)}
        onClose={() => setSelectedInsight(null)}
        insight={selectedInsight}
        onNavigate={onNavigate}
      />
    </div>
  );
};
