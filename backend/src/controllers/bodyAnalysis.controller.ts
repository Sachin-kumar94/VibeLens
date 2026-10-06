import { Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { BodyAnalyzerEngine, BodyAnalysisInput } from "../services/vision/bodyAnalyzer.js";
import fs from "fs";
import path from "path";

export class BodyAnalysisController {
  /**
   * POST /api/analyze/body
   * Analyzes an uploaded portrait photo or camera snapshot with pose landmarks.
   */
  public static async analyzeBody(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user || !user.id) {
        res.status(401).json({ success: false, error: "Unauthorized access." });
        return;
      }

      const file = req.file;
      const isDemo = req.body?.isDemo === "true" || req.body?.isDemo === true;
      const sourceType = (req.body?.sourceType as "camera" | "upload" | "sample") || (isDemo ? "sample" : file ? "upload" : "camera");
      const captureMode = (req.body?.captureMode as "portrait" | "upper_body" | "full_body") || "portrait";

      let landmarks = undefined;
      if (req.body?.landmarks) {
        try {
          landmarks = typeof req.body.landmarks === "string" ? JSON.parse(req.body.landmarks) : req.body.landmarks;
        } catch (e) {
          console.warn("[BodyAnalysisController] Could not parse landmarks JSON:", e);
        }
      }

      let qualityHint = undefined;
      if (req.body?.qualityHint) {
        try {
          qualityHint = typeof req.body.qualityHint === "string" ? JSON.parse(req.body.qualityHint) : req.body.qualityHint;
        } catch (e) {}
      }

      let imageUrl: string | null = null;
      let storageKey: string | null = null;
      let width = 1080;
      let height = 1920;
      let fileSize = 0;

      if (file) {
        imageUrl = `/uploads/${file.filename}`;
        storageKey = file.filename;
        fileSize = file.size;
      } else if (req.body?.imageUrl && typeof req.body.imageUrl === "string") {
        imageUrl = req.body.imageUrl;
      } else if (isDemo) {
        imageUrl = "/assets/editorial/body-man-frontal.jpg";
      }

      if (req.body?.width) width = parseInt(req.body.width, 10) || 1080;
      if (req.body?.height) height = parseInt(req.body.height, 10) || 1920;

      const analysisInput: BodyAnalysisInput = {
        imageUrl: imageUrl || undefined,
        fileName: file?.originalname || "portrait_capture.jpg",
        fileSize,
        width,
        height,
        captureMode,
        sourceType,
        landmarks,
        qualityHint,
        isDemo,
      };

      // Run real kinematic analysis
      const result = BodyAnalyzerEngine.analyze(analysisInput);

      // Save to specialized BodyAnalysis table
      const bodyRecord = await prisma.bodyAnalysis.create({
        data: {
          userId: user.id,
          title: result.title,
          sourceType,
          imageUrl,
          storageKey,
          width,
          height,
          captureMode,
          eyeContact: result.gaze.score,
          posture: result.posture.score,
          gestures: result.gestures.activity === "Active" ? 92 : result.gestures.activity === "Moderate" ? 85 : 74,
          focus: result.gaze.score,
          engagement: result.engagement.score,
          attention: result.gaze.score,
          concentration: result.posture.score,
          communicationEffectiveness: Math.round((result.posture.score + result.gaze.score + result.engagement.score) / 3),
          confidence: result.confidence,
          bodyState: result.posture.state,
          postureSignal: result.posture.state,
          postureScore: result.posture.score,
          gazeSignal: result.gaze.direction,
          gazeScore: result.gaze.score,
          gestureSignal: result.gestures.activity,
          movementStability: result.movementStability.stability,
          modelConfidence: result.confidence,
          signalQualityScore: result.signalQuality.score,
          framing: result.signalQuality.framing,
          lighting: result.signalQuality.lighting,
          bodyVisibility: result.signalQuality.personVisibility,
          cameraStability: result.movementStability.jitterRating,
          signalQuality: result.signalQuality.rating,
          qualityReason: result.evidence.whyThisResult,
          evidenceData: JSON.stringify(result.evidence),
          observationsData: JSON.stringify(result.observations),
          coachInsights: JSON.stringify(result.coach),
          isDemo,
        },
      });

      // Save to unified Analysis table for cross-modal History, Dashboard & Analytics
      const generalRecord = await prisma.analysis.create({
        data: {
          userId: user.id,
          type: "body",
          title: "Body Language Analysis",
          fileUrl: imageUrl,
          fileName: file?.originalname || "portrait_capture.jpg",
          emotion: result.posture.state,
          confidence: result.confidence,
          vibe: result.engagement.presenceDescriptor,
          signalQuality: result.signalQuality.rating,
          qualityReason: result.evidence.whyThisResult,
          context: `${captureMode} capture (${width}x${height})`,
          signalsData: JSON.stringify({
            posture: result.posture,
            gaze: result.gaze,
            gestures: result.gestures,
            engagement: result.engagement,
            movementStability: result.movementStability,
          }),
          emotionData: JSON.stringify({
            postureState: result.posture.state,
            gazeDirection: result.gaze.direction,
            confidence: result.confidence,
          }),
          vibeData: JSON.stringify({
            presence: result.engagement.presenceDescriptor,
            score: result.engagement.score,
          }),
          insightsData: JSON.stringify(result.observations),
          recommendations: JSON.stringify(result.coach.nextPractice),
          explanationData: JSON.stringify(result.evidence),
          isDemo,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          ...result,
          id: bodyRecord.id,
          analysisId: generalRecord.id,
          imageUrl,
          timestamp: bodyRecord.timestamp.toISOString(),
        },
      });
    } catch (error: any) {
      console.error("[BodyAnalysisController] Analysis failure:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to complete body language analysis.",
      });
    }
  }

  /**
   * GET /api/analyze/body/history
   * Retrieves past body analyses for the authenticated user
   */
  public static async getBodyHistory(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user || !user.id) {
        res.status(401).json({ success: false, error: "Unauthorized." });
        return;
      }

      const records = await prisma.bodyAnalysis.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: "desc" },
        take: 50,
      });

      res.status(200).json({
        success: true,
        data: records.map((r) => ({
          id: r.id,
          title: r.title,
          timestamp: r.timestamp.toISOString(),
          imageUrl: r.imageUrl,
          sourceType: r.sourceType,
          captureMode: r.captureMode,
          postureSignal: r.postureSignal,
          postureScore: r.postureScore,
          gazeSignal: r.gazeSignal,
          gazeScore: r.gazeScore,
          gestureSignal: r.gestureSignal,
          movementStability: r.movementStability,
          confidence: r.modelConfidence || r.confidence,
          signalQualityScore: r.signalQualityScore,
          signalQuality: r.signalQuality,
          isDemo: r.isDemo,
        })),
      });
    } catch (error: any) {
      console.error("[BodyAnalysisController] Failed to fetch history:", error);
      res.status(500).json({ success: false, error: "Could not fetch body analysis history." });
    }
  }

  /**
   * GET /api/analyze/body/sample
   * Returns calibrated studio sample demo without database pollution
   */
  public static async getStudioSample(_req: Request, res: Response): Promise<void> {
    try {
      const sampleResult = BodyAnalyzerEngine.analyze({
        imageUrl: "/assets/editorial/body-man-frontal.jpg",
        fileName: "studio_sample_frontal.jpg",
        fileSize: 245800,
        width: 1080,
        height: 1920,
        captureMode: "portrait",
        sourceType: "sample",
        isDemo: true,
      });

      res.status(200).json({
        success: true,
        data: {
          ...sampleResult,
          id: "sample-studio-01",
          imageUrl: "/assets/editorial/body-man-frontal.jpg",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Failed to load studio sample." });
    }
  }

  /**
   * GET /api/analyze/body/:id
   * Retrieves single body analysis record verifying ownership
   */
  public static async getBodyAnalysisById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!user || !user.id) {
        res.status(401).json({ success: false, error: "Unauthorized." });
        return;
      }

      const record = await prisma.bodyAnalysis.findFirst({
        where: { id: String(id), userId: user.id },
      });

      if (!record) {
        res.status(404).json({ success: false, error: "Body analysis record not found." });
        return;
      }

      let evidence = null;
      let observations = [];
      let coach = null;

      try {
        if (record.evidenceData) evidence = JSON.parse(record.evidenceData);
        if (record.observationsData) observations = JSON.parse(record.observationsData);
        if (record.coachInsights) coach = JSON.parse(record.coachInsights);
      } catch (e) {}

      res.status(200).json({
        success: true,
        data: {
          id: record.id,
          title: record.title,
          timestamp: record.timestamp.toISOString(),
          sourceType: record.sourceType,
          imageUrl: record.imageUrl,
          width: record.width,
          height: record.height,
          captureMode: record.captureMode,
          posture: {
            state: record.postureSignal,
            score: record.postureScore || record.posture,
            alignment: record.framing,
          },
          gaze: {
            direction: record.gazeSignal,
            score: record.gazeScore || record.eyeContact,
            quality: record.signalQuality,
          },
          gestures: {
            activity: record.gestureSignal,
            openness: "Open",
          },
          engagement: {
            level: record.engagement >= 88 ? "High" : "Moderate",
            score: record.engagement,
          },
          movementStability: {
            stability: record.movementStability,
            score: 90,
          },
          confidence: record.modelConfidence || record.confidence,
          signalQuality: {
            rating: record.signalQuality,
            score: record.signalQualityScore,
            cameraQuality: "Optimal",
            personVisibility: record.bodyVisibility,
            framing: record.framing,
            lighting: record.lighting,
          },
          evidence,
          observations,
          coach,
          isDemo: record.isDemo,
        },
      });
    } catch (error: any) {
      console.error("[BodyAnalysisController] Error fetching record:", error);
      res.status(500).json({ success: false, error: "Could not retrieve analysis details." });
    }
  }

  /**
   * DELETE /api/analyze/body/:id
   * Permanently removes a body analysis record with ownership check
   */
  public static async deleteBodyAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!user || !user.id) {
        res.status(401).json({ success: false, error: "Unauthorized." });
        return;
      }

      const record = await prisma.bodyAnalysis.findFirst({
        where: { id: String(id), userId: user.id },
      });

      if (!record) {
        res.status(404).json({ success: false, error: "Analysis not found or permission denied." });
        return;
      }

      // Delete physical image file if stored locally in data/uploads
      if (record.storageKey) {
        const filePath = path.resolve(process.cwd(), "data", "uploads", record.storageKey);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn("[BodyAnalysisController] Could not remove uploaded file:", e);
          }
        }
      }

      // Delete from bodyAnalysis
      await prisma.bodyAnalysis.delete({ where: { id: String(id) } });

      // Delete corresponding unified Analysis record if present
      if (record.imageUrl) {
        await prisma.analysis.deleteMany({
          where: { userId: user.id, fileUrl: record.imageUrl, type: "body" },
        });
      }

      res.status(200).json({
        success: true,
        message: "Body analysis removed successfully.",
      });
    } catch (error: any) {
      console.error("[BodyAnalysisController] Delete error:", error);
      res.status(500).json({ success: false, error: "Failed to delete body analysis." });
    }
  }
}
