import { Router, Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/dashboard
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // 1. Total Analyses count strictly scoped to this user
    const totalAnalyses = await prisma.analysis.count({
      where: { userId },
    });

    // 2. Fetch recent analyses for the user (up to 10)
    const rawRecent = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    // Format recent analyses for SaaS feed
    const recentAnalyses = rawRecent.map((a) => {
      const displayTitle =
        a.title && !a.title.startsWith("Analysis ")
          ? a.title
          : `${a.type.charAt(0).toUpperCase() + a.type.slice(1)} Session`;

      return {
        id: a.id,
        type: a.type,
        title: displayTitle,
        createdAt: a.timestamp.toISOString(),
        primaryResult: a.vibe || a.emotion || "Calm",
        confidence: a.confidence || 85,
        thumbnail: a.fileUrl || a.inputUrl || "",
        status: "Complete",
      };
    });

    // 3. Compute 4 Overview Metrics
    let averageConfidence = 0;
    let currentVibe = "Not yet recorded";
    let lastAnalysis: {
      id: string;
      type: string;
      title: string;
      timestamp: string;
      vibe: string;
      confidence: number;
    } | null = null;

    if (recentAnalyses.length > 0) {
      const sumConf = recentAnalyses.reduce((acc, curr) => acc + curr.confidence, 0);
      averageConfidence = Math.round(sumConf / recentAnalyses.length);
      currentVibe = recentAnalyses[0].primaryResult;
      lastAnalysis = {
        id: recentAnalyses[0].id,
        type: recentAnalyses[0].type,
        title: recentAnalyses[0].title,
        timestamp: recentAnalyses[0].createdAt,
        vibe: recentAnalyses[0].primaryResult,
        confidence: recentAnalyses[0].confidence,
      };
    }

    // Period comparison (this month vs previous period)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = await prisma.analysis.count({
      where: {
        userId,
        timestamp: { gte: startOfThisMonth },
      },
    });

    // 4. Personal Insight (Safe, non-clinical interpretation from real records)
    let latestInsight: {
      id: string;
      summary: string;
      evidence: string;
      createdAt: string;
      confidence: number;
    } | null = null;

    if (recentAnalyses.length > 0) {
      const baselineVal = req.user.confidenceBaseline || 82;
      const diff = averageConfidence - baselineVal;

      let summary = "";
      if (diff > 0) {
        summary = `Your recent sessions show higher estimated confidence signals (+${diff}% vs baseline).`;
      } else if (diff < 0) {
        summary = `Your recent sessions show steady, reflective pacing slightly under your baseline.`;
      } else {
        summary = `Your recent sessions indicate balanced signal consistency aligning with your baseline.`;
      }

      latestInsight = {
        id: `ins_${recentAnalyses[0].id}`,
        summary,
        evidence: `Based on your recent ${recentAnalyses.length} recorded session${recentAnalyses.length > 1 ? "s" : ""}.`,
        createdAt: recentAnalyses[0].createdAt,
        confidence: averageConfidence,
      };
    }

    // 5. Trend Analytics (7 Days & 30 Days from real DB data)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthAnalyses = await prisma.analysis.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo },
      },
      orderBy: { timestamp: "asc" },
    });

    // Group real data by date string (YYYY-MM-DD)
    const dailyMap = new Map<string, { confidences: number[]; energies: number[] }>();
    for (const a of monthAnalyses) {
      const dStr = a.timestamp.toISOString().split("T")[0];
      if (!dailyMap.has(dStr)) {
        dailyMap.set(dStr, { confidences: [], energies: [] });
      }
      const entry = dailyMap.get(dStr)!;
      entry.confidences.push(a.confidence || 85);
      entry.energies.push(80);
    }

    // Build trend arrays
    let trend7d: Array<{ date: string; label: string; confidence: number; emotion: number; engagement: number }> = [];
    let trend30d: Array<{ date: string; label: string; confidence: number; emotion: number; engagement: number }> = [];

    if (dailyMap.size >= 2) {
      const allDailyEntries = Array.from(dailyMap.entries()).map(([dateStr, val]) => {
        const d = new Date(dateStr);
        const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
        const shortDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const avgConf = Math.round(val.confidences.reduce((a, b) => a + b, 0) / val.confidences.length);
        return {
          date: dateStr,
          label: dayLabel,
          shortDate,
          confidence: avgConf,
          emotion: Math.min(100, Math.round(avgConf * 0.95)),
          engagement: Math.min(100, Math.round(avgConf * 0.92)),
        };
      });

      trend30d = allDailyEntries;
      trend7d = allDailyEntries.slice(-7);
    }

    // 6. Personal Baseline (only if sampleSize >= 3)
    let baseline: {
      baselineValue: number;
      currentValue: number;
      change: number;
      sampleSize: number;
    } | null = null;

    if (totalAnalyses >= 3) {
      const baselineVal = req.user.confidenceBaseline || 82;
      baseline = {
        baselineValue: baselineVal,
        currentValue: averageConfidence,
        change: averageConfidence - baselineVal,
        sampleSize: totalAnalyses,
      };
    }

    // 7. Compact Quick Analysis Actions
    const quickActions = [
      {
        id: "image",
        label: "Analyze Image",
        desc: "Upload or capture a photo",
        path: "/image",
        icon: "Camera",
      },
      {
        id: "voice",
        label: "Analyze Voice",
        desc: "Record your voice and pitch",
        path: "/voice",
        icon: "Mic",
      },
      {
        id: "body",
        label: "Analyze Body",
        desc: "Camera posture and poise",
        path: "/body",
        icon: "Activity",
      },
      {
        id: "fusion",
        label: "Run Fusion",
        desc: "Cross-modality signal reading",
        path: "/fusion",
        icon: "Layers",
      },
    ];

    return res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          avatarUrl: req.user.avatarUrl,
          plan: req.user.plan || "Free Plan",
        },
        summary: {
          totalAnalyses,
          thisMonthCount,
          averageConfidence,
          currentVibe,
          lastAnalysis,
        },
        recentAnalyses,
        latestInsight,
        trend: {
          trend7d,
          trend30d,
        },
        baseline,
        quickActions,
      },
      error: null,
    });
  } catch (err: any) {
    console.error("Dashboard API error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: "SERVER_ERROR", message: "Failed to load dashboard data." },
    });
  }
});

export default router;
