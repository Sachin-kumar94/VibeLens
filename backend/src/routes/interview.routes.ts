import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { interviewController } from "../controllers/interview.controller.js";

const router = Router();

// Prepare uploads directory for interview media
const interviewUploadDir = path.resolve(process.cwd(), "data", "uploads", "interviews");
if (!fs.existsSync(interviewUploadDir)) {
  fs.mkdirSync(interviewUploadDir, { recursive: true });
}

const interviewMediaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, interviewUploadDir);
  },
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext || ext === ".") {
      if (file.mimetype.includes("mp4")) ext = ".mp4";
      else ext = ".webm";
    }
    const safeName = `interview_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, safeName);
  },
});

const interviewMediaFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedPrefixes = ["video/", "audio/"];
  const allowedExact = [
    "application/ogg",
    "application/octet-stream",
  ];
  if (
    allowedPrefixes.some((p) => file.mimetype.startsWith(p)) ||
    allowedExact.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported media format for interview recording."));
  }
};

const mediaUpload = multer({
  storage: interviewMediaStorage,
  limits: {
    fileSize: 80 * 1024 * 1024, // 80 MB max
    files: 1,
  },
  fileFilter: interviewMediaFilter,
});

const handleMediaUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  mediaUpload.single("media")(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "Recording exceeds 80MB limit. Please record a shorter answer.",
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// ==========================================
// ROUTES
// ==========================================

// Questions Bank & Custom Questions
router.get("/questions", optionalAuth, (req, res) => interviewController.getQuestions(req, res));
router.get("/questions/:id", optionalAuth, (req, res) => interviewController.getQuestionById(req, res));
router.post("/questions/custom", optionalAuth, (req, res) => interviewController.createCustomQuestion(req, res));
router.delete("/questions/:id", optionalAuth, (req, res) => interviewController.deleteCustomQuestion(req, res));
router.post("/questions/generate-from-jd", optionalAuth, (req, res) => interviewController.generateQuestionsFromJd(req, res));

// Skills & Mastery
router.get("/skills", optionalAuth, (req, res) => interviewController.getSkillProfile(req, res));

// Practice Sessions
router.post("/sessions", optionalAuth, (req, res) => interviewController.createSession(req, res));
router.get("/sessions/:id", optionalAuth, (req, res) => interviewController.getSession(req, res));
router.post("/sessions/:id/start", optionalAuth, (req, res) => interviewController.startSession(req, res));
router.post("/sessions/:id/next-question", optionalAuth, (req, res) => interviewController.getNextQuestion(req, res));
router.delete("/sessions/:id", optionalAuth, (req, res) => interviewController.deleteSession(req, res));
router.post("/sessions/:id/finish", optionalAuth, (req, res) => interviewController.finishSession(req, res));
router.get("/sessions/:id/report", optionalAuth, (req, res) => interviewController.getReport(req, res));
router.get("/sessions/:id/insights", optionalAuth, (req, res) => interviewController.getInsights(req, res));
router.get("/sessions/:id/integrity", optionalAuth, (req, res) => interviewController.getIntegritySummary(req, res));
router.post("/sessions/:id/integrity", optionalAuth, (req, res) => interviewController.recordIntegrityEvents(req, res));

// Answers & Evaluations & Follow-up
router.post("/sessions/:id/answers", optionalAuth, (req, res) => interviewController.saveAndEvaluateAnswer(req, res));
router.get("/answers/:id", optionalAuth, (req, res) => interviewController.getAnswer(req, res));
router.post("/answers/:id/follow-up", optionalAuth, (req, res) => interviewController.generateFollowUp(req, res));
router.get("/answers/:id/download", optionalAuth, (req, res) => interviewController.downloadAnswerMedia(req, res));

// Media Upload
router.post("/upload", optionalAuth, handleMediaUploadMiddleware, (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No media file provided." });
  }

  const fileUrl = `/uploads/interviews/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      fileUrl,
      fileName: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

export default router;
