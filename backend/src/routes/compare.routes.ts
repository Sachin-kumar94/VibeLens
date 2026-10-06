import { Router } from "express";
import { CompareController } from "../controllers/compare.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/compare - Compare two sessions in real-time
router.post("/", requireAuth, CompareController.compareAnalyses);

// POST /api/compare/save - Save comparison to DB
router.post("/save", requireAuth, CompareController.saveComparison);

// GET /api/compare/recent - Get latest saved comparison
router.get("/recent", requireAuth, CompareController.getRecentComparison);

// GET /api/compare/:id - Retrieve specific comparison
router.get("/:id", requireAuth, CompareController.getComparisonById);

// DELETE /api/compare/:id - Delete comparison
router.delete("/:id", requireAuth, CompareController.deleteComparison);

export default router;
