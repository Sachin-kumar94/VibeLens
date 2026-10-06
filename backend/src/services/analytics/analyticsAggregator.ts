import { NormalizedAnalyticsRecord } from "./analyticsNormalizer.js";

export interface AnalyticsFilterOptions {
  range?: "7d" | "30d" | "90d" | "6m" | "1y" | "all" | "custom";
  startDate?: string;
  endDate?: string;
  modality?: "all" | "image" | "voice" | "body" | "fusion";
  metric?: string;
  context?: string;
}

export interface TrendPoint {
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

export interface AnalyticsSummaryResult {
  kpis: {
    totalAnalyses: number;
    totalAnalysesDelta: number; // vs previous period
    totalAnalysesDeltaPercent: number;
    averageConfidence: number | null;
    confidenceDelta: number; // percentage points vs previous period
    topEmotion: string;
    topEmotionCount: number;
    topEmotionPercentage: number;
    topVibe: string;
    topVibeCount: number;
    topVibePercentage: number;
  };

  trends: {
    points: TrendPoint[];
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
      type: "image" | "voice" | "body" | "fusion";
      count: number;
      percentage: number;
      averageConfidence: number | null;
    }>;
    total: number;
  };

  signalQuality: {
    overallScore: number;
    overallRating: "Good" | "Fair" | "Poor";
    byModality: {
      image?: { score: number; rating: string; count: number };
      voice?: { score: number; rating: string; count: number };
      body?: { score: number; rating: string; count: number };
      fusion?: { score: number; rating: string; count: number };
    };
  };

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

export class AnalyticsAggregator {
  /**
   * Computes date boundaries for current and previous comparison periods
   */
  public static calculateDateWindows(options: AnalyticsFilterOptions) {
    const now = new Date();
    let currentStart = new Date();
    let currentEnd = new Date(now);

    const range = options.range || "30d";

    if (range === "custom" && options.startDate && options.endDate) {
      currentStart = new Date(options.startDate);
      currentEnd = new Date(options.endDate);
      // Ensure end of day
      currentEnd.setHours(23, 59, 59, 999);
    } else {
      switch (range) {
        case "7d":
          currentStart.setDate(now.getDate() - 7);
          break;
        case "30d":
          currentStart.setDate(now.getDate() - 30);
          break;
        case "90d":
          currentStart.setDate(now.getDate() - 90);
          break;
        case "6m":
          currentStart.setMonth(now.getMonth() - 6);
          break;
        case "1y":
          currentStart.setFullYear(now.getFullYear() - 1);
          break;
        case "all":
          currentStart = new Date(0); // Epoch start
          break;
        default:
          currentStart.setDate(now.getDate() - 30);
      }
    }

    // Previous equivalent period for delta calculations
    const windowDurationMs = currentEnd.getTime() - currentStart.getTime();
    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - windowDurationMs);

    return {
      current: { start: currentStart, end: currentEnd },
      previous: { start: previousStart, end: previousEnd },
      isAllTime: range === "all",
    };
  }

  /**
   * Aggregates normalized records into a complete analytics dataset
   */
  public static aggregate(
    allUserRecords: NormalizedAnalyticsRecord[],
    options: AnalyticsFilterOptions,
    userBaselineConf: number = 82
  ): AnalyticsSummaryResult {
    const { current, previous, isAllTime } = this.calculateDateWindows(options);

    // 1. Filter current period records
    const currentRecords = allUserRecords.filter((r) => {
      const t = r.timestamp.getTime();
      if (!isAllTime && (t < current.start.getTime() || t > current.end.getTime())) {
        return false;
      }
      if (options.modality && options.modality !== "all" && r.type !== options.modality) {
        return false;
      }
      if (options.context && options.context !== "all" && !r.context.toLowerCase().includes(options.context.toLowerCase())) {
        return false;
      }
      return true;
    });

    // 2. Filter previous period records (for true mathematical deltas)
    const previousRecords = allUserRecords.filter((r) => {
      if (isAllTime) return false;
      const t = r.timestamp.getTime();
      if (t < previous.start.getTime() || t > previous.end.getTime()) {
        return false;
      }
      if (options.modality && options.modality !== "all" && r.type !== options.modality) {
        return false;
      }
      return true;
    });

    // --- KPIs ---
    const totalAnalyses = currentRecords.length;
    const previousTotal = previousRecords.length;
    const totalAnalysesDelta = totalAnalyses - previousTotal;
    const totalAnalysesDeltaPercent =
      previousTotal > 0 ? Math.round((totalAnalysesDelta / previousTotal) * 100) : 0;

    let averageConfidence: number | null = null;
    if (totalAnalyses > 0) {
      const sumConf = currentRecords.reduce((acc, r) => acc + r.confidence, 0);
      averageConfidence = Math.round(sumConf / totalAnalyses);
    }

    let previousAvgConfidence: number | null = null;
    if (previousRecords.length > 0) {
      const sumPrev = previousRecords.reduce((acc, r) => acc + r.confidence, 0);
      previousAvgConfidence = Math.round(sumPrev / previousRecords.length);
    }

    const confidenceDelta =
      averageConfidence !== null && previousAvgConfidence !== null
        ? averageConfidence - previousAvgConfidence
        : 0;

    // Emotion counts
    const emotionCounts: Record<string, number> = {};
    const vibeCounts: Record<string, number> = {};

    currentRecords.forEach((r) => {
      emotionCounts[r.emotion] = (emotionCounts[r.emotion] || 0) + 1;
      vibeCounts[r.vibe] = (vibeCounts[r.vibe] || 0) + 1;
    });

    const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
    const topEmotionEntry = sortedEmotions[0];
    const topEmotion = topEmotionEntry ? topEmotionEntry[0] : totalAnalyses > 0 ? "Calm" : "None";
    const topEmotionCount = topEmotionEntry ? topEmotionEntry[1] : 0;
    const topEmotionPercentage = totalAnalyses > 0 ? Math.round((topEmotionCount / totalAnalyses) * 100) : 0;

    const sortedVibes = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1]);
    const topVibeEntry = sortedVibes[0];
    const topVibe = topVibeEntry ? topVibeEntry[0] : totalAnalyses > 0 ? "Grounded" : "None";
    const topVibeCount = topVibeEntry ? topVibeEntry[1] : 0;
    const topVibePercentage = totalAnalyses > 0 ? Math.round((topVibeCount / totalAnalyses) * 100) : 0;

    // --- Emotion Distribution ---
    const emotionDistribution = sortedEmotions.map(([emo, count]) => ({
      emotion: emo,
      count,
      percentage: Math.round((count / totalAnalyses) * 100),
    }));

    // --- Modality Mix & Performance ---
    const modalityTypes: Array<"image" | "voice" | "body" | "fusion"> = [
      "image",
      "voice",
      "body",
      "fusion",
    ];

    const modalityMix = modalityTypes.map((type) => {
      const modRecords = currentRecords.filter((r) => r.type === type);
      const count = modRecords.length;
      const percentage = totalAnalyses > 0 ? Math.round((count / totalAnalyses) * 100) : 0;
      let avgConf: number | null = null;
      if (count > 0) {
        avgConf = Math.round(modRecords.reduce((acc, r) => acc + r.confidence, 0) / count);
      }
      return { type, count, percentage, averageConfidence: avgConf };
    });

    // --- Signal Quality ---
    let overallQualityScore = 90;
    if (totalAnalyses > 0) {
      const sumQ = currentRecords.reduce((acc, r) => acc + r.signalQualityScore, 0);
      overallQualityScore = Math.round(sumQ / totalAnalyses);
    }
    const overallRating: "Good" | "Fair" | "Poor" =
      overallQualityScore >= 85 ? "Good" : overallQualityScore >= 70 ? "Fair" : "Poor";

    const qualityByModality: AnalyticsSummaryResult["signalQuality"]["byModality"] = {};
    modalityTypes.forEach((m) => {
      const recs = currentRecords.filter((r) => r.type === m);
      if (recs.length > 0) {
        const avg = Math.round(recs.reduce((acc, r) => acc + r.signalQualityScore, 0) / recs.length);
        qualityByModality[m] = {
          score: avg,
          rating: avg >= 85 ? "Good" : avg >= 70 ? "Fair" : "Poor",
          count: recs.length,
        };
      }
    });

    // --- Signal Trends ---
    // Available metrics discovery
    const availableMetrics: Array<{ id: string; label: string; unit: string }> = [
      { id: "confidence", label: "Model Confidence", unit: "%" },
      { id: "signalQuality", label: "Signal Quality", unit: "%" },
    ];

    const hasVoice = currentRecords.some((r) => r.metrics.vocalEnergy !== undefined);
    if (hasVoice) {
      availableMetrics.push({ id: "vocalEnergy", label: "Vocal Energy", unit: "%" });
      availableMetrics.push({ id: "wordsPerMinute", label: "Speech Cadence (WPM)", unit: "WPM" });
    }

    const hasBody = currentRecords.some((r) => r.metrics.postureScore !== undefined);
    if (hasBody) {
      availableMetrics.push({ id: "posture", label: "Posture Alignment", unit: "%" });
      availableMetrics.push({ id: "gaze", label: "Gaze Stability", unit: "%" });
    }

    const hasFusion = currentRecords.some((r) => r.metrics.agreementScore !== undefined);
    if (hasFusion) {
      availableMetrics.push({ id: "agreementScore", label: "Cross-Modal Concordance", unit: "%" });
    }

    const activeMetricId = options.metric || "confidence";

    // Chronological points (sorted ascending by timestamp)
    const chronologicalRecords = [...currentRecords].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const trendPoints: TrendPoint[] = chronologicalRecords.map((r, idx) => {
      let metricVal = r.confidence;
      if (activeMetricId === "signalQuality") metricVal = r.signalQualityScore;
      else if (activeMetricId === "vocalEnergy") metricVal = r.metrics.vocalEnergy || r.confidence;
      else if (activeMetricId === "wordsPerMinute") metricVal = r.metrics.wordsPerMinute || 140;
      else if (activeMetricId === "posture") metricVal = r.metrics.postureScore || r.confidence;
      else if (activeMetricId === "gaze") metricVal = r.metrics.gazeScore || r.confidence;
      else if (activeMetricId === "agreementScore") metricVal = r.metrics.agreementScore || r.confidence;

      const d = r.timestamp;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateStr = `${monthNames[d.getMonth()]} ${d.getDate()}`;

      return {
        id: r.id,
        index: idx + 1,
        date: dateStr,
        rawDate: d.toISOString(),
        title: r.title,
        type: r.type,
        confidence: r.confidence,
        signalQuality: r.signalQualityScore,
        metricValue: metricVal,
        metricName: activeMetricId,
      };
    });

    // Trajectory calculation (slope over points)
    let trajectory: AnalyticsSummaryResult["trends"]["trajectory"] = "Single session";
    let trajectoryDelta = 0;

    if (trendPoints.length > 1) {
      const firstVal = trendPoints[0].metricValue;
      const lastVal = trendPoints[trendPoints.length - 1].metricValue;
      trajectoryDelta = lastVal - firstVal;

      if (trajectoryDelta >= 3) {
        trajectory = "Rising";
      } else if (trajectoryDelta <= -3) {
        trajectory = "Falling";
      } else {
        trajectory = "Stable";
      }
    }

    // --- Personal Baseline ---
    const minBaselineSamples = 3;
    const hasSufficientHistory = allUserRecords.length >= minBaselineSamples;
    const currentConfVal = averageConfidence ?? userBaselineConf;
    const baselinePp = currentConfVal - userBaselineConf;

    let baselineMessage = `Your personal confidence baseline is calibrated at ${userBaselineConf}%.`;
    if (!hasSufficientHistory) {
      baselineMessage = `Complete ${minBaselineSamples - allUserRecords.length} more analysis sessions to establish a calibrated baseline.`;
    } else if (baselinePp > 0) {
      baselineMessage = `Current sessions track +${baselinePp} percentage points above your personal baseline (${userBaselineConf}%).`;
    } else if (baselinePp < 0) {
      baselineMessage = `Current sessions track ${baselinePp} percentage points below your calibrated baseline.`;
    } else {
      baselineMessage = `Current sessions match your calibrated baseline of ${userBaselineConf}%.`;
    }

    // --- Recent Activity (Last 5-8 sessions) ---
    const recentActivity = [...allUserRecords]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        timestamp: r.timestamp.toISOString(),
        confidence: r.confidence,
        signalQuality: r.signalQualityRating,
        context: r.context,
        vibe: r.vibe,
        emotion: r.emotion,
        fileUrl: r.fileUrl,
      }));

    return {
      kpis: {
        totalAnalyses,
        totalAnalysesDelta,
        totalAnalysesDeltaPercent,
        averageConfidence,
        confidenceDelta,
        topEmotion,
        topEmotionCount,
        topEmotionPercentage,
        topVibe,
        topVibeCount,
        topVibePercentage,
      },
      trends: {
        points: trendPoints,
        activeMetric: activeMetricId,
        availableMetrics,
        trajectory,
        trajectoryDelta,
      },
      emotionDistribution,
      modalityDistribution: {
        mix: modalityMix,
        total: totalAnalyses,
      },
      signalQuality: {
        overallScore: overallQualityScore,
        overallRating,
        byModality: qualityByModality,
      },
      baseline: {
        hasSufficientHistory,
        baselineConfidence: userBaselineConf,
        currentConfidence: currentConfVal,
        deltaPp: baselinePp,
        sampleCount: allUserRecords.length,
        message: baselineMessage,
      },
      recentActivity,
      metadata: {
        range: options.range || "30d",
        from: current.start.toISOString(),
        to: current.end.toISOString(),
        totalUserRecords: allUserRecords.length,
        filteredCount: totalAnalyses,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
