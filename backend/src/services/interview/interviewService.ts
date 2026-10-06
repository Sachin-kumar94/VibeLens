import { prisma } from "../prisma.service.js";
import { SYSTEM_QUESTION_BANK, SeedQuestion } from "./interviewQuestionBank.js";
import { evaluateAnswerDeeply, DeepEvaluationResult } from "./answerEvaluator.js";
import { selectSessionQuestions, queryFilteredQuestions } from "./questionSelector.js";
import { generateDynamicQuestionsFromText } from "./questionGenerator.js";
import { generateContextualFollowUp } from "./followUpGenerator.js";
import { calculateNextAdaptiveStep, DifficultyLevel } from "./adaptiveInterviewEngine.js";
import { recordSkillAttempts, getUserSkillProfile } from "./skillMasteryEngine.js";
import { buildInterviewReport } from "./interviewReportService.js";

export class InterviewService {
  /**
   * Seed the system question bank with full metadata if missing or update
   */
  async ensureSystemQuestionsSeeded() {
    try {
      const count = await prisma.interviewQuestion.count({
        where: { isCustom: false },
      });

      // If count is less than bank size, update/seed
      if (count < SYSTEM_QUESTION_BANK.length) {
        console.log("▲ Synchronizing Interview Question Bank into SQLite/Prisma...");
        for (const q of SYSTEM_QUESTION_BANK) {
          const existing = await prisma.interviewQuestion.findFirst({
            where: { question: q.question, isCustom: false },
          });

          const data = {
            category: q.category,
            subCategory: q.subCategory || null,
            role: q.role,
            roles: JSON.stringify(q.roles || [q.role]),
            interviewTypes: JSON.stringify(q.interviewTypes || ["Technical"]),
            difficulty: q.difficulty,
            tags: JSON.stringify(q.tags || []),
            skills: JSON.stringify(q.skills || []),
            question: q.question,
            criteria: q.criteria,
            whyThisQuestion: q.whyThisQuestion || null,
            timeTargetMin: q.timeTargetMin || 60,
            timeTargetMax: q.timeTargetMax || 90,
            expectedConcepts: JSON.stringify(q.expectedConcepts || []),
            acceptableConcepts: JSON.stringify(q.acceptableConcepts || []),
            commonMistakes: JSON.stringify(q.commonMistakes || []),
            referenceAnswer: q.referenceAnswer || null,
            rubric: JSON.stringify(q.rubric),
            followUpTemplates: JSON.stringify(q.followUpTemplates || []),
            hints: JSON.stringify(q.hints || []),
            isCustom: false,
            source: "system",
          };

          if (existing) {
            await prisma.interviewQuestion.update({
              where: { id: existing.id },
              data,
            });
          } else {
            await prisma.interviewQuestion.create({ data });
          }
        }
        console.log(`✓ Synchronized ${SYSTEM_QUESTION_BANK.length} curated questions.`);
      }
    } catch (e) {
      console.warn("Interview question seed warning:", e);
    }
  }

  /**
   * Query available questions with optional filters
   */
  async getQuestions(
    userId: string,
    filters: {
      category?: string;
      role?: string;
      difficulty?: string;
      search?: string;
      customOnly?: boolean;
    } = {}
  ) {
    await this.ensureSystemQuestionsSeeded();

    const questions = await queryFilteredQuestions({
      userId,
      role: filters.role,
      category: filters.category,
      difficulty: filters.difficulty,
      search: filters.search,
      customOnly: filters.customOnly,
    });

    return questions.map((q) => {
      let parsedRubric = {
        structure: 25,
        relevance: 25,
        clarity: 20,
        delivery: 15,
        evidence: 15,
      };
      try { parsedRubric = JSON.parse(q.rubric); } catch (e) {}

      let expectedConcepts: string[] = [];
      let acceptableConcepts: string[] = [];
      let commonMistakes: string[] = [];
      let hints: string[] = [];
      let followUpTemplates: string[] = [];
      let tags: string[] = [];
      let skills: string[] = [];
      let roles: string[] = [];
      let interviewTypes: string[] = [];

      try { if (q.expectedConcepts) expectedConcepts = JSON.parse(q.expectedConcepts); } catch (e) {}
      try { if (q.acceptableConcepts) acceptableConcepts = JSON.parse(q.acceptableConcepts); } catch (e) {}
      try { if (q.commonMistakes) commonMistakes = JSON.parse(q.commonMistakes); } catch (e) {}
      try { if (q.hints) hints = JSON.parse(q.hints); } catch (e) {}
      try { if (q.followUpTemplates) followUpTemplates = JSON.parse(q.followUpTemplates); } catch (e) {}
      try { if (q.tags) tags = JSON.parse(q.tags); } catch (e) {}
      try { if (q.skills) skills = JSON.parse(q.skills); } catch (e) {}
      try { if (q.roles) roles = JSON.parse(q.roles); } catch (e) {}
      try { if (q.interviewTypes) interviewTypes = JSON.parse(q.interviewTypes); } catch (e) {}

      return {
        ...q,
        rubric: parsedRubric,
        expectedConcepts,
        acceptableConcepts,
        commonMistakes,
        hints,
        followUpTemplates,
        tags,
        skills,
        roles,
        interviewTypes,
      };
    });
  }

  /**
   * Create a user-owned custom question
   */
  async createCustomQuestion(
    userId: string,
    data: {
      question: string;
      category?: string;
      role?: string;
      difficulty?: string;
      criteria?: string;
      timeTargetMin?: number;
      timeTargetMax?: number;
      rubric?: any;
      expectedConcepts?: string[];
      referenceAnswer?: string;
      hints?: string[];
    }
  ) {
    const defaultRubric = data.rubric || {
      structure: 25,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 15,
      methodology: "GENERAL_COMMUNICATION",
    };

    return await prisma.interviewQuestion.create({
      data: {
        userId,
        question: data.question.trim(),
        category: data.category || "Custom",
        role: data.role || "General",
        roles: JSON.stringify([data.role || "General"]),
        interviewTypes: JSON.stringify(["Technical", "Problem Solving"]),
        difficulty: data.difficulty || "Intermediate",
        criteria: data.criteria || "Clear articulation, structured reasoning, concrete examples.",
        timeTargetMin: Number(data.timeTargetMin) || 60,
        timeTargetMax: Number(data.timeTargetMax) || 90,
        expectedConcepts: JSON.stringify(data.expectedConcepts || ["Clear problem statement", "Reasoned solution"]),
        acceptableConcepts: JSON.stringify(["Alternative acceptable implementations"]),
        commonMistakes: JSON.stringify(["Vague claims without justification"]),
        referenceAnswer: data.referenceAnswer || "A complete response addresses core requirements and trade-offs.",
        hints: JSON.stringify(data.hints || ["Break the problem down step by step."]),
        rubric: JSON.stringify(defaultRubric),
        isCustom: true,
        source: "user",
        whyThisQuestion: "User-defined custom practice scenario.",
      },
    });
  }

  /**
   * Delete a user's custom question
   */
  async deleteCustomQuestion(userId: string, questionId: string) {
    const q = await prisma.interviewQuestion.findFirst({
      where: { id: questionId, userId, isCustom: true },
    });
    if (!q) {
      throw new Error("Custom question not found or unauthorized.");
    }

    return await prisma.interviewQuestion.delete({
      where: { id: questionId },
    });
  }

  /**
   * Create a new interview practice session with curated/dynamic initial questions
   */
  async createSession(
    userId: string,
    data: {
      role?: string;
      position?: string;
      experienceRange?: string;
      interviewType?: string;
      category?: string;
      difficulty?: string;
      maxDifficulty?: string;
      practiceMode?: string;
      learningMode?: string;
      questionSources?: string[];
      documentIds?: string[];
      jobDescription?: string;
      resumeText?: string;
      resumeId?: string;
      questionCount?: number;
      targetDuration?: number;
      targetMin?: number;
      targetMax?: number;
      cameraMode?: string;
      cameraEnabled?: boolean;
      microphoneEnabled?: boolean;
      adaptiveDifficulty?: boolean;
      followUpsEnabled?: boolean;
    }
  ) {
    await this.ensureSystemQuestionsSeeded();

    const role = data.role || "Software Engineer";
    const position = data.position || "Mid-Level";
    const experienceRange = data.experienceRange || "1–3 years";
    const interviewType = data.interviewType || "Behavioral";
    const category = data.category || "All";
    const difficulty = data.difficulty || "Intermediate";
    const maxDifficulty = data.maxDifficulty || difficulty;
    const questionCount = data.questionCount || 5;
    const learningMode = data.learningMode || data.practiceMode || "Interview";
    const questionSources =
      data.questionSources && data.questionSources.length > 0
        ? data.questionSources
        : ["STANDARD", "RESUME", "STUDY_MATERIAL", "JOB_DESCRIPTION"];

    // If Job Description is provided, generate tailored questions to include
    if (data.jobDescription && data.jobDescription.trim().length >= 20) {
      try {
        await generateDynamicQuestionsFromText({
          userId,
          sourceText: data.jobDescription,
          sourceType: "job_description",
          role,
          difficulty: difficulty as any,
          interviewType,
          count: 2,
        });
      } catch (err) {
        console.warn("Could not generate questions from job description:", err);
      }
    }

    // Select initial questions with source awareness
    const initialQuestions = await selectSessionQuestions({
      userId,
      role,
      interviewType,
      category,
      difficulty,
      questionCount,
      questionSources,
    });

    const session = await prisma.interviewSession.create({
      data: {
        userId,
        role,
        position,
        experienceRange,
        interviewType,
        category,
        difficulty,
        maxDifficulty,
        practiceMode: learningMode,
        learningMode,
        questionSources: JSON.stringify(questionSources),
        documentIds: JSON.stringify(data.documentIds || []),
        jobDescription: data.jobDescription || null,
        resumeText: data.resumeText || null,
        resumeId: data.resumeId || null,
        questionCount,
        targetDuration: data.targetDuration || 300,
        targetMin: data.targetMin || 60,
        targetMax: data.targetMax || 90,
        cameraMode: data.cameraMode || (data.cameraEnabled === false ? "audio_only" : "enabled"),
        cameraEnabled: data.cameraEnabled !== undefined ? data.cameraEnabled : true,
        microphoneEnabled: data.microphoneEnabled !== undefined ? data.microphoneEnabled : true,
        adaptiveDifficulty: Boolean(data.adaptiveDifficulty),
        followUpsEnabled: data.followUpsEnabled !== undefined ? data.followUpsEnabled : true,
        status: "IN_PROGRESS",
      },
      include: {
        answers: {
          include: {
            question: true,
            evaluation: true,
          },
        },
        integrityEvents: true,
      },
    });

    return {
      ...session,
      initialQuestions,
    };
  }

  /**
   * Start a session after Lobby / Device Check
   */
  async startSession(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new Error("Interview session not found or unauthorized.");
    }
    return await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: "IN_PROGRESS" },
      include: {
        answers: {
          include: {
            question: true,
            evaluation: true,
          },
        },
      },
    });
  }

  /**
   * Get an interview session with full details
   */
  async getSession(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        answers: {
          include: {
            question: true,
            evaluation: true,
            parentAnswer: true,
            followUpAnswers: {
              include: {
                question: true,
                evaluation: true,
              },
            },
            integrityRecords: {
              orderBy: { timestamp: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        integrityEvents: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!session) {
      throw new Error("Interview session not found or unauthorized.");
    }

    return session;
  }

  /**
   * Record, deeply evaluate, and save an answer (Supports text answers, retries, attempts)
   */
  async saveAndEvaluateAnswer(
    userId: string,
    sessionId: string,
    answerData: {
      questionId: string;
      parentAnswerId?: string;
      answerType?: string; // "PRIMARY" | "FOLLOW_UP_1" | "FOLLOW_UP_2"
      attemptNumber?: number;
      textAnswer?: string;
      duration: number;
      audioUrl?: string;
      videoUrl?: string;
      transcript?: string;
      wpm?: number;
      pauseCount?: number;
      avgPauseDuration?: number;
      longestPause?: number;
      fillerCount?: number;
      fillerRate?: number;
      cameraFacingSignal?: string;
      postureSignal?: string;
      framingQuality?: string;
      audioQuality?: string;
      videoQuality?: string;
      hasVisualData?: boolean;
      faceVisibility?: number;
      integrityEvents?: any[];
    }
  ) {
    // 1. Verify session ownership
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new Error("Session not found or unauthorized.");
    }

    // 2. Retrieve question metadata
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: answerData.questionId },
    });
    if (!question) {
      throw new Error("Question not found.");
    }

    let parsedRubric = {
      structure: 25,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 15,
    };
    try { parsedRubric = JSON.parse(question.rubric); } catch (e) {}

    let expectedConcepts: string[] = [];
    let acceptableConcepts: string[] = [];
    let commonMistakes: string[] = [];
    let skills: string[] = [];

    try { if (question.expectedConcepts) expectedConcepts = JSON.parse(question.expectedConcepts); } catch (e) {}
    try { if (question.acceptableConcepts) acceptableConcepts = JSON.parse(question.acceptableConcepts); } catch (e) {}
    try { if (question.commonMistakes) commonMistakes = JSON.parse(question.commonMistakes); } catch (e) {}
    try { if (question.skills) skills = JSON.parse(question.skills); } catch (e) {}

    // Check previous attempt evaluation if attemptNumber > 1
    const attemptNumber = answerData.attemptNumber || 1;
    let previousEvaluation = null;
    if (attemptNumber > 1) {
      const prevAnswer = await prisma.interviewAnswer.findFirst({
        where: {
          sessionId,
          questionId: answerData.questionId,
          userId,
          attemptNumber: attemptNumber - 1,
        },
        include: { evaluation: true },
      });
      if (prevAnswer?.evaluation) {
        previousEvaluation = {
          overallScore: prevAnswer.evaluation.overallScore,
          status: prevAnswer.evaluation.status,
        };
      }
    }

    const answerContent = (answerData.textAnswer || answerData.transcript || "").trim();

    // 3. Perform Deep Semantic Evaluation
    const deepEval = await evaluateAnswerDeeply({
      questionText: question.question,
      category: question.category,
      difficulty: question.difficulty,
      role: session.role,
      expectedConcepts,
      acceptableConcepts,
      commonMistakes,
      referenceAnswer: question.referenceAnswer || "Provide a clear, structured explanation with technical mechanics and trade-offs.",
      rubric: parsedRubric,
      answerText: answerContent,
      sourceCitation: question.sourceCitation || undefined,
      duration: answerData.duration || 0,
      attemptNumber,
      previousEvaluation,
      wpm: answerData.wpm,
    });

    // 4. Save Answer & Evaluation transactionally
    const savedResult = await prisma.$transaction(async (tx) => {
      // Create new answer record for this attempt
      const answerRecord = await tx.interviewAnswer.create({
        data: {
          sessionId,
          questionId: answerData.questionId,
          userId,
          parentAnswerId: answerData.parentAnswerId || null,
          answerType: answerData.answerType || "PRIMARY",
          attemptNumber,
          textAnswer: answerData.textAnswer || null,
          duration: answerData.duration || 0,
          audioUrl: answerData.audioUrl,
          videoUrl: answerData.videoUrl,
          transcript: answerData.transcript || answerData.textAnswer,
          wpm: answerData.wpm || 0,
          pauseCount: answerData.pauseCount || 0,
          avgPauseDuration: answerData.avgPauseDuration || 0,
          longestPause: answerData.longestPause || 0,
          fillerCount: answerData.fillerCount || 0,
          fillerRate: answerData.fillerRate || 0,
          cameraFacingSignal: answerData.cameraFacingSignal || "Unavailable",
          faceVisibility: answerData.faceVisibility || 0.94,
          postureSignal: answerData.postureSignal || "Unavailable",
          framingQuality: answerData.framingQuality || "Good",
          audioQuality: answerData.audioQuality || "Good",
          videoQuality: answerData.videoQuality || "Good",
          sourceDocumentId: question.sourceDocumentId || null,
          sourceChunkId: question.sourceChunkId || null,
          sourceCitation: question.sourceCitation || null,
          status: "COMPLETED",
        },
      });

      // Record any integrity events
      if (Array.isArray(answerData.integrityEvents) && answerData.integrityEvents.length > 0) {
        for (const evt of answerData.integrityEvents) {
          await tx.interviewIntegrityEvent.create({
            data: {
              sessionId,
              answerId: answerRecord.id,
              userId,
              type: evt.type || "INTERACTION_EVENT",
              timestamp: Number(evt.timestamp) || 0,
              duration: Number(evt.duration) || 0,
              confidence: Number(evt.confidence) || 1.0,
              source: evt.source || "client_event_monitor",
              metadata: evt.metadata ? JSON.stringify(evt.metadata) : null,
            },
          });
        }
      }

      // Create evaluation record
      const evaluationRecord = await tx.interviewEvaluation.create({
        data: {
          answerId: answerRecord.id,
          status: deepEval.status,
          overallScore: deepEval.overallScore,
          structureScore: deepEval.categoryScores.structure,
          relevanceScore: deepEval.categoryScores.technical,
          clarityScore: deepEval.categoryScores.communication,
          deliveryScore: deepEval.categoryScores.delivery,
          evidenceScore: deepEval.categoryScores.technical,
          categoryScores: JSON.stringify(deepEval.categoryScores),
          strengths: JSON.stringify(deepEval.strengths),
          improvements: JSON.stringify(deepEval.improvements),
          nextPractice: JSON.stringify(deepEval.improvements),
          explanation: deepEval.explanation,
          missingConcepts: JSON.stringify(deepEval.missingConcepts),
          incorrectConcepts: JSON.stringify(deepEval.incorrectConcepts),
          referenceAnswer: deepEval.referenceAnswer,
          improvedAnswer: deepEval.improvedAnswer,
          simpleExplanation: deepEval.simpleExplanation || null,
          sourceCitations: deepEval.sourceCitations ? JSON.stringify(deepEval.sourceCitations) : null,
          whyThisAssessment: deepEval.whyThisAssessment,
          attemptComparison: deepEval.attemptComparison ? JSON.stringify(deepEval.attemptComparison) : null,
          feedback: deepEval.whyThisAssessment,
          rubricVersion: "2.1.0",
          analysisProvider: "vibelens-advanced-engine-v2",
        },
      });

      return {
        ...answerRecord,
        question: {
          ...question,
          rubric: parsedRubric,
          expectedConcepts,
          acceptableConcepts,
          commonMistakes,
          referenceAnswer: question.referenceAnswer,
        },
        evaluation: {
          ...evaluationRecord,
          strengths: deepEval.strengths,
          improvements: deepEval.improvements,
          missingConcepts: deepEval.missingConcepts,
          incorrectConcepts: deepEval.incorrectConcepts,
          categoryScores: deepEval.categoryScores,
          rememberRule: deepEval.rememberRule,
          simpleExplanation: deepEval.simpleExplanation,
          sourceCitations: deepEval.sourceCitations,
          attemptComparison: deepEval.attemptComparison,
        },
      };
    });

    // 5. Asynchronously record skill mastery in background
    const questionSkills = skills.length > 0 ? skills : [question.category, session.role];
    recordSkillAttempts(userId, questionSkills, deepEval.overallScore).catch((err) =>
      console.warn("Skill mastery update notice:", err)
    );

    return savedResult;
  }

  /**
   * Adapt and select the next question for a session
   */
  async getNextSessionQuestion(userId: string, sessionId: string) {
    const session = await this.getSession(userId, sessionId);

    // Collect answered question IDs to avoid repeating
    const answeredQuestionIds = session.answers.map((a) => a.questionId);

    // Compute history for adaptive difficulty
    const history = session.answers
      .filter((a) => a.evaluation)
      .map((a) => {
        let skills: string[] = [];
        try { if (a.question.skills) skills = JSON.parse(a.question.skills); } catch (e) {}
        return {
          questionId: a.questionId,
          category: a.question.category,
          difficulty: a.question.difficulty as DifficultyLevel,
          skills,
          score: a.evaluation?.overallScore || 70,
          status: a.evaluation?.status || "PARTIALLY_CORRECT",
        };
      });

    const adaptiveRec = calculateNextAdaptiveStep(
      history,
      session.difficulty as DifficultyLevel,
      session.adaptiveDifficulty,
      (session.maxDifficulty as DifficultyLevel) || (session.difficulty as DifficultyLevel)
    );

    let activeSources: string[] = ["STANDARD", "RESUME", "STUDY_MATERIAL", "JOB_DESCRIPTION"];
    try {
      if (session.questionSources) {
        activeSources = JSON.parse(session.questionSources);
      }
    } catch (e) {}

    // Select 1 question from remaining pool
    const selected = await selectSessionQuestions({
      userId,
      role: session.role,
      interviewType: session.interviewType,
      category: adaptiveRec.recommendedCategory || (session.category !== "All" ? session.category : undefined),
      difficulty: adaptiveRec.nextDifficulty,
      questionCount: 1,
      questionSources: activeSources,
      excludeQuestionIds: answeredQuestionIds,
    });

    return {
      question: selected[0] || null,
      adaptation: adaptiveRec,
      answeredCount: answeredQuestionIds.length,
      totalCount: session.questionCount,
      hasMore: answeredQuestionIds.length < session.questionCount && selected.length > 0,
    };
  }

  /**
   * Conclude an interview session and mirror to unified Analysis table
   */
  async finishSession(userId: string, sessionId: string) {
    const session = await this.getSession(userId, sessionId);

    const completed = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: {
        answers: {
          include: {
            question: true,
            evaluation: true,
          },
        },
      },
    });

    // Build overall summary
    const reportData = buildInterviewReport(completed);

    // Mirror to unified Analysis table for History, Compare, and Analytics
    try {
      await prisma.analysis.create({
        data: {
          userId,
          type: "interview",
          title: `${completed.role} Interview Practice (${completed.interviewType})`,
          confidence: reportData.averageScore || 80,
          emotion: reportData.averageScore >= 85 ? "Articulate & Composed" : "Measured Practice",
          vibe: "Interview Presence",
          signalQuality: "Good",
          qualityReason: `Evaluated ${reportData.totalQuestionsAnswered} answered prompts against structured rubrics.`,
          context: `${completed.role} · ${completed.difficulty} (${Math.round(reportData.totalDurationSeconds)}s)`,
          inputText: `Questions answered: ${reportData.totalQuestionsAnswered}. Avg score: ${reportData.averageScore}/100.`,
          signalsData: JSON.stringify({
            sessionId: completed.id,
            role: completed.role,
            interviewType: completed.interviewType,
            difficulty: completed.difficulty,
            averageScore: reportData.averageScore,
            averageWpm: reportData.averageWpm,
            totalDuration: reportData.totalDurationSeconds,
            answeredCount: reportData.totalQuestionsAnswered,
          }),
          emotionData: JSON.stringify({
            composure: reportData.averageScore,
            clarity: reportData.averageScore >= 80 ? 88 : 75,
          }),
          vibeData: JSON.stringify({
            tempoWpm: reportData.averageWpm,
            questionsCount: reportData.totalQuestionsAnswered,
          }),
          insightsData: JSON.stringify(reportData.overallStrengths),
          recommendations: JSON.stringify(reportData.overallImprovements),
          explanationData: JSON.stringify({
            disclaimer: reportData.disclaimer,
            practicePlan: reportData.recommendedPracticePlan,
          }),
        },
      });
    } catch (e) {
      console.warn("Could not mirror interview session to Analysis table:", e);
    }

    return {
      session: completed,
      report: reportData,
    };
  }

  /**
   * Delete an interview session
   */
  async deleteSession(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new Error("Interview session not found or unauthorized.");
    }

    await prisma.interviewSession.delete({
      where: { id: sessionId },
    });

    return { success: true, deletedId: sessionId };
  }

  /**
   * Generate questions from Job Description or Resume
   */
  async generateQuestionsFromJd(
    userId: string,
    jdText: string,
    role: string = "Software Engineer",
    difficulty: string = "Intermediate"
  ) {
    return await generateDynamicQuestionsFromText({
      userId,
      sourceText: jdText,
      sourceType: "job_description",
      role,
      difficulty: difficulty as any,
      count: 3,
    });
  }

  /**
   * Generate an incisive follow-up question based on candidate transcript
   */
  async generateFollowUp(userId: string, answerId: string) {
    const answer = await prisma.interviewAnswer.findFirst({
      where: { id: answerId, userId },
      include: {
        question: true,
        session: true,
        evaluation: true,
        followUpAnswers: true,
      },
    });

    if (!answer) {
      throw new Error("Answer record not found or unauthorized.");
    }

    const followUpCount = answer.followUpAnswers.length + 1;
    if (followUpCount > 2) {
      return {
        hasMoreFollowUps: false,
        message: "Maximum follow-up question depth reached for this primary question.",
      };
    }

    let missingConcepts: string[] = [];
    let followUpTemplates: string[] = [];
    try { if (answer.evaluation?.missingConcepts) missingConcepts = JSON.parse(answer.evaluation.missingConcepts); } catch (e) {}
    try { if (answer.question.followUpTemplates) followUpTemplates = JSON.parse(answer.question.followUpTemplates); } catch (e) {}

    const followUpData = await generateContextualFollowUp({
      mainQuestionText: answer.question.question,
      category: answer.question.category,
      role: answer.session.role,
      difficulty: answer.question.difficulty,
      candidateAnswerText: answer.transcript || answer.textAnswer || "",
      missingConcepts,
      followUpTemplates,
      currentFollowUpNumber: followUpCount,
      answerScore: answer.evaluation?.overallScore || 75,
    });

    // Create a linked follow-up question in the DB
    const followUpQuestion = await prisma.interviewQuestion.create({
      data: {
        userId,
        category: answer.question.category,
        subCategory: "Follow-Up Dialogue",
        role: answer.session.role,
        roles: JSON.stringify([answer.session.role]),
        interviewTypes: JSON.stringify(["Technical", "Problem Solving"]),
        difficulty: followUpData.difficulty,
        question: followUpData.question,
        criteria: "Depth of trade-off reasoning, ownership clarity, and tangible outcome demonstration.",
        timeTargetMin: followUpData.timeTargetMin,
        timeTargetMax: followUpData.timeTargetMax,
        expectedConcepts: JSON.stringify(["Trade-off analysis", "Operational mitigation", "Concrete technical specifics"]),
        acceptableConcepts: JSON.stringify(["Architecture trade-offs"]),
        commonMistakes: JSON.stringify(["Avoiding the direct scenario asked"]),
        referenceAnswer: "A complete follow-up response directly addresses the edge case or trade-off raised.",
        rubric: answer.question.rubric,
        hints: JSON.stringify(["Focus directly on the specific constraint asked in the follow-up."]),
        isCustom: true,
        source: "follow_up_engine",
        whyThisQuestion: followUpData.reason,
      },
    });

    // Record follow-up relation
    await prisma.interviewFollowUp.create({
      data: {
        answerId: answer.id,
        parentQuestionId: answer.question.id,
        question: followUpData.question,
        difficulty: followUpData.difficulty,
        reason: followUpData.reason,
      },
    });

    return {
      hasMoreFollowUps: true,
      followUpNumber: followUpCount,
      parentAnswerId: answer.id,
      parentQuestionId: answer.question.id,
      question: {
        ...followUpQuestion,
        rubric: JSON.parse(followUpQuestion.rubric || "{}"),
        hints: ["Focus directly on the specific constraint asked in the follow-up."],
      },
    };
  }

  /**
   * Retrieve user's cumulative skill mastery profile
   */
  async getSkillProfile(userId: string) {
    return await getUserSkillProfile(userId);
  }

  /**
   * Record observable technical and interaction integrity events
   */
  async recordIntegrityEvents(
    userId: string,
    sessionId: string,
    events: any[],
    answerId?: string
  ) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new Error("Interview session not found or unauthorized.");
    }

    if (!Array.isArray(events) || events.length === 0) {
      return { count: 0, events: [] };
    }

    const created = [];
    for (const evt of events) {
      const rec = await prisma.interviewIntegrityEvent.create({
        data: {
          sessionId,
          answerId: answerId || evt.answerId || null,
          userId,
          type: evt.type || "INTERACTION_EVENT",
          timestamp: Number(evt.timestamp) || 0,
          duration: Number(evt.duration) || 0,
          confidence: Number(evt.confidence) || 1.0,
          source: evt.source || "client_event_monitor",
          metadata: evt.metadata ? (typeof evt.metadata === "string" ? evt.metadata : JSON.stringify(evt.metadata)) : null,
        },
      });
      created.push(rec);
    }

    return { count: created.length, events: created };
  }

  /**
   * Get integrity events log & aggregated technical summary for a session
   */
  async getIntegritySummary(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        integrityEvents: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!session) {
      throw new Error("Interview session not found or unauthorized.");
    }

    let focusChanges = 0;
    let pageHiddenSeconds = 0;
    let pasteEvents = 0;
    let fullscreenExits = 0;
    let interruptions = 0;

    for (const evt of session.integrityEvents) {
      if (evt.type === "WINDOW_BLUR" || evt.type === "PAGE_HIDDEN" || evt.type === "TAB_SWITCH") {
        focusChanges++;
        pageHiddenSeconds += evt.duration || 0;
      } else if (evt.type === "PASTE_DURING_ANSWER") {
        pasteEvents++;
      } else if (evt.type === "FULLSCREEN_EXIT") {
        fullscreenExits++;
      } else if (evt.type === "CAMERA_LOST" || evt.type === "MICROPHONE_DISCONNECTED" || evt.type === "NETWORK_INTERRUPT") {
        interruptions++;
      }
    }

    const summary = {
      majorInterruptions: interruptions,
      focusChanges,
      pageHiddenSeconds: Math.round(pageHiddenSeconds),
      pasteEvents,
      fullscreenExits,
      interruptions,
      faceVisibilityPct: 95,
      audioInterruptions: session.integrityEvents.filter((e) => e.type === "MICROPHONE_DISCONNECTED").length,
      totalEvents: session.integrityEvents.length,
      notes:
        focusChanges === 0 && interruptions === 0
          ? "Continuous uninterrupted browser focus maintained throughout session."
          : `${focusChanges} focus change event(s) and ${interruptions} technical interruption(s) observed.`,
    };

    return {
      sessionId: session.id,
      totalEvents: session.integrityEvents.length,
      focusChanges,
      pageHiddenSeconds: Math.round(pageHiddenSeconds),
      pasteEvents,
      fullscreenExits,
      interruptions,
      summary,
      notes: summary.notes,
      events: session.integrityEvents,
    };
  }

  /**
   * Get practice insights across session answers
   */
  async getInsights(userId: string, sessionId: string) {
    const session = await this.getSession(userId, sessionId);
    const report = buildInterviewReport(session);
    return {
      sessionId,
      overallScore: report.averageScore,
      averageWpm: report.averageWpm,
      strengths: report.overallStrengths,
      improvements: report.overallImprovements,
      practicePlan: report.recommendedPracticePlan,
      questionInsights: report.answers,
    };
  }

  /**
   * Get single answer details
   */
  async getAnswer(userId: string, answerId: string) {
    const answer = await prisma.interviewAnswer.findFirst({
      where: { id: answerId, userId },
      include: {
        question: true,
        evaluation: true,
        parentAnswer: true,
        followUpAnswers: {
          include: {
            question: true,
            evaluation: true,
          },
        },
        integrityRecords: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!answer) {
      throw new Error("Answer not found or unauthorized.");
    }

    return answer;
  }
}

export const interviewService = new InterviewService();
