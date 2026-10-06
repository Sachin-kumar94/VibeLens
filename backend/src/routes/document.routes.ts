import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { documentController } from "../controllers/document.controller.js";

const router = Router();

// Prepare uploads directory for user documents
const docsUploadDir = path.resolve(process.cwd(), "data", "uploads", "documents");
if (!fs.existsSync(docsUploadDir)) {
  fs.mkdirSync(docsUploadDir, { recursive: true });
}

const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, docsUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const safeName = `doc_${safeBase}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    cb(null, safeName);
  },
});

const documentFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExts = [".pdf", ".docx", ".doc", ".txt", ".md"];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "text/markdown",
    "application/octet-stream",
  ];

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported document type. Please upload a PDF, DOCX, or TXT file."));
  }
};

const docUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
    files: 1,
  },
  fileFilter: documentFilter,
});

const handleDocUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  docUpload.single("file")(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "Document file exceeds 25MB limit. Please upload a smaller file.",
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

// Upload and ingest a document (Resume, Study Material, JD)
router.post("/upload", optionalAuth, handleDocUploadMiddleware, (req, res) =>
  documentController.upload(req, res)
);

// Paste Job Description text directly
router.post("/job-description/text", optionalAuth, (req, res) =>
  documentController.pasteJobDescription(req, res)
);

// List user documents
router.get("/", optionalAuth, (req, res) => documentController.list(req, res));

// Active parsed resume
router.get("/resume/active", optionalAuth, (req, res) =>
  documentController.getActiveResume(req, res)
);

// Search user study material chunks
router.get("/search", optionalAuth, (req, res) => documentController.search(req, res));

// Get single document with chunk preview
router.get("/:id", optionalAuth, (req, res) => documentController.getById(req, res));

// Toggle document inclusion in interview question generation
router.patch("/:id/toggle", optionalAuth, (req, res) =>
  documentController.toggleSelection(req, res)
);

// Delete document and chunks
router.delete("/:id", optionalAuth, (req, res) => documentController.delete(req, res));

export default router;
