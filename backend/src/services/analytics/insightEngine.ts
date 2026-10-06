import { AnalyticsSummaryResult } from "./analyticsAggregator.js";
import { NormalizedAnalyticsRecord } from "./analyticsNormalizer.js";

export interface GeneratedInsight {
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
}

export class InsightEngine {
  /**
   * Generates 1-3 strictly data-driven, non-diagnostic personal signal insights
   */
  public static generateInsights(
    summary: AnalyticsSummaryResult,
    records: NormalizedAnalyticsRecord[]
  ): GeneratedInsight[] {
    const insights: GeneratedInsight[] = [];
    const count = summary.kpis.totalAnalyses;

    if (count === 0) {
      return [
        {
          id: "ins_awaiting",
          category: "action",
          title: "Personal Signal Archive Awaiting Input",
          observation:
            "No analyses were recorded within the selected timeframe. Complete a voice, image, body, or fusion session to establish dynamic insights.",
          supportingData: "0 analyses available for pattern extraction in selected window.",
          sampleSize: 0,
          dateRange: summary.metadata.range,
          metric: "Coverage",
          dataStrength: "Preliminary",
          limitations: "Requires minimum 1 recorded session for calibration.",
          recommendedAction: {
            label: "Start Voice Scan",
            path: "/voice",
          },
        },
      ];
    }

    // 1. Trend / Progression Insight
    if (summary.trends.points.length >= 2) {
      const trajectory = summary.trends.trajectory;
      const metricLabel = summary.trends.availableMetrics.find(
        (m) => m.id === summary.trends.activeMetric
      )?.label || "Confidence";

      if (trajectory === "Rising") {
        insights.push({
          id: "ins_trend_up",
          category: "trend",
          title: `Upward Trajectory in ${metricLabel}`,
          observation: `Estimated ${metricLabel.toLowerCase()} signals trended upward by ${Math.abs(
            summary.trends.trajectoryDelta
          )} points across your recent sessions.`,
          supportingData: `Derived from ${summary.trends.points.length} chronological data points. Initial: ${
            summary.trends.points[0].metricValue
          }, Latest: ${summary.trends.points[summary.trends.points.length - 1].metricValue}.`,
          sampleSize: summary.trends.points.length,
          dateRange: summary.metadata.range,
          metric: metricLabel,
          dataStrength: summary.trends.points.length >= 5 ? "High" : "Moderate",
          limitations: "Reflects sensor observations over this window, not personal certainty.",
        });
      } else if (trajectory === "Falling") {
        insights.push({
          id: "ins_trend_down",
          category: "trend",
          title: `Reflective Pacing in ${metricLabel}`,
          observation: `Estimated ${metricLabel.toLowerCase()} signals indicate a shift toward more deliberate pacing and measured presence.`,
          supportingData: `Observed delta of -${Math.abs(
            summary.trends.trajectoryDelta
          )} points across ${summary.trends.points.length} sessions.`,
          sampleSize: summary.trends.points.length,
          dateRange: summary.metadata.range,
          metric: metricLabel,
          dataStrength: summary.trends.points.length >= 5 ? "High" : "Moderate",
          limitations: "Environmental conditions and interaction context naturally influence signal pacing.",
        });
      } else {
        insights.push({
          id: "ins_trend_stable",
          category: "trend",
          title: `Consistent ${metricLabel} Baseline`,
          observation: `Estimated ${metricLabel.toLowerCase()} metrics remained balanced and consistent across recent captures.`,
          supportingData: `Average metric reading is ${Math.round(
            summary.trends.points.reduce((a, b) => a + b.metricValue, 0) /
              summary.trends.points.length
          )}% across ${summary.trends.points.length} sessions.`,
          sampleSize: summary.trends.points.length,
          dateRange: summary.metadata.range,
          metric: metricLabel,
          dataStrength: summary.trends.points.length >= 4 ? "High" : "Moderate",
          limitations: "Steady signals reflect stable recording contexts.",
        });
      }
    }

    // 2. Modality Dominance or Consistency Insight
    const mix = summary.modalityDistribution.mix;
    const sortedMix = [...mix].sort((a, b) => b.count - a.count);
    const primaryModality = sortedMix[0];

    if (primaryModality && primaryModality.count > 0 && insights.length < 3) {
      const modName = primaryModality.type.charAt(0).toUpperCase() + primaryModality.type.slice(1);
      insights.push({
        id: "ins_modality_mix",
        category: "pattern",
        title: `${modName} Sessions Form Core Archive`,
        observation: `${modName} capture sessions represent ${primaryModality.percentage}% of your activity in this period with ${
          primaryModality.averageConfidence !== null ? `${primaryModality.averageConfidence}% average confidence` : "calibrated metrics"
        }.`,
        supportingData: `${primaryModality.count} of ${count} total sessions recorded in ${modName} mode.`,
        sampleSize: count,
        dateRange: summary.metadata.range,
        metric: "Modality Mix",
        dataStrength: count >= 5 ? "High" : "Moderate",
        limitations: "Specialized modality focus provides deeper single-channel depth than cross-modal breadth.",
      });
    }

    // 3. Signal Quality & Calibration Insight
    if (insights.length < 3) {
      insights.push({
        id: "ins_quality_integrity",
        category: "quality",
        title: `${summary.signalQuality.overallRating} Signal Integrity Observed`,
        observation: `Capture streams maintained a ${summary.signalQuality.overallScore}% average signal quality rating with minimal sensory distortion.`,
        supportingData: `Aggregated sensor telemetry across ${count} analyses in selected period.`,
        sampleSize: count,
        dateRange: summary.metadata.range,
        metric: "Signal Quality",
        dataStrength: "High",
        limitations: "Signal quality measures audio clarity, frame lighting, and landmark visibility.",
      });
    }

    // 4. Contextual Next Step / Recommendation (Smart recommendation logic based on actual gaps)
    const missingModalities = mix.filter((m) => m.count === 0);
    if (missingModalities.length > 0 && insights.length < 3) {
      const missing = missingModalities[0].type;
      const missingName = missing.charAt(0).toUpperCase() + missing.slice(1);
      let actionPath = "/body";
      let actionDesc = "Explore Body Language analysis to track posture alignment and gaze stability.";

      if (missing === "fusion") {
        actionPath = "/fusion";
        actionDesc = "Combine Image + Voice + Body in Multimodal Fusion for cross-modal concordance metrics.";
      } else if (missing === "voice") {
        actionPath = "/voice";
        actionDesc = "Record a vocal prosody session to analyze speech cadence, pitch, and energy.";
      } else if (missing === "image") {
        actionPath = "/image";
        actionDesc = "Analyze facial affect and visual composure in an image capture.";
      }

      insights.push({
        id: "ins_action_gap",
        category: "action",
        title: `Opportunity: Explore ${missingName} Analysis`,
        observation: `You have not recorded any ${missingName.toLowerCase()} sessions in this period. ${actionDesc}`,
        supportingData: `0 ${missingName.toLowerCase()} sessions recorded vs ${count} sessions in other modalities.`,
        sampleSize: count,
        dateRange: summary.metadata.range,
        metric: "Channel Coverage",
        dataStrength: "High",
        limitations: "Expanding modality diversity unlocks comprehensive tri-modal baseline calibration.",
        recommendedAction: {
          label: `Try ${missingName} Analysis`,
          path: actionPath,
        },
      });
    }

    return insights.slice(0, 3);
  }
}
