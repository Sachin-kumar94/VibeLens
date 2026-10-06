import { Router, Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/search?q=query
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query) {
      return res.json({
        success: true,
        data: {
          analyses: [],
          voices: [],
          journal: [],
          sessions: [],
          total: 0,
        },
      });
    }

    const [analyses, voices, journal, sessions] = await Promise.all([
      prisma.analysis.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { emotion: { contains: query } },
            { vibe: { contains: query } },
            { notes: { contains: query } },
          ],
        },
        orderBy: { timestamp: "desc" },
        take: 8,
      }),
      prisma.voiceAnalysis.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { emotion: { contains: query } },
            { tone: { contains: query } },
            { transcript: { contains: query } },
          ],
        },
        orderBy: { timestamp: "desc" },
        take: 8,
      }),
      prisma.journalEntry.findMany({
        where: {
          userId,
          OR: [
            { vibe: { contains: query } },
            { emotion: { contains: query } },
            { userNote: { contains: query } },
            { context: { contains: query } },
          ],
        },
        orderBy: { date: "desc" },
        take: 8,
      }),
      prisma.sessionReport.findMany({
        where: {
          userId,
          OR: [
            { summary: { contains: query } },
            { mode: { contains: query } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const total = analyses.length + voices.length + journal.length + sessions.length;

    res.json({
      success: true,
      query,
      data: {
        analyses,
        voices,
        journal,
        sessions,
        total,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Search execution failed", details: err.message });
  }
});

export default router;
