const API_BASE = "/api";

export interface AnalyticsQueryParams {
  range?: "7d" | "30d" | "90d" | "6m" | "1y" | "all" | "custom";
  startDate?: string;
  endDate?: string;
  modality?: "all" | "image" | "voice" | "body" | "fusion" | "interview" | "presentation" | string;
  metric?: string;
  context?: string;
}

export interface AnalyticsResponseData {
  summary: {
    totalAnalyses: number;
    totalAnalysesDelta: number;
    totalAnalysesDeltaPercent: number;
    averageConfidence: number | null;
    confidenceDelta: number;
    topEmotion: string;
    topEmotionCount: number;
    topEmotionPercentage: number;
    topVibe: string;
    topVibeCount: number;
    topVibePercentage: number;
  };

  trends: {
    points: Array<{
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
    }>;
    activeMetric: string;
    availableMetrics: Array<{ id: string; label: string; unit: string }>;
    trajectory: "Rising" | "Stable" | "Falling" | "No clear pattern" | "Single session";
    trajectoryDelta: number;
  };

  emotionDistribution: Array<{
    emotion: string;
    count: number;
    percentage: number;
  }>;

  modalityDistribution: {
    mix: Array<{
      type: "image" | "voice" | "body" | "fusion" | "interview" | "presentation" | string;
      count: number;
      percentage: number;
      averageConfidence: number | null;
    }>;
    total: number;
  };

  signalQuality: {
    overallScore: number;
    overallRating: "Good" | "Fair" | "Poor";
    byModality: Record<string, { score: number; rating: string; count: number }>;
  };

  insights: Array<{
    id: string;
    category: "trend" | "pattern" | "quality" | "action";
    title: string;
    observation: string;
    supportingData: string;
    sampleSize: number;
    dateRange: string;
    metric: string;
    dataStrength: "High" | "Moderate" | "Preliminary";
    limitations: string;
    recommendedAction?: {
      label: string;
      path: string;
    };
  }>;

  baseline: {
    hasSufficientHistory: boolean;
    baselineConfidence: number;
    currentConfidence: number;
    deltaPp: number;
    sampleCount: number;
    message: string;
  };

  recentActivity: Array<{
    id: string;
    type: "image" | "voice" | "body" | "fusion";
    title: string;
    timestamp: string;
    confidence: number;
    signalQuality: string;
    context: string;
    vibe: string;
    emotion: string;
    fileUrl?: string;
  }>;

  metadata: {
    range: string;
    from: string;
    to: string;
    totalUserRecords: number;
    filteredCount: number;
    generatedAt: string;
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      json.error?.message || json.error || json.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }
  return json as T;
}

export const analyticsApi = {
  /**
   * Fetches real-time aggregated personal analytics
   */
  async getAnalytics(params: AnalyticsQueryParams = {}): Promise<AnalyticsResponseData> {
    const query = new URLSearchParams();
    if (params.range) query.set("range", params.range);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.modality) query.set("modality", params.modality);
    if (params.metric) query.set("metric", params.metric);
    if (params.context) query.set("context", params.context);

    const queryString = query.toString();
    const endpoint = `/analytics${queryString ? `?${queryString}` : ""}`;
    return request<AnalyticsResponseData>(endpoint);
  },

  /**
   * Exports raw CSV or JSON dataset
   */
  getExportUrl(format: "csv" | "json"): string {
    return `${API_BASE}/analytics/export?format=${format}`;
  },
};
