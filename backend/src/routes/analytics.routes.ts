import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { AnalyticsController } from "../controllers/analytics.controller.js";

const router = Router();

// GET /api/analytics - Dynamic user-scoped analytics
router.get("/", requireAuth, AnalyticsController.getAnalytics);

// GET /api/analytics/export - Downloadable analytics export
router.get("/export", requireAuth, AnalyticsController.exportAnalytics);

export default router;
