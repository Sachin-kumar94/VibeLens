import { Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { AnalyticsNormalizer } from "../services/analytics/analyticsNormalizer.js";
import { AnalyticsAggregator, AnalyticsFilterOptions } from "../services/analytics/analyticsAggregator.js";
import { InsightEngine } from "../services/analytics/insightEngine.js";

export class AnalyticsController {
  /**
   * GET /api/analytics
   * Returns aggregated real-time personal analytics for the authenticated user
   */
  public static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      // Extract filter options from query parameters
      const filterOptions: AnalyticsFilterOptions = {
        range: (req.query.range as any) || "30d",
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        modality: (req.query.modality as any) || "all",
        metric: (req.query.metric as string) || "confidence",
        context: req.query.context as string,
      };

      // Fetch all analyses owned by this user
      const rawAnalyses = await prisma.analysis.findMany({
        where: { userId },
        orderBy: { timestamp: "asc" },
      });

      // Normalize all records
      const normalizedRecords = rawAnalyses.map((r) => AnalyticsNormalizer.normalize(r));

      // User personal baseline setting
      const userBaseline = req.user.confidenceBaseline || 82;

      // Compute aggregations, trends, and KPIs
      const summaryResult = AnalyticsAggregator.aggregate(
        normalizedRecords,
        filterOptions,
        userBaseline
      );

      // Generate dynamic personalized insights
      const insights = InsightEngine.generateInsights(summaryResult, normalizedRecords);

      return res.json({
        success: true,
        data: {
          summary: summaryResult.kpis,
          trends: summaryResult.trends,
          emotionDistribution: summaryResult.emotionDistribution,
          modalityDistribution: summaryResult.modalityDistribution,
          signalQuality: summaryResult.signalQuality,
          insights,
          baseline: summaryResult.baseline,
          recentActivity: summaryResult.recentActivity,
          metadata: summaryResult.metadata,
        },
        metadata: summaryResult.metadata,
        error: null,
      });
    } catch (err: any) {
      console.error("Error generating analytics:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to load analytics workspace",
        details: err.message,
      });
    }
  }

  /**
   * GET /api/analytics/export
   * Exports sanitized analytics dataset in CSV, JSON, or text format
   */
  public static async exportAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const format = (req.query.format as string) || "json";

      const rawAnalyses = await prisma.analysis.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
      });

      const normalized = rawAnalyses.map((r) => AnalyticsNormalizer.normalize(r));

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=vibelens-analytics.csv");

        const headers = [
          "ID",
          "Timestamp",
          "Modality",
          "Title",
          "Confidence",
          "SignalQualityScore",
          "SignalQualityRating",
          "Emotion",
          "Vibe",
          "Context",
        ];

        const rows = normalized.map((r) => [
          r.id,
          r.timestamp.toISOString(),
          r.type,
          `"${r.title.replace(/"/g, '""')}"`,
          r.confidence,
          r.signalQualityScore,
          r.signalQualityRating,
          `"${r.emotion}"`,
          `"${r.vibe}"`,
          `"${(r.context || "").replace(/"/g, '""')}"`,
        ]);

        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        return res.send(csvContent);
      }

      // JSON export (sanitized without private secrets or session tokens)
      const exportJson = {
        meta: {
          app: "VibeLens Personal Signal Analytics",
          exportedAt: new Date().toISOString(),
          totalRecords: normalized.length,
        },
        records: normalized.map((r) => ({
          id: r.id,
          date: r.timestamp.toISOString(),
          type: r.type,
          title: r.title,
          confidence: r.confidence,
          signalQuality: r.signalQualityRating,
          emotion: r.emotion,
          vibe: r.vibe,
          context: r.context,
          metrics: r.metrics,
        })),
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=vibelens-analytics.json");
      return res.json(exportJson);
    } catch (err: any) {
      console.error("Export error:", err);
      return res.status(500).json({ success: false, error: "Failed to export analytics" });
    }
  }
}
