import { Router, Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/profile - Retrieve authenticated user's profile
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        theme: true,
        language: true,
        plan: true,
        role: true,
        confidenceBaseline: true,
        paceBaselineWpm: true,
        postureBaseline: true,
        vocalEnergyBaseline: true,
        sensoryFeedback: true,
        privateMode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      data: {
        ...user,
        avatar: user.avatarUrl,
        preferences: {
          theme: user.theme,
          sensoryFeedback: user.sensoryFeedback,
          privateMode: user.privateMode,
        },
        baseline: {
          confidence: user.confidenceBaseline,
          speechPaceWpm: user.paceBaselineWpm,
          postureAlignment: user.postureBaseline,
          vocalEnergy: user.vocalEnergyBaseline,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to retrieve profile", details: err.message });
  }
});

// PUT /api/profile - Update authenticated user's profile
router.put("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      name,
      avatarUrl,
      avatar,
      theme,
      language,
      confidenceBaseline,
      paceBaselineWpm,
      postureBaseline,
      vocalEnergyBaseline,
      sensoryFeedback,
      privateMode,
      baseline,
      preferences,
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (avatar !== undefined) updateData.avatarUrl = avatar;
    if (theme !== undefined) updateData.theme = theme;
    if (language !== undefined) updateData.language = language;

    if (preferences?.theme) updateData.theme = preferences.theme;
    if (preferences?.sensoryFeedback !== undefined) updateData.sensoryFeedback = preferences.sensoryFeedback;
    if (preferences?.privateMode !== undefined) updateData.privateMode = preferences.privateMode;

    if (confidenceBaseline !== undefined) updateData.confidenceBaseline = confidenceBaseline;
    if (paceBaselineWpm !== undefined) updateData.paceBaselineWpm = paceBaselineWpm;
    if (postureBaseline !== undefined) updateData.postureBaseline = postureBaseline;
    if (vocalEnergyBaseline !== undefined) updateData.vocalEnergyBaseline = vocalEnergyBaseline;

    if (baseline?.confidence !== undefined) updateData.confidenceBaseline = baseline.confidence;
    if (baseline?.speechPaceWpm !== undefined) updateData.paceBaselineWpm = baseline.speechPaceWpm;
    if (baseline?.postureAlignment !== undefined) updateData.postureBaseline = baseline.postureAlignment;
    if (baseline?.vocalEnergy !== undefined) updateData.vocalEnergyBaseline = baseline.vocalEnergy;

    if (sensoryFeedback !== undefined) updateData.sensoryFeedback = sensoryFeedback;
    if (privateMode !== undefined) updateData.privateMode = privateMode;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        theme: true,
        language: true,
        plan: true,
        confidenceBaseline: true,
        paceBaselineWpm: true,
        postureBaseline: true,
        vocalEnergyBaseline: true,
        sensoryFeedback: true,
        privateMode: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        ...updated,
        avatar: updated.avatarUrl,
        preferences: {
          theme: updated.theme,
          sensoryFeedback: updated.sensoryFeedback,
          privateMode: updated.privateMode,
        },
        baseline: {
          confidence: updated.confidenceBaseline,
          speechPaceWpm: updated.paceBaselineWpm,
          postureAlignment: updated.postureBaseline,
          vocalEnergy: updated.vocalEnergyBaseline,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to update profile", details: err.message });
  }
});

export default router;
