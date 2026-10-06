import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const uploadDir = path.resolve(process.cwd(), "data", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with secure sanitized filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const randomName = `img_${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, randomName);
  },
});

// Strict MIME type filter: only image/jpeg, image/png, image/webp
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Please upload a JPG, PNG or WEBP image."
      )
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter,
});

// Middleware wrapper with human-readable error handling
export const handleImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const singleUpload = upload.single("image");

  singleUpload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "This image is larger than 10 MB. Please choose a smaller image.",
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || "Failed to process image upload.",
      });
    }
    next();
  });
};

// Audio storage configuration
const audioStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext || ext === ".") {
      if (file.mimetype.includes("webm")) ext = ".webm";
      else if (file.mimetype.includes("wav")) ext = ".wav";
      else if (file.mimetype.includes("ogg")) ext = ".ogg";
      else if (file.mimetype.includes("mp4") || file.mimetype.includes("m4a")) ext = ".m4a";
      else ext = ".mp3";
    }
    const randomName = `audio_${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, randomName);
  },
});

const audioFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimePrefixes = ["audio/"];
  const allowedExact = [
    "video/webm", // Chrome and Firefox often record audio with video/webm container
    "video/mp4",
    "application/ogg",
    "application/octet-stream",
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".webm", ".wav", ".mp3", ".ogg", ".m4a", ".aac", ".flac", ".mp4"];

  const isMimeOk =
    allowedMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix)) ||
    allowedExact.includes(file.mimetype);
  const isExtOk = !ext || allowedExtensions.includes(ext);

  if (isMimeOk || isExtOk) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported audio format. Please upload a WAV, MP3, WEBM, OGG or M4A audio file."
      )
    );
  }
};

const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB
    files: 1,
  },
  fileFilter: audioFileFilter,
});

export const handleAudioUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uploadHandler = audioUpload.single("audio");

  uploadHandler(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "Audio file exceeds the maximum 30 MB size limit. Please upload or record a shorter clip.",
        });
      }
      return res.status(400).json({
        success: false,
        error: `Audio upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || "Failed to process audio file upload.",
      });
    }
    next();
  });
};
