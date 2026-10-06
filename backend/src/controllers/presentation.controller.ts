import { Request, Response } from "express";
import { prisma } from "../services/prisma.service.js";
import {
  evaluatePresentationSession,
  PresentationMetricsInput,
} from "../services/coaching/presentationCoach.js";

export class PresentationController {
  /**
   * POST /api/presentation/sessions
   * Creates and stores a new PresentationSession and mirrors to Analysis for History/Compare
   */
  async createSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized access" });
      }

      const {
        title = "Keynote & Presentation Rehearsal",
        context = "General",
        targetDuration = 300,
        targetPaceMin = 140,
        targetPaceMax = 150,
        duration = 0,
        audioUrl = null,
        audioStorageKey = null,
        videoUrl = null,
        videoStorageKey = null,
        transcript = "",
        pace = 0,
        pauseCount = 0,
        avgPauseDuration = 0,
        fillerCount = 0,
        fillerRate = 0,
        cameraEngagement = 85,
        posture = 85,
        gestureActivity = "Moderate",
        signalQuality = "Good",
        audioQuality = "Good",
        videoQuality = "Good",
        framingQuality = "Good",
        topic = null,
        userNotes = null,
        feedbackMode = "Standard",
        longestPause = 0,
        integrityEvents = [],
        isDemo = false,
      } = req.body;

      // Evaluate coaching insights
      const metricsInput: PresentationMetricsInput = {
        duration,
        pace,
        targetPaceMin,
        targetPaceMax,
        pauseCount,
        avgPauseDuration,
        fillerCount,
        fillerRate,
        cameraEngagement,
        posture,
        gestureActivity,
        signalQuality,
        audioQuality,
        videoQuality,
        framingQuality,
        hasSpeechData: pace > 0 || (transcript && transcript.length > 0),
      };

      const evaluation = evaluatePresentationSession(metricsInput);

      // Persist PresentationSession
      const savedSession = await prisma.presentationSession.create({
        data: {
          userId,
          title: title || `${context} Rehearsal`,
          context,
          targetDuration: Number(targetDuration) || 300,
          targetPaceMin: Number(targetPaceMin) || 140,
          targetPaceMax: Number(targetPaceMax) || 150,
          duration: Number(duration) || 0,
          audioUrl,
          audioStorageKey,
          videoUrl,
          videoStorageKey,
          transcript,
          pace: Number(pace) || 0,
          pauseCount: Number(pauseCount) || 0,
          avgPauseDuration: Number(avgPauseDuration) || 0,
          longestPause: Number(longestPause) || 0,
          fillerCount: Number(fillerCount) || 0,
          fillerRate: Number(fillerRate) || 0,
          cameraEngagement: Number(cameraEngagement) || 85,
          posture: Number(posture) || 85,
          gestureActivity,
          signalQuality,
          audioQuality,
          videoQuality,
          framingQuality,
          topic,
          userNotes,
          feedbackMode,
          coaching: JSON.stringify(evaluation.recommendations),
          strengths: JSON.stringify(evaluation.strengths),
          improvements: JSON.stringify(evaluation.improvements),
          practicePlan: JSON.stringify(evaluation.practicePlan),
          isDemo: Boolean(isDemo),
        },
      });

      // Save integrity events if provided
      if (Array.isArray(integrityEvents) && integrityEvents.length > 0) {
        try {
          await (prisma as any).presentationIntegrityEvent.createMany({
            data: integrityEvents.map((evt: any) => ({
              sessionId: savedSession.id,
              userId,
              type: String(evt.type || "OBSERVABLE_EVENT"),
              timestamp: Number(evt.timestamp) || 0,
              duration: Number(evt.duration) || 0,
              source: String(evt.source || "client_event_monitor"),
              metadata: evt.metadata ? (typeof evt.metadata === "string" ? evt.metadata : JSON.stringify(evt.metadata)) : null,
            })),
          });
        } catch (evtErr) {
          console.warn("Integrity event recording notice:", evtErr);
        }
      }

      // Mirror to unified Analysis table for seamless History, Dashboard, and Compare integration
      try {
        await prisma.analysis.create({
          data: {
            userId,
            type: "presentation",
            title: savedSession.title,
            confidence: evaluation.overallScore,
            emotion: evaluation.paceStatus === "Within target" ? "Grounded & Articulate" : "Energetic Delivery",
            vibe: "Presentation Presence",
            signalQuality: savedSession.signalQuality,
            qualityReason: "Acoustic and kinematic capture verified during presentation rehearsal.",
            context: `${savedSession.context} (${Math.round(savedSession.duration)}s)`,
            fileUrl: videoUrl || audioUrl,
            inputText: transcript,
            signalsData: JSON.stringify({
              presentationSessionId: savedSession.id,
              pace: savedSession.pace,
              targetPaceMin: savedSession.targetPaceMin,
              targetPaceMax: savedSession.targetPaceMax,
              duration: savedSession.duration,
              pauseCount: savedSession.pauseCount,
              avgPauseDuration: savedSession.avgPauseDuration,
              cameraEngagement: savedSession.cameraEngagement,
              posture: savedSession.posture,
              deliveryScore: evaluation.deliveryScore,
              visualPresenceScore: evaluation.visualPresenceScore,
              vocalDeliveryScore: evaluation.vocalDeliveryScore,
              signalQualityScore: evaluation.signalQualityScore,
              overallScore: evaluation.overallScore,
            }),
            emotionData: JSON.stringify({
              delivery: evaluation.deliveryScore,
              visual: evaluation.visualPresenceScore,
              vocal: evaluation.vocalDeliveryScore,
            }),
            vibeData: JSON.stringify({
              vocalPace: savedSession.pace,
              gazeScore: savedSession.cameraEngagement,
              postureScore: savedSession.posture,
            }),
            insightsData: JSON.stringify(evaluation.recommendations),
            recommendations: JSON.stringify(evaluation.improvements),
            explanationData: JSON.stringify({
              disclaimer: "Presentation metrics are based on observable audio, video, and pacing signals for rehearsal purposes.",
            }),
            isDemo: Boolean(isDemo),
          },
        });
      } catch (mirrorErr) {
        console.warn("Analysis mirror warning:", mirrorErr);
      }

      return res.status(201).json({
        success: true,
        session: {
          ...savedSession,
          evaluation,
        },
      });
    } catch (err: any) {
      console.error("Create presentation session error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to create presentation session",
        details: err?.message,
      });
    }
  }

  /**
   * POST /api/presentation/sessions/analyze
   * Evaluates metrics and returns coaching evaluation
   */
  async analyzeSession(req: Request, res: Response) {
    try {
      const {
        duration = 0,
        pace = 0,
        targetPaceMin = 140,
        targetPaceMax = 150,
        pauseCount = 0,
        avgPauseDuration = 0,
        fillerCount = 0,
        fillerRate = 0,
        cameraEngagement = 85,
        posture = 85,
        gestureActivity = "Moderate",
        signalQuality = "Good",
        audioQuality = "Good",
        videoQuality = "Good",
        framingQuality = "Good",
      } = req.body;

      const evaluation = evaluatePresentationSession({
        duration,
        pace,
        targetPaceMin,
        targetPaceMax,
        pauseCount,
        avgPauseDuration,
        fillerCount,
        fillerRate,
        cameraEngagement,
        posture,
        gestureActivity,
        signalQuality,
        audioQuality,
        videoQuality,
        framingQuality,
        hasSpeechData: pace > 0,
      });

      return res.json({ success: true, evaluation });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Failed to analyze presentation", details: err?.message });
    }
  }

  /**
   * GET /api/presentation/sessions
   * Returns user's saved presentation sessions
   */
  async getSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized access" });
      }

      const sessions = await prisma.presentationSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      const parsed = sessions.map((s) => ({
        ...s,
        coaching: JSON.parse(s.coaching || "[]"),
        strengths: JSON.parse(s.strengths || "[]"),
        improvements: JSON.parse(s.improvements || "[]"),
        practicePlan: JSON.parse(s.practicePlan || "{}"),
      }));

      return res.json({ success: true, sessions: parsed });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Failed to fetch sessions", details: err?.message });
    }
  }

  /**
   * GET /api/presentation/sessions/:id
   * Returns a single presentation session with ownership verification
   */
  async getSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const id = String(req.params.id);

      const session = await prisma.presentationSession.findFirst({
        where: { id, userId },
      });

      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }

      return res.json({
        success: true,
        session: {
          ...session,
          coaching: JSON.parse(session.coaching || "[]"),
          strengths: JSON.parse(session.strengths || "[]"),
          improvements: JSON.parse(session.improvements || "[]"),
          practicePlan: JSON.parse(session.practicePlan || "{}"),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Failed to fetch session", details: err?.message });
    }
  }

  /**
   * DELETE /api/presentation/sessions/:id
   * Deletes session with ownership check
   */
  async deleteSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const id = String(req.params.id);

      const session = await prisma.presentationSession.findFirst({
        where: { id, userId },
      });

      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found or access denied" });
      }

      await prisma.presentationSession.delete({ where: { id } });

      return res.json({ success: true, message: "Session successfully deleted" });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Failed to delete session", details: err?.message });
    }
  }

  /**
   * POST /api/presentation/sessions/:id/journal
   * Adds session reflection to Journal
   */
  async addToJournal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const id = String(req.params.id);
      const { userNote = "" } = req.body;

      const session = await prisma.presentationSession.findFirst({
        where: { id, userId },
      });

      if (!session) {
        return res.status(404).json({ success: false, error: "Presentation session not found" });
      }

      const journalEntry = await prisma.journalEntry.create({
        data: {
          userId,
          analysisId: session.id,
          vibe: "Presentation Delivery",
          emotion: session.pace > 0 ? `${session.pace} WPM Delivery` : "Presentation Practice",
          confidence: Math.round(((session.cameraEngagement || 85) + (session.posture || 85)) / 2),
          context: `Presentation Coach: ${session.context}`,
          userNote: userNote || `Rehearsal for ${session.context} with target pace ${session.targetPaceMin}–${session.targetPaceMax} WPM.`,
          signalsData: JSON.stringify([
            { label: "Pacing", value: `${session.pace} WPM` },
            { label: "Camera Engagement", value: `${session.cameraEngagement}%` },
            { label: "Posture Alignment", value: `${session.posture}%` },
            { label: "Duration", value: `${session.duration}s` },
          ]),
          sourceMode: "presentation",
        },
      });

      return res.json({ success: true, journalEntry });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Failed to add to journal", details: err?.message });
    }
  }

  /**
   * GET /api/presentation/sessions/:id/report
   * Generates formatted report in JSON, Markdown, and CSV format
   */
  async exportReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const id = String(req.params.id);
      const format = (req.query.format as string) || "json";

      const session = await prisma.presentationSession.findFirst({
        where: { id, userId },
      });

      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }

      const coaching = JSON.parse(session.coaching || "[]");
      const strengths = JSON.parse(session.strengths || "[]");
      const improvements = JSON.parse(session.improvements || "[]");
      const practicePlan = JSON.parse(session.practicePlan || "{}");

      if (format === "markdown") {
        const markdown = `# VibeLens Presentation Practice Report
**Date:** ${new Date(session.createdAt).toLocaleDateString()}
**Session Title:** ${session.title}
**Context:** ${session.context}
**Duration:** ${Math.floor(session.duration / 60)}m ${session.duration % 60}s

---

## 1. Measured Pacing & Vocal Signals
- **Speaking Pace:** ${session.pace} WPM (Target: ${session.targetPaceMin}–${session.targetPaceMax} WPM)
- **Pause Count:** ${session.pauseCount}
- **Average Pause Duration:** ${session.avgPauseDuration.toFixed(1)}s
- **Filler Word Count:** ${session.fillerCount || 0} (Rate: ${(session.fillerRate || 0).toFixed(1)}/min)

## 2. Visual & Kinematic Signals
- **Estimated Camera Engagement:** ${session.cameraEngagement}%
- **Posture Alignment:** ${session.posture}%
- **Gesture Activity:** ${session.gestureActivity}
- **Framing Quality:** ${session.framingQuality}

## 3. Observed Strengths
${strengths.map((s: string) => `- ${s}`).join("\n")}

## 4. Targeted Refinements
${improvements.map((i: string) => `- ${i}`).join("\n")}

## 5. Next Rehearsal Practice Plan
- **Target Pace:** ${practicePlan.nextTargetPace || `${session.targetPaceMin}–${session.targetPaceMax} WPM`}
- **Focus Cue:** ${practicePlan.focusCue || "Pacing Regulation"}
- **Pause Exercise:** ${practicePlan.pauseExercise || "Insert 2-second deliberate pauses"}
- **Posture Reminder:** ${practicePlan.postureReminder || "Check upper-body centering"}

---
*Disclaimer: Presentation feedback is based on observable audio, video, and pacing signals and is intended for rehearsal practice, not psychological or medical assessment.*
`;
        res.setHeader("Content-Type", "text/markdown");
        res.setHeader("Content-Disposition", `attachment; filename="presentation-report-${session.id}.md"`);
        return res.send(markdown);
      }

      if (format === "csv") {
        const csv = `Metric,Value,Target,Status
Session Title,"${session.title}",-,Completed
Context,"${session.context}",-,Completed
Duration (seconds),${session.duration},${session.targetDuration},Completed
Speaking Pace (WPM),${session.pace},${session.targetPaceMin}-${session.targetPaceMax},${session.pace >= session.targetPaceMin && session.pace <= session.targetPaceMax ? "Within Target" : "Off Target"}
Pause Count,${session.pauseCount},-,Completed
Average Pause (s),${session.avgPauseDuration.toFixed(1)},-,Completed
Camera Engagement (%),${session.cameraEngagement},80%+,Measured
Posture Alignment (%),${session.posture},80%+,Measured
Signal Quality,${session.signalQuality},Good,Measured
`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="presentation-metrics-${session.id}.csv"`);
        return res.send(csv);
      }

      return res.json({
        success: true,
        report: {
          session,
          coaching,
          strengths,
          improvements,
          practicePlan,
          disclaimer:
            "Presentation feedback is based on observable audio, video, and pacing signals and is intended for practice, not psychological or medical assessment.",
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Failed to generate report", details: err?.message });
    }
  }
}

export const presentationController = new PresentationController();
