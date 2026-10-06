import { Router, Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/notifications - Get all user notifications
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    let notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Seed default welcome notification if user has none
    if (notifications.length === 0) {
      const welcome = await prisma.notification.create({
        data: {
          userId,
          type: "insightAvailable",
          title: "Welcome to VibeLens Intelligence",
          message: "Your personal acoustic and visual signal calibrated baseline is ready.",
          read: false,
          link: "/dashboard",
        },
      });
      notifications = [welcome];
    }

    res.json({
      success: true,
      data: notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to retrieve notifications", details: err.message });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch("/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, error: "Notification not found." });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/mark-all-read - Mark all as read
router.post("/mark-all-read", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
