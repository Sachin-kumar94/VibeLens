import { Request, Response } from "express";
import { DocumentAI } from "../services/ai/documentAI.js";
import { InterviewAI } from "../services/ai/interviewAI.js";
import { EvaluationAI } from "../services/ai/evaluationAI.js";
import { InsightAI } from "../services/ai/insightAI.js";
import { FusionAnalyzer } from "../services/ai/fusionAnalyzer.js";
import { VoiceAnalyzer } from "../services/ai/voiceAnalyzer.js";
import { BodyAnalyzer } from "../services/ai/bodyAnalyzer.js";
import { ResumeAnalyzer } from "../services/documents/resumeAnalyzer.js";
import { JobDescriptionAnalyzer } from "../services/documents/jobDescriptionAnalyzer.js";
import { AiService } from "../services/ai/aiService.js";
import { prisma } from "../services/prisma.service.js";

async function resolveUserId(req: Request): Promise<string> {
  if ((req as any).user?.id) {
    return (req as any).user.id;
  }
  const firstUser = await prisma.user.findFirst({ select: { id: true } });
  return firstUser ? firstUser.id : "demo_user";
}

export class AiController {
  /**
   * POST /api/ai/chat
   * Ask VibeLens / Study Assistant RAG Q&A grounded in uploaded notes
   */
  public static async chat(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const { message, question, documentId, conversationId } = req.body;
      const queryText = (message || question || "").trim();

      if (!queryText) {
        return res.status(400).json({ success: false, message: "Query text or message is required" });
      }

      const result = await DocumentAI.askStudyAssistant({
        userId,
        question: queryText,
        documentId,
        conversationId,
      });

      return res.json({ success: true, data: result });
    } catch (err: any) {
      console.error("[AiController.chat] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to process chat" });
    }
  }

  /**
   * POST /api/ai/interview/question
   */
  public static async generateInterviewQuestion(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const { role, position, interviewType, difficulty, category, contextText, sourceType } = req.body;

      const question = await InterviewAI.generateQuestion({
        userId,
        role: role || "Software Engineer",
        position: position || "Junior",
        interviewType: interviewType || "Technical",
        difficulty: difficulty || "Intermediate",
        category: category || "Technical Fundamentals",
        contextText,
        sourceType,
      });

      return res.json({ success: true, data: question });
    } catch (err: any) {
      console.error("[AiController.generateInterviewQuestion] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to generate question" });
    }
  }

  /**
   * POST /api/ai/interview/evaluate
   */
  public static async evaluateInterviewAnswer(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const {
        questionId,
        questionText,
        userAnswer,
        answerText,
        transcript,
        expectedConcepts,
        category,
        duration,
        durationSeconds,
        wpm,
        pauseCount,
        fillerCount,
        cameraFacingSignal,
        postureSignal,
      } = req.body;

      const rawAnswer = (userAnswer || answerText || transcript || "").trim();

      // If existing database questionId is provided, evaluate via InterviewAI
      if (questionId) {
        const evaluation = await InterviewAI.evaluateCandidateAnswer({
          userId,
          questionId,
          answerText: rawAnswer,
          transcript: rawAnswer,
          duration: duration || durationSeconds,
          wpm,
          pauseCount,
          fillerCount,
          cameraFacingSignal,
          postureSignal,
        });
        return res.json({ success: true, data: evaluation });
      }

      // If questionText and rawAnswer are provided directly, evaluate via AiService
      if (questionText && rawAnswer) {
        const evaluation = await AiService.evaluateInterviewAnswer({
          userId,
          questionText,
          expectedConcepts: expectedConcepts || [],
          userAnswer: rawAnswer,
          category: category || "Technical Fundamentals",
          durationSeconds: durationSeconds || duration || 60,
          wpm: wpm || 130,
          pauseCount: pauseCount || 2,
          fillerCount: fillerCount || 1,
          cameraFacingSignal: cameraFacingSignal || "Steady",
        });
        return res.json({ success: true, data: evaluation });
      }

      return res.status(400).json({
        success: false,
        message: "Either questionId or (questionText and userAnswer) is required",
      });
    } catch (err: any) {
      console.error("[AiController.evaluateInterviewAnswer] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to evaluate answer" });
    }
  }

  /**
   * POST /api/ai/interview/follow-up
   */
  public static async generateFollowUp(req: Request, res: Response) {
    try {
      const { questionText, category, role, transcript, candidateAnswer, criteria, followUpNumber } = req.body;
      const textToAnalyze = (transcript || candidateAnswer || "").trim();

      if (!textToAnalyze || textToAnalyze.length < 5) {
        return res.status(400).json({ success: false, message: "Answer or transcript is required for follow-up" });
      }

      const followUp = await InterviewAI.generateFollowUp({
        questionText: questionText || "Initial question",
        category: category || "Technical Fundamentals",
        role: role || "Software Engineer",
        transcript: textToAnalyze,
        criteria,
        followUpNumber: followUpNumber || 1,
      });

      return res.json({
        success: true,
        data: {
          ...followUp,
          followUpQuestion: followUp.question,
        },
      });
    } catch (err: any) {
      console.error("[AiController.generateFollowUp] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to generate follow-up" });
    }
  }

  /**
   * POST /api/ai/documents/quiz
   */
  public static async generateQuiz(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const { documentId, questionsCount, difficulty } = req.body;

      if (!documentId) {
        return res.status(400).json({ success: false, message: "documentId is required" });
      }

      const quiz = await DocumentAI.generateQuiz({
        userId,
        documentId,
        questionsCount: questionsCount ? Number(questionsCount) : 5,
        difficulty: difficulty || "Intermediate",
      });

      return res.json({ success: true, data: quiz });
    } catch (err: any) {
      console.error("[AiController.generateQuiz] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to generate quiz" });
    }
  }

  /**
   * POST /api/ai/documents/flashcards
   */
  public static async generateFlashcards(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const { documentId, count } = req.body;

      if (!documentId) {
        return res.status(400).json({ success: false, message: "documentId is required" });
      }

      const cards = await DocumentAI.generateFlashcards({
        userId,
        documentId,
        count: count ? Number(count) : 8,
      });

      return res.json({ success: true, data: cards });
    } catch (err: any) {
      console.error("[AiController.generateFlashcards] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to generate flashcards" });
    }
  }

  /**
   * POST /api/ai/documents/summary
   */
  public static async generateSummary(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const { documentId, content, title } = req.body;

      if (documentId) {
        const summary = await DocumentAI.generateNotesSummary({
          userId,
          documentId,
        });
        return res.json({ success: true, data: summary });
      }

      if (content) {
        const summary = await DocumentAI.summarizeDirectContent({
          content,
          title: title || "Study Material",
        });
        return res.json({ success: true, data: summary });
      }

      return res.status(400).json({ success: false, message: "documentId or content is required" });
    } catch (err: any) {
      console.error("[AiController.generateSummary] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to generate summary" });
    }
  }

  /**
   * POST /api/ai/resume/analyze
   */
  public static async analyzeResume(req: Request, res: Response) {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, message: "Resume text is required" });
      }
      const profile = await ResumeAnalyzer.analyze(text);
      return res.json({ success: true, data: profile });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/ai/jd/analyze
   */
  public static async analyzeJobDescription(req: Request, res: Response) {
    try {
      const { text, resumeSkills } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, message: "Job description text is required" });
      }
      const jd = JobDescriptionAnalyzer.analyze(text);
      let overlap = undefined;
      if (resumeSkills && Array.isArray(resumeSkills) && resumeSkills.length > 0) {
        overlap = JobDescriptionAnalyzer.prioritizeSkills(resumeSkills, jd.skills);
      }
      return res.json({ success: true, data: { ...jd, overlap } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/ai/study-plan
   */
  public static async generateStudyPlan(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const { targetRole, durationDays } = req.body;

      const plan = await InsightAI.generateStudyPlan({
        userId,
        targetRole: targetRole || "Software Engineer",
        durationDays: durationDays ? Number(durationDays) : 7,
      });

      return res.json({ success: true, data: plan });
    } catch (err: any) {
      console.error("[AiController.generateStudyPlan] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to generate study plan" });
    }
  }

  /**
   * GET /api/ai/memory
   */
  public static async getMemory(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const memory = await InsightAI.getCandidateMemory(userId);
      return res.json({ success: true, data: memory });
    } catch (err: any) {
      console.error("[AiController.getMemory] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to fetch candidate memory" });
    }
  }

  /**
   * POST /api/ai/search
   */
  public static async search(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const { query } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Query is required" });
      }

      const results = await InsightAI.semanticSearch({ userId, query });
      return res.json({ success: true, data: results });
    } catch (err: any) {
      console.error("[AiController.search] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to perform AI search" });
    }
  }

  /**
   * POST /api/ai/explain
   */
  public static async explain(req: Request, res: Response) {
    try {
      const userId = await resolveUserId(req);
      const { type, contextText, questionText, candidateAnswer, category, score } = req.body;

      if (!contextText && !questionText) {
        return res.status(400).json({ success: false, message: "contextText or questionText is required" });
      }

      const result = await EvaluationAI.explainContext({
        type: type || "score",
        contextText: contextText || "",
        questionText,
        candidateAnswer,
        category,
        score,
        userId,
      });

      return res.json({ success: true, data: result });
    } catch (err: any) {
      console.error("[AiController.explain] error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to explain context" });
    }
  }

  /**
   * POST /api/ai/fusion/analyze
   */
  public static async analyzeFusion(req: Request, res: Response) {
    try {
      const result = await FusionAnalyzer.analyze(req.body);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/ai/voice/analyze
   */
  public static async analyzeVoice(req: Request, res: Response) {
    try {
      const result = await VoiceAnalyzer.analyze(req.body);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/ai/body/analyze
   */
  public static async analyzeBody(req: Request, res: Response) {
    try {
      const result = await BodyAnalyzer.analyze(req.body);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/ai/health
   */
  public static async health(_req: Request, res: Response) {
    try {
      const health = await AiService.getHealth();
      return res.json({ success: true, data: health });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/ai/test
   */
  public static async test(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const result = await AiService.testBrain(message);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/ai/image
   */
  public static async analyzeImage(req: Request, res: Response) {
    try {
      const { imagePath, mimeType, fileName } = req.body;
      const result = await AiService.analyzeImage({ imagePath, mimeType, fileName });
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
