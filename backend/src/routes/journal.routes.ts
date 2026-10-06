import { Router, Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/journal - List user journal entries
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    let entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // If user has no entries yet, seed a personalized first entry so the journal isn't a dead-end
    if (entries.length === 0) {
      const firstEntry = await prisma.journalEntry.create({
        data: {
          userId,
          vibe: "Reflective Composure",
          emotion: "Calm & Centered",
          confidence: 88,
          context: "Initial Signal Baseline",
          userNote: "Welcome to your personal signal intelligence journal. Log daily reflections, link analyses, or track your non-verbal progress.",
          signalsData: JSON.stringify(["Steady vocal prosody", "Balanced gaze alignment"]),
          sourceMode: "onboarding",
        },
      });
      entries = [firstEntry];
    }

    const formatted = entries.map((e) => {
      let signalsObserved = [];
      try {
        signalsObserved = typeof e.signalsData === "string" ? JSON.parse(e.signalsData) : [];
      } catch (err) {}

      return {
        id: e.id,
        date: e.date.toISOString(),
        analysisId: e.analysisId,
        vibe: e.vibe,
        emotion: e.emotion,
        confidence: e.confidence,
        context: e.context,
        userNote: e.userNote,
        signalsObserved,
        sourceMode: e.sourceMode,
      };
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to load journal entries", details: err.message });
  }
});

// POST /api/journal - Create journal entry
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { vibe, emotion, confidence, context, userNote, signalsObserved, sourceMode, analysisId } = req.body;

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        analysisId: analysisId || null,
        vibe: vibe || "Reflective Flow",
        emotion: emotion || "Calm & Centered",
        confidence: typeof confidence === "number" ? confidence : 88,
        context: context || "General Reflection",
        userNote: userNote || "",
        signalsData: JSON.stringify(signalsObserved || ["Calm breath", "Clear presence"]),
        sourceMode: sourceMode || "manual",
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: entry.id,
        date: entry.date.toISOString(),
        analysisId: entry.analysisId,
        vibe: entry.vibe,
        emotion: entry.emotion,
        confidence: entry.confidence,
        context: entry.context,
        userNote: entry.userNote,
        signalsObserved: signalsObserved || ["Calm breath", "Clear presence"],
        sourceMode: entry.sourceMode,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to create journal entry", details: err.message });
  }
});

// PUT /api/journal/:id - Update journal entry
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.journalEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, error: "Journal entry not found." });
    }

    const { vibe, emotion, confidence, context, userNote, signalsObserved } = req.body;

    const updateData: any = {};
    if (vibe !== undefined) updateData.vibe = vibe;
    if (emotion !== undefined) updateData.emotion = emotion;
    if (confidence !== undefined) updateData.confidence = confidence;
    if (context !== undefined) updateData.context = context;
    if (userNote !== undefined) updateData.userNote = userNote;
    if (signalsObserved !== undefined) updateData.signalsData = JSON.stringify(signalsObserved);

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        date: updated.date.toISOString(),
        analysisId: updated.analysisId,
        vibe: updated.vibe,
        emotion: updated.emotion,
        confidence: updated.confidence,
        context: updated.context,
        userNote: updated.userNote,
        signalsObserved: signalsObserved || [],
        sourceMode: updated.sourceMode,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to update journal entry", details: err.message });
  }
});

// DELETE /api/journal/:id - Delete journal entry
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.journalEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, error: "Journal entry not found." });
    }

    await prisma.journalEntry.delete({ where: { id } });

    res.json({
      success: true,
      message: "Journal entry removed successfully.",
      deletedId: id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to delete journal entry", details: err.message });
  }
});

export default router;
