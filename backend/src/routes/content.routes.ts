import { Router } from "express";
import { ImageAnalysisController } from "../controllers/imageAnalysis.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Content generation endpoints (Captions, Hashtags, Music, Translation)
router.post("/captions", requireAuth, ImageAnalysisController.generateCaptions);
router.post("/hashtags", requireAuth, ImageAnalysisController.generateHashtags);
router.post("/music", requireAuth, ImageAnalysisController.suggestMusic);
router.post("/translate", requireAuth, ImageAnalysisController.translateCaption);

export default router;
