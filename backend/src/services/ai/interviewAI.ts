import { prisma } from "../prisma.service.js";
import { evaluateAnswerDeeply, DeepEvaluationResult } from "../interview/answerEvaluator.js";
import { generateContextualFollowUp } from "../interview/followUpGenerator.js";
import { calculateNextAdaptiveStep, DifficultyLevel, SessionHistoryItem } from "../interview/adaptiveInterviewEngine.js";
import { geminiClient } from "./geminiClient.js";

export interface GenerateInterviewQuestionRequest {
  userId?: string;
  role: string;
  position?: string;
  interviewType?: string;
  difficulty?: string;
  category?: string;
  contextText?: string;
  sourceType?: "standard" | "resume" | "job_description" | "study_material";
}

export interface EvaluateAnswerRequest {
  userId: string;
  sessionId?: string;
  questionId: string;
  answerText?: string;
  transcript?: string;
  duration?: number;
  wpm?: number;
  pauseCount?: number;
  fillerCount?: number;
  cameraFacingSignal?: string;
  postureSignal?: string;
  integritySignals?: any;
}

export class InterviewAI {
  /**
   * Generates a tailored question considering role, seniority, and document context
   */
  public static async generateQuestion(params: GenerateInterviewQuestionRequest) {
    const { role, position = "Junior", interviewType = "Technical", difficulty = "Intermediate", category = "Technical Fundamentals", contextText } = params;

    if (contextText && contextText.length > 50) {
      const generated = await geminiClient.generateQuestionsFromContext({
        contextText,
        role: `${position} ${role}`,
        difficulty,
        interviewType,
        count: 1,
      });

      if (generated && generated.length > 0) {
        return generated[0];
      }
    }

    // Pull from question bank
    const questions = await prisma.interviewQuestion.findMany({
      where: {
        category,
        difficulty,
      },
      take: 5,
    });

    if (questions.length > 0) {
      const randomQ = questions[Math.floor(Math.random() * questions.length)];
      return {
        question: randomQ.question,
        category: randomQ.category,
        criteria: randomQ.criteria,
        whyThisQuestion: randomQ.whyThisQuestion || "Core domain evaluation",
        expectedConcepts: randomQ.expectedConcepts ? JSON.parse(randomQ.expectedConcepts) : [],
        referenceAnswer: randomQ.referenceAnswer || "",
      };
    }

    return {
      question: `For a ${position} ${role}, how would you approach architecting a resilient data pipeline or service that handles unexpected spikes in load?`,
      category,
      criteria: "Evaluates architectural trade-offs, scalability, and error mitigation.",
      whyThisQuestion: "Tests distributed systems readiness and operational mindset.",
      expectedConcepts: ["Decoupling with queues", "Rate limiting", "Horizontal scaling", "Backoff retries"],
      referenceAnswer: "Use an asynchronous queue (e.g. Kafka/RabbitMQ) to absorb spikes, apply token-bucket rate limiting, and deploy auto-scaling worker nodes.",
    };
  }

  /**
   * Deeply evaluates candidate's answer with 7 exact statuses, rubrics, and citations
   */
  public static async evaluateCandidateAnswer(params: EvaluateAnswerRequest): Promise<DeepEvaluationResult> {
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: params.questionId },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    // Parse question fields
    let expectedConcepts: string[] = [];
    let acceptableConcepts: string[] = [];
    let commonMistakes: string[] = [];
    let rubric: any = { structure: 20, relevance: 25, clarity: 20, delivery: 15, evidence: 20 };

    try { expectedConcepts = question.expectedConcepts ? JSON.parse(question.expectedConcepts) : []; } catch {}
    try { acceptableConcepts = question.acceptableConcepts ? JSON.parse(question.acceptableConcepts) : []; } catch {}
    try { commonMistakes = question.commonMistakes ? JSON.parse(question.commonMistakes) : []; } catch {}
    try { rubric = question.rubric ? JSON.parse(question.rubric) : rubric; } catch {}

    // Previous attempt for comparison
    const previousAnswer = await prisma.interviewAnswer.findFirst({
      where: {
        userId: params.userId,
        questionId: params.questionId,
      },
      orderBy: { attemptNumber: "desc" },
      include: { evaluation: true },
    });

    const previousEvaluation = previousAnswer?.evaluation ? {
      overallScore: previousAnswer.evaluation.overallScore,
      status: previousAnswer.evaluation.status,
    } : null;

    const answerContent = (params.answerText || params.transcript || "").trim();

    return evaluateAnswerDeeply({
      questionText: question.question,
      category: question.category,
      difficulty: question.difficulty,
      role: question.role || "Software Engineer",
      expectedConcepts,
      acceptableConcepts,
      commonMistakes,
      referenceAnswer: question.referenceAnswer || "Provide a structured, evidence-grounded answer addressing operational trade-offs.",
      rubric,
      answerText: answerContent,
      sourceCitation: question.sourceCitation || undefined,
      duration: params.duration || 60,
      attemptNumber: (previousAnswer?.attemptNumber || 0) + 1,
      previousEvaluation,
      wpm: params.wpm || 135,
    });
  }

  /**
   * Contextual follow-up question probing specific decisions and trade-offs
   */
  public static async generateFollowUp(params: {
    questionText: string;
    category: string;
    role: string;
    transcript: string;
    difficulty?: string;
    criteria?: string;
    followUpNumber?: number;
    answerScore?: number;
  }) {
    return generateContextualFollowUp({
      mainQuestionText: params.questionText,
      category: params.category,
      role: params.role,
      difficulty: params.difficulty || "Intermediate",
      candidateAnswerText: params.transcript,
      missingConcepts: [],
      followUpTemplates: [],
      currentFollowUpNumber: params.followUpNumber || 1,
      answerScore: params.answerScore || 75,
    });
  }

  /**
   * Calculates next difficulty step respecting maximum difficulty ceiling
   */
  public static calculateAdaptiveDifficulty(
    history: SessionHistoryItem[],
    currentConfiguredDifficulty: DifficultyLevel,
    isAdaptiveModeEnabled: boolean,
    maxDifficulty: DifficultyLevel = "Expert"
  ) {
    return calculateNextAdaptiveStep(history, currentConfiguredDifficulty, isAdaptiveModeEnabled, maxDifficulty);
  }
}
