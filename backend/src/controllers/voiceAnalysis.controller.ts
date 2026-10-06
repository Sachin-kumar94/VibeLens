import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../services/prisma.service.js";
import { VoiceAnalysisService } from "../services/voiceAnalysis.service.js";

export class VoiceAnalysisController {
  /**
   * POST /api/analyze/voice
   * Handles multipart/form-data audio file or demo/json payload
   */
  public static async analyzeVoice(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "You must be signed in to analyze voice recordings.",
        });
      }

      const file = req.file;
      const isDemo = req.body?.isDemo === "true" || req.body?.isDemo === true;
      const durationSeconds = req.body?.duration ? parseFloat(req.body.duration) : undefined;
      const speechText = req.body?.speechText;

      let qualityHint: any = undefined;
      if (req.body?.qualityHint) {
        try {
          qualityHint = typeof req.body.qualityHint === "string"
            ? JSON.parse(req.body.qualityHint)
            : req.body.qualityHint;
        } catch (e) {}
      }

      let fileUrl = "";
      let filePath = "";
      let fileName = "voice_sample.webm";
      let fileSize = 120000;
      let mimeType = "audio/webm";

      const rawAudioUrl = req.body?.audioUrl || req.body?.fileUrl;

      if (file) {
        fileUrl = `/uploads/${file.filename}`;
        filePath = file.path;
        fileName = file.originalname || file.filename;
        fileSize = file.size;
        mimeType = file.mimetype;
      } else if (rawAudioUrl) {
        fileUrl = rawAudioUrl;
        filePath = rawAudioUrl.startsWith("/uploads/")
          ? path.join(__dirname, "../../uploads", path.basename(rawAudioUrl))
          : "";
        fileName = path.basename(rawAudioUrl) || "voice_sample.webm";
        fileSize = 145000;
        mimeType = "audio/webm";
      } else if (isDemo) {
        fileUrl = "/assets/audio/sample_voice.webm";
        fileName = "demo_executive_briefing.webm";
        fileSize = 145000;
        mimeType = "audio/webm";
      } else {
        return res.status(400).json({
          success: false,
          error: "No audio file was received. Please record your voice or upload an audio file.",
        });
      }

      const { analysis, voiceRecordId, generalAnalysisId } = await VoiceAnalysisService.processAndSaveVoice(user.id, {
        filePath,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        durationSeconds,
        speechText,
        qualityHint,
        isDemo,
      });

      const durationMs = Date.now() - startTime;
      console.log(
        `✓ [VoiceAnalysis] User ${user.email} analyzed voice "${fileName}" (${analysis.duration}s) in ${durationMs}ms.`
      );

      return res.status(200).json({
        success: true,
        data: {
          ...analysis,
          id: generalAnalysisId || voiceRecordId,
          analysisId: generalAnalysisId || voiceRecordId,
          voiceRecordId,
          generalAnalysisId,
          durationMs,
        },
      });
    } catch (err: any) {
      console.error("Voice analysis error:", err);
      return res.status(500).json({
        success: false,
        error: "Voice analysis processing failed.",
        details: err.message || "An unexpected error occurred while analyzing audio.",
      });
    }
  }

  /**
   * GET /api/analyze/voice/history
   */
  public static async getVoiceHistory(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await VoiceAnalysisService.getUserVoiceHistory(user.id, limit);

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/analyze/voice/baseline
   */
  public static async getUserBaseline(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const baseline = await VoiceAnalysisService.calculateUserBaseline(user.id);
      return res.status(200).json({
        success: true,
        data: baseline,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/analyze/voice/:id
   */
  public static async getVoiceAnalysisById(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        return res.status(400).json({ success: false, error: "Voice analysis ID required." });
      }

      const analysis = await VoiceAnalysisService.getVoiceAnalysisById(user.id, id);
      if (!analysis) {
        return res.status(404).json({ success: false, error: "Analysis record not found." });
      }

      return res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (err: any) {
      const status = err.message?.includes("Unauthorized") ? 403 : 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/analyze/voice/:id/download
   * Streams the saved audio recording file as an attachment with strict ownership verification
   */
  public static async downloadVoiceRecording(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Authentication required to download recording." });
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        return res.status(400).json({ success: false, error: "Voice analysis ID required." });
      }

      const record = await prisma.voiceAnalysis.findUnique({
        where: { id },
      });

      if (!record) {
        return res.status(404).json({ success: false, error: "Recording record not found." });
      }

      // Verify user ownership
      if (record.userId !== user.id) {
        return res.status(403).json({ success: false, error: "Unauthorized: You do not have permission to download this recording." });
      }

      if (!record.audioUrl) {
        return res.status(404).json({ success: false, error: "No audio file associated with this recording." });
      }

      // Resolve file path on disk
      let filePath = "";
      if (record.audioUrl.startsWith("/uploads/")) {
        filePath = path.resolve(process.cwd(), "data", record.audioUrl.replace("/uploads/", "uploads/"));
      } else if (record.audioUrl.startsWith("/assets/")) {
        filePath = path.resolve(process.cwd(), "..", "client", "public", record.audioUrl.slice(1));
      } else {
        filePath = path.resolve(process.cwd(), "data", "uploads", path.basename(record.audioUrl));
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: "Audio file could not be found on server storage." });
      }

      const stat = fs.statSync(filePath);
      const mimeType = record.mimeType || "audio/webm";
      const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : mimeType.includes("wav") ? "wav" : "webm";
      const safeFilename = record.fileName
        ? record.fileName.replace(/[/\\?%*:|"<>]/g, "-")
        : `voice_session_${record.id}.${ext}`;

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
      res.setHeader("Content-Length", stat.size);
      res.setHeader("Accept-Ranges", "bytes");

      const stream = fs.createReadStream(filePath);
      stream.on("error", (err) => {
        console.error("Stream error during audio download:", err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: "Failed to stream audio file." });
        }
      });
      stream.pipe(res);
    } catch (err: any) {
      console.error("Download voice error:", err);
      return res.status(500).json({ success: false, error: "We couldn't download this recording." });
    }
  }

  /**
   * DELETE /api/analyze/voice/:id
   */
  public static async deleteVoiceAnalysis(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        return res.status(400).json({ success: false, error: "Voice analysis ID required." });
      }

      const result = await VoiceAnalysisService.deleteVoiceAnalysis(user.id, id);
      if (!result) {
        return res.status(404).json({ success: false, error: "Analysis record not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Voice recording and analysis deleted successfully.",
        deletedId: id,
      });
    } catch (err: any) {
      const status = err.message?.includes("Unauthorized") ? 403 : 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  }
}
