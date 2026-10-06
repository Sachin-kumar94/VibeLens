import { Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { ComparisonEngine } from "../services/comparison/comparisonEngine.js";

export class CompareController {
  /**
   * POST /api/compare
   * Compares two user-owned analysis sessions in real-time.
   */
  public static async compareAnalyses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const analysisAId = req.body.analysisAId || req.body.sessionAId;
      const analysisBId = req.body.analysisBId || req.body.sessionBId;

      if (!analysisAId || !analysisBId) {
        res.status(400).json({
          success: false,
          error: "Both Analysis A and Analysis B IDs must be provided.",
        });
        return;
      }

      if (analysisAId === analysisBId) {
        res.status(400).json({
          success: false,
          error: "Choose two different sessions to compare.",
        });
        return;
      }

      // Load both sessions verifying strict authenticated user ownership
      const [sessionA, sessionB] = await Promise.all([
        ComparisonEngine.loadSessionDetail(String(analysisAId), userId),
        ComparisonEngine.loadSessionDetail(String(analysisBId), userId),
      ]);

      if (!sessionA || !sessionB) {
        res.status(404).json({
          success: false,
          error: "One or both selected sessions could not be found or belong to another account.",
        });
        return;
      }

      // Compute honest, data-driven delta
      const result = ComparisonEngine.compare(sessionA, sessionB);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error("[CompareController.compareAnalyses] Error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to compare sessions",
        details: err.message,
      });
    }
  }

  /**
   * POST /api/compare/save
   * Persists a completed comparison into the database.
   */
  public static async saveComparison(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const analysisAId = req.body.analysisAId || req.body.sessionAId;
      const analysisBId = req.body.analysisBId || req.body.sessionBId;
      const { result, title } = req.body;

      if (!analysisAId || !analysisBId) {
        res.status(400).json({ success: false, error: "Missing required analysis IDs." });
        return;
      }

      // Verify ownership of both analyses
      const [ownedA, ownedB] = await Promise.all([
        ComparisonEngine.loadSessionDetail(String(analysisAId), userId),
        ComparisonEngine.loadSessionDetail(String(analysisBId), userId),
      ]);

      if (!ownedA || !ownedB) {
        res.status(403).json({ success: false, error: "Unauthorized access to specified analyses." });
        return;
      }

      const comparisonRecord = await prisma.comparison.create({
        data: {
          userId,
          analysisAId: String(ownedA.id),
          analysisBId: String(ownedB.id),
          title: title || `${ownedA.title} vs ${ownedB.title}`,
          summary: JSON.stringify(result?.summary || {}),
          metrics: JSON.stringify(result?.matrix || []),
          changes: JSON.stringify(result?.changes || {}),
          commonMetrics: JSON.stringify({
            quality: result?.summary?.comparisonQuality || "High comparability",
            explanation: result?.summary?.comparisonQualityExplanation || "",
          }),
          evidence: JSON.stringify(result?.evidence || []),
          limitations: JSON.stringify(result?.limitations || []),
        },
      });

      res.status(201).json({
        success: true,
        data: comparisonRecord,
      });
    } catch (err: any) {
      console.error("[CompareController.saveComparison] Error:", err);
      res.status(500).json({ success: false, error: "Failed to save comparison", details: err.message });
    }
  }

  /**
   * GET /api/compare/recent
   * Returns the most recent saved comparison for the user.
   */
  public static async getRecentComparison(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const recent = await prisma.comparison.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (!recent) {
        res.status(200).json({ success: true, data: null });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: recent.id,
          title: recent.title,
          analysisAId: recent.analysisAId,
          analysisBId: recent.analysisBId,
          summary: JSON.parse(recent.summary || "{}"),
          createdAt: recent.createdAt.toISOString(),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to retrieve recent comparison", details: err.message });
    }
  }

  /**
   * GET /api/compare/:id
   * Loads an existing comparison by ID with ownership verification.
   */
  public static async getComparisonById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);

      const comparison = await prisma.comparison.findFirst({
        where: { id, userId },
      });

      if (!comparison) {
        res.status(404).json({ success: false, error: "Comparison record not found." });
        return;
      }

      // Re-hydrate session details
      const [sessionA, sessionB] = await Promise.all([
        ComparisonEngine.loadSessionDetail(comparison.analysisAId, userId),
        ComparisonEngine.loadSessionDetail(comparison.analysisBId, userId),
      ]);

      res.status(200).json({
        success: true,
        data: {
          id: comparison.id,
          title: comparison.title,
          createdAt: comparison.createdAt.toISOString(),
          sessionA,
          sessionB,
          summary: JSON.parse(comparison.summary || "{}"),
          matrix: JSON.parse(comparison.metrics || "[]"),
          changes: JSON.parse(comparison.changes || "{}"),
          evidence: JSON.parse(comparison.evidence || "[]"),
          limitations: JSON.parse(comparison.limitations || "[]"),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to load comparison", details: err.message });
    }
  }

  /**
   * DELETE /api/compare/:id
   * Deletes a comparison record verifying user ownership.
   */
  public static async deleteComparison(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);

      const existing = await prisma.comparison.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({ success: false, error: "Comparison not found." });
        return;
      }

      await prisma.comparison.delete({ where: { id: existing.id } });

      res.status(200).json({
        success: true,
        message: "Comparison deleted successfully.",
        deletedId: id,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to delete comparison", details: err.message });
    }
  }
}
