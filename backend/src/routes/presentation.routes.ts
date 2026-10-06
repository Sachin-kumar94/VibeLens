import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { presentationController } from "../controllers/presentation.controller.js";

const router = Router();

router.post("/sessions", requireAuth, (req, res) => presentationController.createSession(req, res));
router.post("/sessions/analyze", requireAuth, (req, res) => presentationController.analyzeSession(req, res));
router.get("/sessions", requireAuth, (req, res) => presentationController.getSessions(req, res));
router.get("/sessions/:id", requireAuth, (req, res) => presentationController.getSession(req, res));
router.delete("/sessions/:id", requireAuth, (req, res) => presentationController.deleteSession(req, res));
router.post("/sessions/:id/journal", requireAuth, (req, res) => presentationController.addToJournal(req, res));
router.get("/sessions/:id/report", requireAuth, (req, res) => presentationController.exportReport(req, res));

export default router;
