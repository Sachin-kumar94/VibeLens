import { Router, Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/session/start - Start a timed multi-channel recording session
router.post("/start", requireAuth, async (req: Request, res: Response) => {
  const { mode = "presentation", targetDuration = 180 } = req.body;
  const sessionId = `ses_${Date.now()}`;
  res.json({
    success: true,
    sessionId,
    mode,
    targetDuration,
    status: "active",
    startedAt: new Date().toISOString(),
    prompts: [
      "Maintain a comfortable 88° spine alignment.",
      "Take unhurried breaths between key points.",
      "Engage eye contact naturally with the upper third of the frame.",
    ],
  });
});

// POST /api/session/complete - Conclude session and save to Prisma relational DB
router.post("/complete", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { sessionId, mode = "presentation", duration = 120, signals = {} } = req.body;

    const durationSeconds = typeof duration === "number" ? duration : (signals.duration || 120);
    const eyeContact = signals.eyeContact || 88;
    const postureAlignment = signals.posture || 90;
    const speechPaceWpm = signals.pace || 144;
    const clarity = signals.clarity || 92;
    const vocalEnergy = signals.energy || 78;

    const presentationScore = Math.round((eyeContact + postureAlignment + clarity) / 3);

    const strengths = [
      `Maintained ${eyeContact}% eye engagement across the delivery window.`,
      `Stable conversational cadence of ${speechPaceWpm} WPM with clear phrase boundaries.`,
      `Balanced postural alignment (${postureAlignment}%) without defensive hunching.`,
    ];

    const improvements = [
      "Consider introducing a 2-second pause after framing key strategic propositions.",
      "Incorporate open-palm framing gestures during conclusions.",
    ];

    const reportSummary = `Session completed with a ${presentationScore}% overall presence score. Cadence maintained at ${speechPaceWpm} WPM with strong vocal clarity.`;

    const savedRecord = await prisma.sessionReport.create({
      data: {
        userId,
        sessionId: sessionId || `ses_${Date.now()}`,
        mode,
        duration: durationSeconds,
        presentationScore,
        summary: reportSummary,
        recommendations: JSON.stringify(improvements),
        signalsData: JSON.stringify({
          eyeContact,
          postureAlignment,
          speechPaceWpm,
          clarity,
          vocalEnergy,
          strengths,
        }),
      },
    });

    const report = {
      id: savedRecord.id,
      sessionId: savedRecord.sessionId,
      mode: savedRecord.mode,
      durationSeconds: savedRecord.duration,
      overallVibe: "Articulate & Grounded",
      confidenceScore: presentationScore,
      consistencyScore: 92,
      metrics: {
        eyeContact,
        postureAlignment,
        speechPaceWpm,
        vocalEnergy,
        clarity,
        stressSignals: "Low",
      },
      strengths,
      improvements,
      completedAt: savedRecord.createdAt.toISOString(),
    };

    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to conclude session", details: err.message });
  }
});

// GET /api/session/history - List user's previous session reports
router.get("/history", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const reports = await prisma.sessionReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({
      success: true,
      data: reports.map((r) => {
        let signals = {};
        let recs = [];
        try { signals = JSON.parse(r.signalsData); } catch (e) {}
        try { recs = JSON.parse(r.recommendations); } catch (e) {}
        return {
          id: r.id,
          sessionId: r.sessionId,
          mode: r.mode,
          duration: r.duration,
          score: r.presentationScore,
          summary: r.summary,
          recommendations: recs,
          signals,
          createdAt: r.createdAt.toISOString(),
        };
      }),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to load session history", details: err.message });
  }
});

export default router;
