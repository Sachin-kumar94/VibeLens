import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../services/prisma.service.js";
import { ImageAnalyzer } from "../services/ai/imageAnalyzer.js";
import { ContentService } from "../services/content.service.js";

export class ImageAnalysisController {
  /**
   * POST /api/analyze/image
   * Handles multipart image upload, AI analysis, and auto-persistence to user record
   */
  public static async analyzeImage(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "You must be signed in to analyze images.",
        });
      }

      const file = req.file;
      const isDemo = req.body?.isDemo === "true" || req.body?.isDemo === true;

      // Allow demo analysis without file if explicitly requested
      let fileUrl = "/assets/editorial/hero-editorial-woman.jpg";
      let filePath = "";
      let fileName = "demo-portrait.jpg";
      let fileSize = 450000;
      let mimeType = "image/jpeg";

      const rawImageUrl = req.body?.imageUrl || req.body?.fileUrl;

      if (file) {
        fileUrl = `/uploads/${file.filename}`;
        filePath = file.path;
        fileName = file.originalname;
        fileSize = file.size;
        mimeType = file.mimetype;
      } else if (rawImageUrl) {
        fileUrl = rawImageUrl;
        fileName = path.basename(rawImageUrl) || "provided_image.jpg";
        filePath = path.resolve(process.cwd(), "..", "frontend", "public", rawImageUrl.replace(/^\//, ""));
        fileSize = 450000;
        mimeType = rawImageUrl.endsWith(".png") ? "image/png" : rawImageUrl.endsWith(".webp") ? "image/webp" : "image/jpeg";
      } else if (!isDemo) {
        return res.status(400).json({
          success: false,
          error: "No image file was uploaded. Please select a JPG, PNG or WEBP file.",
        });
      }

      // Execute AI Analysis
      const analysisResult = await ImageAnalyzer.analyze({
        imagePath: filePath,
        imageUrl: fileUrl,
        fileName,
        fileSize,
        mimeType,
        isDemo,
      });

      // Persist to relational database under user's ownership
      const createdRecord = await prisma.analysis.create({
        data: {
          userId: user.id,
          type: "image",
          title: analysisResult.title || `Visual Analysis: ${fileName}`,
          fileUrl,
          fileName,
          inputUrl: fileUrl,
          inputText: analysisResult.scene || "Image",
          emotion: `${analysisResult.primaryEmotion} (${analysisResult.primaryEmotionConfidence}%)`,
          confidence: analysisResult.aiConfidence || 90,
          vibe: analysisResult.vibe,
          signalQuality: analysisResult.signalQuality,
          qualityReason:
            analysisResult.signalQualityReasons.join(". ") ||
            "Signal quality calculated from visual parameters.",
          context: analysisResult.scene,
          signalsData: JSON.stringify(analysisResult.objects || []),
          emotionData: JSON.stringify(analysisResult.emotionDistribution || []),
          vibeData: JSON.stringify(analysisResult.vibeRadialProfile || {}),
          insightsData: JSON.stringify(analysisResult.insights || []),
          recommendations: JSON.stringify(analysisResult.recommendations || []),
          explanationData: JSON.stringify(analysisResult.evidence || {}),
          isDemo: analysisResult.isDemo,
        },
      });

      const durationMs = Date.now() - startTime;
      console.log(
        `✓ [ImageAnalysis] User ${user.email} successfully analyzed image "${fileName}" (ID: ${createdRecord.id}) in ${durationMs}ms.`
      );

      return res.status(200).json({
        success: true,
        data: {
          ...analysisResult,
          id: createdRecord.id,
          analysisId: createdRecord.id,
          savedAt: createdRecord.createdAt.toISOString(),
          durationMs,
        },
      });
    } catch (err: any) {
      console.error("Image analysis execution error:", err);
      return res.status(500).json({
        success: false,
        error: "We couldn't complete the analysis.",
        reason: err.message || "An unexpected error occurred during visual processing.",
      });
    }
  }

  /**
   * GET /api/analyses/:id
   * Retrieves a specific analysis with user ownership validation
   */
  public static async getAnalysisById(req: Request, res: Response) {
    try {
      const user = req.user;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!id) {
        return res.status(400).json({ success: false, error: "Analysis ID is required." });
      }

      if (!user) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const record = await prisma.analysis.findUnique({
        where: { id },
        include: { generatedContents: true },
      });

      if (!record) {
        return res.status(404).json({ success: false, error: "Analysis record not found." });
      }

      // Verify ownership
      if (record.userId !== user.id) {
        return res.status(403).json({
          success: false,
          error: "You do not have permission to access this analysis.",
        });
      }

      // Reconstruct normalized structure
      let emotionDist: any[] = [];
      let objectsList: any[] = [];
      let vibeProfile: any = {};
      let insights: string[] = [];
      let recs: string[] = [];
      let evidence: any = {};

      try { emotionDist = JSON.parse(record.emotionData || "[]"); } catch (e) {}
      try { objectsList = JSON.parse(record.signalsData || "[]"); } catch (e) {}
      try { vibeProfile = JSON.parse(record.vibeData || "{}"); } catch (e) {}
      try { insights = JSON.parse(record.insightsData || "[]"); } catch (e) {}
      try { recs = JSON.parse(record.recommendations || "[]"); } catch (e) {}
      try { evidence = JSON.parse(record.explanationData || "{}"); } catch (e) {}

      return res.status(200).json({
        success: true,
        data: {
          id: record.id,
          analysisId: record.id,
          title: record.title,
          type: record.type,
          fileUrl: record.fileUrl,
          fileName: record.fileName,
          timestamp: record.timestamp.toISOString(),
          primaryEmotion: (record.emotion || "Calm").split(" (")[0],
          primaryEmotionConfidence: record.confidence || 88,
          emotionExplanation:
            evidence.expression ||
            "Observed facial signals correlate with measured composure and focus.",
          emotionDistribution: emotionDist,
          scene: record.context || "Workspace",
          sceneConfidence: 87,
          sceneContext: [record.context || "Natural environment"],
          objects: objectsList,
          colorPalette: [
            { name: "Warm Parchment", hex: "#F6F3EC" },
            { name: "Deep Charcoal", hex: "#17191A" },
            { name: "Sage Green", hex: "#6F8778" },
          ],
          colorTone: "Warm",
          vibe: record.vibe || "Grounded",
          vibeConfidence: record.confidence || 88,
          vibeRadialProfile: vibeProfile,
          evidence,
          signalQuality: record.signalQuality || "Good",
          signalQualityScore: 88,
          signalQualityReasons: [record.qualityReason || "Clean framing verified"],
          aiConfidence: record.confidence || 88,
          insights,
          recommendations: recs,
          isDemo: record.isDemo,
          savedAt: record.createdAt.toISOString(),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * DELETE /api/analyses/:id
   * Deletes analysis verifying user ownership
   */
  public static async deleteAnalysis(req: Request, res: Response) {
    try {
      const user = req.user;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!id) {
        return res.status(400).json({ success: false, error: "Analysis ID is required." });
      }

      if (!user) {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const existing = await prisma.analysis.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: "Record not found." });
      }

      if (existing.userId !== user.id) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized: You can only delete your own analyses.",
        });
      }

      // Delete disk file if in /uploads
      if (existing.fileUrl && existing.fileUrl.startsWith("/uploads/")) {
        const localPath = path.resolve(process.cwd(), "data", existing.fileUrl.replace("/uploads/", "uploads/"));
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
          } catch (e) {}
        }
      }

      await prisma.analysis.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: "Analysis removed permanently from your history.",
        deletedId: id,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/content/captions
   */
  public static async generateCaptions(req: Request, res: Response) {
    try {
      const result = await ContentService.generateCaptions(req.body);

      // Optionally save to GeneratedContent if user is present
      if (req.user && req.body.analysisId) {
        try {
          await prisma.generatedContent.create({
            data: {
              userId: req.user.id,
              analysisId: req.body.analysisId,
              type: "caption",
              platform: req.body.platform || "Instagram",
              content: JSON.stringify(result.captions),
            },
          });
        } catch (e) {}
      }

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/content/hashtags
   */
  public static async generateHashtags(req: Request, res: Response) {
    try {
      const result = await ContentService.generateHashtags(req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/content/music
   */
  public static async suggestMusic(req: Request, res: Response) {
    try {
      const result = await ContentService.suggestMusic(req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/content/translate
   */
  public static async translateCaption(req: Request, res: Response) {
    try {
      const result = await ContentService.translateCaption(req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
