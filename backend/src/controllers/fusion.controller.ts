import { Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { FusionService, FusionInputPayload } from "../services/fusion/fusionService.js";

export class FusionController {
  /**
   * POST /api/analyze/fusion
   * Synthesize Image, Voice, and Body signals into a unified multimodal session.
   * Supports both quick live captures and existing historical analyses.
   */
  public static async synthesizeFusion(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const {
        imageAnalysisId,
        voiceAnalysisId,
        bodyAnalysisId,
        image,
        voice,
        body,
        context,
        contextText,
      } = req.body;

      const interactionContext = context || contextText || "Presentation";

      let resolvedImage = image ? { ...image } : null;
      let resolvedVoice = voice ? { ...voice } : null;
      let resolvedBody = body ? { ...body } : null;

      // 1. If imageAnalysisId provided, verify ownership and load record
      if (imageAnalysisId) {
        const imageRecord = await prisma.analysis.findFirst({
          where: { id: imageAnalysisId, userId, type: "image" },
        });
        if (!imageRecord) {
          res.status(404).json({
            success: false,
            error: "Selected image analysis was not found or belongs to another user.",
          });
          return;
        }

        let parsedSignals: any = {};
        try {
          parsedSignals = imageRecord.signalsData ? JSON.parse(imageRecord.signalsData) : {};
        } catch (e) {}

        resolvedImage = {
          id: imageRecord.id,
          title: imageRecord.title,
          emotion: imageRecord.emotion || "Calm & Focused",
          confidence: imageRecord.confidence || 88,
          signalQuality: imageRecord.signalQuality === "Good" ? 92 : 75,
          visualTone: imageRecord.vibe || "Natural Studio Lighting",
          fileUrl: imageRecord.fileUrl || imageRecord.inputUrl || undefined,
          fileName: imageRecord.fileName || "portrait_archive.webp",
          qualityRating: (imageRecord.signalQuality as any) || "Good",
          scene: parsedSignals.scene || "Ambient Workspace",
        };
      }

      // 2. If voiceAnalysisId provided, verify ownership and load record
      if (voiceAnalysisId) {
        const voiceRecord = await prisma.voiceAnalysis.findFirst({
          where: { id: voiceAnalysisId, userId },
        });

        if (voiceRecord) {
          resolvedVoice = {
            id: voiceRecord.id,
            title: voiceRecord.title,
            emotion: voiceRecord.emotion || "Measured",
            tone: voiceRecord.tone || "Warm Resonance",
            energy: voiceRecord.energy || voiceRecord.vocalEnergy || 82,
            pace: voiceRecord.wordsPerMinute || 142,
            clarity: voiceRecord.clarity || 90,
            confidence: voiceRecord.confidence || 87,
            signalQuality: voiceRecord.signalQuality === "Good" ? 90 : 78,
            qualityRating: (voiceRecord.signalQuality as any) || "Good",
            audioUrl: voiceRecord.audioUrl || undefined,
            duration: voiceRecord.duration || 20,
          };
        } else {
          // Fallback check in general analysis table
          const generalVoice = await prisma.analysis.findFirst({
            where: { id: voiceAnalysisId, userId, type: "voice" },
          });
          if (generalVoice) {
            resolvedVoice = {
              id: generalVoice.id,
              title: generalVoice.title,
              emotion: generalVoice.emotion || "Measured",
              tone: generalVoice.vibe || "Warm & Measured",
              energy: 82,
              pace: 144,
              clarity: 90,
              confidence: generalVoice.confidence || 87,
              signalQuality: generalVoice.signalQuality === "Good" ? 90 : 78,
              qualityRating: (generalVoice.signalQuality as any) || "Good",
              audioUrl: generalVoice.fileUrl || undefined,
            };
          } else {
            res.status(404).json({
              success: false,
              error: "Selected voice analysis was not found or belongs to another user.",
            });
            return;
          }
        }
      }

      // 3. If bodyAnalysisId provided, verify ownership and load record
      if (bodyAnalysisId) {
        const bodyRecord = await prisma.bodyAnalysis.findFirst({
          where: { id: bodyAnalysisId, userId },
        });

        if (bodyRecord) {
          resolvedBody = {
            id: bodyRecord.id,
            title: bodyRecord.title,
            posture: bodyRecord.postureSignal || "Upright",
            postureScore: bodyRecord.posture || bodyRecord.postureScore || 88,
            gaze: bodyRecord.gazeSignal || "Centered",
            gestures: bodyRecord.gestureSignal || "Moderate",
            engagement: bodyRecord.engagement || 89,
            confidence: bodyRecord.confidence || bodyRecord.modelConfidence || 88,
            signalQuality: bodyRecord.signalQualityScore || 86,
            qualityRating: (bodyRecord.signalQuality as any) || "Good",
            imageUrl: bodyRecord.imageUrl || undefined,
            bodyVisibility: bodyRecord.bodyVisibility || "Upper torso aligned",
          };
        } else {
          const generalBody = await prisma.analysis.findFirst({
            where: { id: bodyAnalysisId, userId, type: "body" },
          });
          if (generalBody) {
            resolvedBody = {
              id: generalBody.id,
              title: generalBody.title,
              posture: "Upright & Centered",
              postureScore: generalBody.confidence || 86,
              gaze: "Direct",
              gestures: "Measured",
              engagement: 88,
              confidence: generalBody.confidence || 86,
              signalQuality: generalBody.signalQuality === "Good" ? 88 : 75,
              qualityRating: (generalBody.signalQuality as any) || "Good",
              imageUrl: generalBody.fileUrl || undefined,
            };
          } else {
            res.status(404).json({
              success: false,
              error: "Selected body analysis was not found or belongs to another user.",
            });
            return;
          }
        }
      }

      // Check required minimum 2 modalities
      const hasImg = Boolean(resolvedImage && (resolvedImage.emotion || resolvedImage.confidence));
      const hasVce = Boolean(resolvedVoice && (resolvedVoice.emotion || resolvedVoice.confidence || resolvedVoice.tone));
      const hasBdy = Boolean(resolvedBody && (resolvedBody.posture || resolvedBody.engagement || resolvedBody.confidence));

      const count = (hasImg ? 1 : 0) + (hasVce ? 1 : 0) + (hasBdy ? 1 : 0);
      if (count < 2) {
        res.status(400).json({
          success: false,
          error: "Select at least two signal sources for fusion (Image + Voice, Image + Body, Voice + Body, or all three).",
        });
        return;
      }

      // Run actual fusion calculation
      const payload: FusionInputPayload = {
        image: resolvedImage,
        voice: resolvedVoice,
        body: resolvedBody,
        context: interactionContext,
        imageAnalysisId,
        voiceAnalysisId,
        bodyAnalysisId,
      };

      const result = FusionService.synthesize(payload);

      // Save to specialized FusionAnalysis record
      const fusionRecord = await prisma.fusionAnalysis.create({
        data: {
          userId,
          title: result.title,
          context: interactionContext,
          imageAnalysisId: imageAnalysisId || null,
          voiceAnalysisId: voiceAnalysisId || null,
          bodyAnalysisId: bodyAnalysisId || null,
          modalityCount: result.modalityCount,
          faceEmotion: resolvedImage?.emotion || null,
          faceConfidence: resolvedImage?.confidence || null,
          voiceEmotion: resolvedVoice?.tone || resolvedVoice?.emotion || null,
          voiceConfidence: resolvedVoice?.confidence || null,
          bodyState: resolvedBody?.posture || null,
          bodyConfidence: resolvedBody?.confidence || null,
          overallVibe: result.overallVibe,
          agreementScore: result.agreementScore,
          consistency: result.agreementScore,
          confidence: result.confidence,
          signalQualityScore: result.signalQuality,
          signalQuality: result.signalQualityRating,
          convergentSignals: JSON.stringify(result.convergentSignals),
          divergentSignals: JSON.stringify(result.divergentSignals),
          evidence: JSON.stringify(result.evidence),
          interpretation: result.interpretation,
          limitations: JSON.stringify(result.limitations),
          recommendations: JSON.stringify(result.recommendations),
          explanation: result.interpretation,
          isDemo: false,
        },
      });

      // Save to unified Analysis table so it appears in History, Analytics, and Compare
      const unifiedRecord = await prisma.analysis.create({
        data: {
          userId,
          type: "fusion",
          title: result.title,
          inputText: interactionContext,
          emotion: `${result.agreementLevel} (${result.agreementScore}%)`,
          confidence: result.confidence,
          vibe: result.overallVibe,
          signalQuality: result.signalQualityRating,
          qualityReason: `Synthesized across ${result.modalityCount} modalities with ${result.signalQuality}% aggregate fidelity.`,
          context: interactionContext,
          signalsData: JSON.stringify({
            crossModalConsistency: `${result.agreementScore}% Agreement`,
            modalityCount: result.modalityCount,
            convergentSignals: result.convergentSignals,
            divergentSignals: result.divergentSignals,
            modalitiesPresent: result.modalitiesPresent,
            image: result.modalityResults.image,
            voice: result.modalityResults.voice,
            body: result.modalityResults.body,
          }),
          emotionData: JSON.stringify([
            { emotion: result.agreementLevel, score: result.agreementScore },
            { emotion: result.overallVibe, score: result.confidence },
          ]),
          vibeData: JSON.stringify({
            consistency: result.agreementScore,
            confidence: result.confidence,
            quality: result.signalQuality,
            cohesion: Math.min(100, result.agreementScore + 2),
          }),
          insightsData: JSON.stringify(result.convergentSignals),
          recommendations: JSON.stringify(result.recommendations),
          explanationData: JSON.stringify({
            aiInterpretation: result.interpretation,
            evidence: result.evidence,
            limitations: result.limitations,
          }),
          isDemo: false,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          ...result,
          id: unifiedRecord.id,
          fusionRecordId: fusionRecord.id,
          analysisId: unifiedRecord.id,
          createdAt: fusionRecord.createdAt.toISOString(),
          timestamp: fusionRecord.createdAt.toISOString(),
        },
      });
    } catch (err: any) {
      console.error("[FusionController.synthesizeFusion] Error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to process multimodal fusion",
        details: err.message,
      });
    }
  }

  /**
   * GET /api/analyze/fusion/:id
   */
  public static async getFusionById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);

      const fusion = await prisma.fusionAnalysis.findFirst({
        where: { id, userId },
      });

      if (!fusion) {
        // Fallback: check if id belongs to unified analysis table
        const unified = await prisma.analysis.findFirst({
          where: { id, userId, type: "fusion" },
        });
        if (!unified) {
          res.status(404).json({ success: false, error: "Fusion analysis not found" });
          return;
        }

        let signalsData: any = {};
        let explanationData: any = {};
        try {
          signalsData = unified.signalsData ? JSON.parse(unified.signalsData) : {};
          explanationData = unified.explanationData ? JSON.parse(unified.explanationData) : {};
        } catch (e) {}

        res.json({
          success: true,
          data: {
            id: unified.id,
            title: unified.title,
            context: unified.context || "Presentation",
            agreementScore: unified.confidence,
            confidence: unified.confidence,
            signalQuality: unified.signalQuality === "Good" ? 90 : 75,
            convergentSignals: signalsData.convergentSignals || [],
            divergentSignals: signalsData.divergentSignals || [],
            evidence: explanationData.evidence || [],
            interpretation: explanationData.aiInterpretation || unified.qualityReason,
            limitations: explanationData.limitations || [],
            timestamp: unified.createdAt.toISOString(),
          },
        });
        return;
      }

      let convergentSignals = [];
      let divergentSignals = [];
      let evidence = [];
      let limitations = [];
      let recommendations = [];

      try {
        convergentSignals = fusion.convergentSignals ? JSON.parse(fusion.convergentSignals) : [];
        divergentSignals = fusion.divergentSignals ? JSON.parse(fusion.divergentSignals) : [];
        evidence = fusion.evidence ? JSON.parse(fusion.evidence) : [];
        limitations = fusion.limitations ? JSON.parse(fusion.limitations) : [];
        recommendations = fusion.recommendations ? JSON.parse(fusion.recommendations) : [];
      } catch (e) {}

      res.json({
        success: true,
        data: {
          id: fusion.id,
          title: fusion.title,
          context: fusion.context,
          modalityCount: fusion.modalityCount,
          agreementScore: fusion.agreementScore,
          consistency: fusion.consistency,
          confidence: fusion.confidence,
          signalQuality: fusion.signalQualityScore,
          signalQualityRating: fusion.signalQuality,
          faceEmotion: fusion.faceEmotion,
          faceConfidence: fusion.faceConfidence,
          voiceEmotion: fusion.voiceEmotion,
          voiceConfidence: fusion.voiceConfidence,
          bodyState: fusion.bodyState,
          bodyConfidence: fusion.bodyConfidence,
          overallVibe: fusion.overallVibe,
          convergentSignals,
          divergentSignals,
          evidence,
          interpretation: fusion.interpretation || fusion.explanation,
          limitations,
          recommendations,
          timestamp: fusion.createdAt.toISOString(),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to fetch fusion session", details: err.message });
    }
  }

  /**
   * DELETE /api/analyze/fusion/:id
   */
  public static async deleteFusion(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);

      const existing = await prisma.fusionAnalysis.findFirst({
        where: { id, userId },
      });

      if (existing) {
        await prisma.fusionAnalysis.delete({ where: { id: existing.id } });
      }

      // Also clean up unified record if present
      await prisma.analysis.deleteMany({
        where: { id, userId, type: "fusion" },
      });

      res.json({ success: true, message: "Fusion analysis deleted successfully", deletedId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to delete fusion session", details: err.message });
    }
  }

  /**
   * GET /api/history/fusion
   * Fetch user's fusion analysis history with pagination and sorting
   */
  public static async getFusionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const records = await prisma.fusionAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      res.json({
        success: true,
        data: records.map((r) => ({
          id: r.id,
          title: r.title,
          context: r.context,
          agreementScore: r.agreementScore,
          confidence: r.confidence,
          signalQuality: r.signalQualityScore,
          modalityCount: r.modalityCount,
          overallVibe: r.overallVibe,
          timestamp: r.createdAt.toISOString(),
        })),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to load fusion history", details: err.message });
    }
  }

  /**
   * POST /api/fusion/:id/journal
   * Direct bridge: Add fusion analysis outcome to user's journal
   */
  public static async addToJournal(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);
      const { userNote } = req.body;

      // Find fusion record or unified record
      let fusion = await prisma.fusionAnalysis.findFirst({
        where: { id, userId },
      });

      let vibe = fusion?.overallVibe || "Unified Communication";
      let emotion = `${fusion?.agreementScore || 88}% Cross-Modal Consistency`;
      let confidence = fusion?.confidence || 88;
      let context = fusion?.context || "Multimodal Session";
      let signals = fusion?.convergentSignals || JSON.stringify(["Multimodal Concordance Established"]);

      if (!fusion) {
        const unified = await prisma.analysis.findFirst({
          where: { id, userId },
        });
        if (unified) {
          vibe = unified.vibe || vibe;
          emotion = unified.emotion || emotion;
          confidence = unified.confidence || confidence;
          context = unified.context || context;
        }
      }

      const entry = await prisma.journalEntry.create({
        data: {
          userId,
          analysisId: id,
          vibe,
          emotion,
          confidence,
          context,
          userNote: userNote || `Synthesized multimodal session across ${fusion?.modalityCount || 3} modalities.`,
          signalsData: signals,
          sourceMode: "fusion",
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: entry.id,
          date: entry.date.toISOString(),
          analysisId: entry.analysisId,
          vibe: entry.vibe,
          emotion: entry.emotion,
          confidence: entry.confidence,
          context: entry.context,
          userNote: entry.userNote,
          sourceMode: entry.sourceMode,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to add fusion result to journal", details: err.message });
    }
  }
}
