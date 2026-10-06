import { Request, Response } from "express";
import { interviewService } from "../services/interview/interviewService.js";
import { buildInterviewReport } from "../services/interview/interviewReportService.js";
import { prisma } from "../services/prisma.service.js";
import path from "path";
import fs from "fs";

export class InterviewController {
  private async resolveUserId(req: Request): Promise<string> {
    if (req.user?.id) return req.user.id;
    const defaultUser = await prisma.user.findFirst({ select: { id: true } });
    return defaultUser?.id || "cmus53ny300025po8aezh9kp0";
  }

  /**
   * GET /api/interviews/questions
   */
  async getQuestions(req: Request, res: Response) {
    try {
      const userId = req.user?.id || (await this.resolveUserId(req));
      const { category, role, difficulty, search, customOnly } = req.query;

      const questions = await interviewService.getQuestions(userId, {
        category: category as string,
        role: role as string,
        difficulty: difficulty as string,
        search: search as string,
        customOnly: customOnly === "true",
      });

      res.json({ success: true, data: questions });
    } catch (err: any) {
      console.error("Error fetching interview questions:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to load questions" });
    }
  }

  /**
   * POST /api/interviews/questions/custom
   */
  async createCustomQuestion(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const { question, category, role, difficulty, criteria, timeTargetMin, timeTargetMax, rubric } = req.body;
      if (!question || typeof question !== "string" || question.trim().length < 5) {
        return res.status(400).json({ success: false, error: "Question text must be at least 5 characters long." });
      }

      const created = await interviewService.createCustomQuestion(userId, {
        question,
        category,
        role,
        difficulty,
        criteria,
        timeTargetMin,
        timeTargetMax,
        rubric,
      });

      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to create question" });
    }
  }

  /**
   * DELETE /api/interviews/questions/:id
   */
  async deleteCustomQuestion(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);

      await interviewService.deleteCustomQuestion(userId, id);
      res.json({ success: true, message: "Custom question deleted successfully." });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message || "Failed to delete question" });
    }
  }

  /**
   * POST /api/interviews/sessions
   */
  async createSession(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const session = await interviewService.createSession(userId, req.body);
      res.status(201).json({ success: true, data: session });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to create session" });
    }
  }

  /**
   * GET /api/interviews/sessions/:id
   */
  async getSession(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const id = String(req.params.id);

      const session = await interviewService.getSession(userId, id);
      res.json({ success: true, data: session });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || "Session not found" });
    }
  }

  /**
   * POST /api/interviews/sessions/:id/answers
   */
  async saveAndEvaluateAnswer(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const sessionId = String(req.params.id);
      const answerData = req.body;

      if (!answerData.questionId) {
        return res.status(400).json({ success: false, error: "questionId is required" });
      }

      const result = await interviewService.saveAndEvaluateAnswer(userId, sessionId, answerData);
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error("Error saving answer:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to save answer" });
    }
  }

  /**
   * POST /api/interviews/sessions/:id/finish
   */
  async finishSession(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const sessionId = String(req.params.id);

      const result = await interviewService.finishSession(userId, sessionId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to finish session" });
    }
  }

  /**
   * DELETE /api/interviews/sessions/:id
   */
  async deleteSession(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const sessionId = String(req.params.id);

      const result = await interviewService.deleteSession(userId, sessionId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || "Failed to delete session" });
    }
  }

  /**
   * GET /api/interviews/sessions/:id/report
   */
  async getReport(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const sessionId = String(req.params.id);

      const session = await interviewService.getSession(userId, sessionId);
      const report = buildInterviewReport(session);

      res.json({ success: true, data: report });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || "Report not found" });
    }
  }

  /**
   * POST /api/interviews/questions/generate-from-jd
   */
  async generateQuestionsFromJd(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobDescription, role, difficulty } = req.body;

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 20) {
        return res.status(400).json({
          success: false,
          error: "Please provide a job description of at least 20 characters.",
        });
      }

      const generated = await interviewService.generateQuestionsFromJd(userId, jobDescription, role, difficulty);
      res.json({ success: true, data: generated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to generate questions" });
    }
  }

  /**
   * GET /api/interviews/answers/:id/download
   * Streams audio or video recording for the authenticated user only
   */
  async downloadAnswerMedia(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const answerId = String(req.params.id);

      const answer = await prisma.interviewAnswer.findFirst({
        where: { id: answerId, userId },
      });

      if (!answer) {
        return res.status(404).json({ success: false, error: "Answer recording not found." });
      }

      const mediaUrl = answer.videoUrl || answer.audioUrl;
      if (!mediaUrl) {
        return res.status(404).json({ success: false, error: "No media file recorded for this answer." });
      }

      // If it's a local /uploads/ URL, stream file directly with Range support
      if (mediaUrl.startsWith("/uploads/")) {
        const filePath = path.resolve(process.cwd(), "data", mediaUrl.replace(/^\//, ""));
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ success: false, error: "Media file missing from storage." });
        }

        const stat = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = ext === ".mp4" ? "video/mp4" : ext === ".webm" ? "video/webm" : "audio/webm";

        res.setHeader("Content-Disposition", `attachment; filename="interview-answer-${answer.id}${ext}"`);
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Length", stat.size);
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.redirect(mediaUrl);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Download failed." });
    }
  }

  /**
   * POST /api/interviews/sessions/:id/start
   */
  async startSession(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const id = String(req.params.id);
      const started = await interviewService.startSession(userId, id);
      res.json({ success: true, data: started });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || "Failed to start session" });
    }
  }

  /**
   * GET /api/interviews/answers/:id
   */
  async getAnswer(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const answerId = String(req.params.id);
      const answer = await interviewService.getAnswer(userId, answerId);
      res.json({ success: true, data: answer });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || "Answer not found" });
    }
  }

  /**
   * POST /api/interviews/answers/:id/follow-up
   */
  async generateFollowUp(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const answerId = String(req.params.id);
      const followUp = await interviewService.generateFollowUp(userId, answerId);
      res.json({ success: true, data: followUp });
    } catch (err: any) {
      console.error("Error generating follow-up:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate follow-up" });
    }
  }

  /**
   * POST /api/interviews/sessions/:id/integrity
   */
  async recordIntegrityEvents(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const sessionId = String(req.params.id);
      const { events, answerId } = req.body;

      const result = await interviewService.recordIntegrityEvents(userId, sessionId, events || [], answerId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to record integrity events" });
    }
  }

  /**
   * GET /api/interviews/sessions/:id/integrity
   */
  async getIntegritySummary(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const sessionId = String(req.params.id);
      const summary = await interviewService.getIntegritySummary(userId, sessionId);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || "Failed to get integrity summary" });
    }
  }

  /**
   * GET /api/interviews/sessions/:id/insights
   */
  async getInsights(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const sessionId = String(req.params.id);
      const insights = await interviewService.getInsights(userId, sessionId);
      res.json({ success: true, data: insights });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message || "Failed to get session insights" });
    }
  }

  /**
   * GET /api/interviews/questions/:id
   */
  async getQuestionById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const q = await prisma.interviewQuestion.findUnique({ where: { id } });
      if (!q) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }
      res.json({
        success: true,
        data: {
          ...q,
          rubric: JSON.parse(q.rubric || "{}"),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to fetch question" });
    }
  }

  /**
   * POST /api/interviews/sessions/:id/next-question
   */
  async getNextQuestion(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const sessionId = String(req.params.id);
      const nextQ = await interviewService.getNextSessionQuestion(userId, sessionId);
      res.json({ success: true, data: nextQ });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to get next question" });
    }
  }

  /**
   * GET /api/interviews/skills
   */
  async getSkillProfile(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const profile = await interviewService.getSkillProfile(userId);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to get skill profile" });
    }
  }
}

export const interviewController = new InterviewController();

