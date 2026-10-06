import { Router, Request, Response } from "express";
import { ImageAnalysisController } from "../controllers/imageAnalysis.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { handleImageUpload } from "../middleware/upload.middleware.js";
import { BodyAnalyzer } from "../services/ai/bodyAnalyzer.js";
import { FusionAnalyzer } from "../services/ai/fusionAnalyzer.js";
import { prisma } from "../services/prisma.service.js";
import { VoiceAnalysisController } from "../controllers/voiceAnalysis.controller.js";
import { handleAudioUpload } from "../middleware/upload.middleware.js";

const router = Router();

// POST /api/analyze/image - Multipart image upload & AI analysis
router.post("/image", requireAuth, handleImageUpload, ImageAnalysisController.analyzeImage);

// Voice Analysis Endpoints
router.post("/voice", requireAuth, handleAudioUpload, VoiceAnalysisController.analyzeVoice);
router.get("/voice/history", requireAuth, VoiceAnalysisController.getVoiceHistory);
router.get("/voice/baseline", requireAuth, VoiceAnalysisController.getUserBaseline);
router.get("/voice/:id", requireAuth, VoiceAnalysisController.getVoiceAnalysisById);
router.get("/voice/:id/download", requireAuth, VoiceAnalysisController.downloadVoiceRecording);
router.delete("/voice/:id", requireAuth, VoiceAnalysisController.deleteVoiceAnalysis);

import { BodyAnalysisController } from "../controllers/bodyAnalysis.controller.js";
import { FusionController } from "../controllers/fusion.controller.js";

// Body Language Analysis Endpoints
router.post("/body", requireAuth, handleImageUpload, BodyAnalysisController.analyzeBody);
router.get("/body/history", requireAuth, BodyAnalysisController.getBodyHistory);
router.get("/body/sample", BodyAnalysisController.getStudioSample);
router.get("/body/:id", requireAuth, BodyAnalysisController.getBodyAnalysisById);
router.delete("/body/:id", requireAuth, BodyAnalysisController.deleteBodyAnalysis);

// Multimodal Fusion Routes
router.post("/fusion", requireAuth, FusionController.synthesizeFusion);
router.get("/fusion/history", requireAuth, FusionController.getFusionHistory);
router.get("/fusion/:id", requireAuth, FusionController.getFusionById);
router.delete("/fusion/:id", requireAuth, FusionController.deleteFusion);
router.post("/fusion/:id/journal", requireAuth, FusionController.addToJournal);

// GET /api/analyses/all - Get all user analyses scoped to authenticated user
router.get("/all", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

    const whereClause: any = { userId };
    if (type && type !== "all") {
      whereClause.type = type;
    }

    const analyses = await prisma.analysis.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    res.json({
      success: true,
      data: analyses,
      count: analyses.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to retrieve analyses", details: err.message });
  }
});

// POST /api/analyze/batch - Record and manage multi-item batch queues
router.post("/batch", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { title = "Batch Image Queue", items = [] } = req.body;

    const batch = await prisma.batchAnalysis.create({
      data: {
        userId,
        title,
        status: "COMPLETED",
        totalItems: items.length,
        completedCount: items.filter((it: any) => it.status !== "failed").length,
        failedCount: items.filter((it: any) => it.status === "failed").length,
        items: {
          create: items.map((it: any) => ({
            fileName: it.name || "image.jpg",
            fileUrl: it.preview || it.fileUrl || null,
            status: it.status === "failed" ? "FAILED" : "COMPLETED",
            progress: 100,
            emotion: it.emotion || "Calm & Centered",
            confidence: it.confidence || 88,
            vibe: it.vibe || "Composed Focus",
            errorMessage: it.errorMessage || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.json({ success: true, data: batch });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to persist batch queue", details: err.message });
  }
});

// GET /api/analyze/batch - Retrieve batch histories for user
router.get("/batch", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const batches = await prisma.batchAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 20,
    });
    res.json({ success: true, data: batches });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to fetch batch histories", details: err.message });
  }
});

// GET /api/analyze/batch/:id - Retrieve specific batch with items
router.get("/batch/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const batch = await prisma.batchAnalysis.findFirst({
      where: { id, userId: req.user.id },
      include: { items: true },
    });
    if (!batch) {
      return res.status(404).json({ success: false, error: "Batch not found" });
    }
    res.json({ success: true, data: batch });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to fetch batch", details: err.message });
  }
});

// GET /api/analyses/:id - Retrieve specific analysis by ID
router.get("/:id", requireAuth, ImageAnalysisController.getAnalysisById);

// DELETE /api/analyses/:id - Delete analysis with ownership validation
router.delete("/:id", requireAuth, ImageAnalysisController.deleteAnalysis);

export default router;
