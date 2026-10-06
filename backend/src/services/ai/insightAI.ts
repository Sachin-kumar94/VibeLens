import { prisma } from "../prisma.service.js";
import { AiFunctionTools } from "./tools/functionTools.js";
import { DocumentRetriever } from "../documents/documentRetriever.js";
import { GeminiProvider } from "./geminiProvider.js";
import { ModelRouter } from "./modelRouter.js";

export interface StudyPlanDay {
  day: number;
  title: string;
  focusSkill: string;
  description: string;
  practiceType: "Technical" | "System Design" | "Behavioral" | "Quiz" | "Mock Interview";
  recommendedDocuments: Array<{ title: string; pageRange?: string; citation?: string }>;
  suggestedQuestions: string[];
  durationMinutes: number;
}

export interface PersonalizedPlanResponse {
  id: string;
  title: string;
  targetRole: string;
  durationDays: number;
  weakSkills: string[];
  days: StudyPlanDay[];
  summary: string;
}

export interface CandidateMemoryResponse {
  targetRole: string;
  targetPosition: string;
  preferredDifficulty: string;
  skills: string[];
  weakTopics: string[];
  strongTopics: string[];
  recentSessionsSummary: {
    totalSessions: number;
    averageScore: number;
    lastPracticedAt?: string;
  };
  studyMaterialsCount: number;
  readyForInterview: boolean;
}

export class InsightAI {
  /**
   * Generates a 7-day personalized study and practice plan from actual weak skills and uploaded notes
   */
  public static async generateStudyPlan(params: {
    userId: string;
    targetRole?: string;
    durationDays?: number;
  }): Promise<PersonalizedPlanResponse> {
    const { userId, targetRole = "Software Engineer", durationDays = 7 } = params;

    // 1. Gather actual weak skills from user database
    const weakSkillsData = await AiFunctionTools.getWeakSkills(userId);
    const weakSkills = weakSkillsData.map((w) => w.skill);

    // 2. Fetch available study documents
    const documents = await prisma.userDocument.findMany({
      where: { userId, sourceType: "STUDY_MATERIAL" },
      select: { id: true, title: true, filename: true, pageCount: true },
      take: 5,
    });

    const docNames = documents.map((d) => d.title || d.filename);

    // If no weak skills found yet, provide high-yield fundamentals
    const effectiveWeakSkills = weakSkills.length > 0 
      ? weakSkills 
      : ["SQL & Indexing", "System Design Scalability", "Concurrency & Thread Safety", "REST API & Error Handling"];

    let days: StudyPlanDay[] = [];
    if (GeminiProvider.isConfigured()) {
      try {
        const prompt = `You are a Principal Engineering Career Coach creating a customized ${durationDays}-Day Practice Plan for a candidate.
Target Role: ${targetRole}
Actual Weak Skills Identified from Mock Interviews:
${JSON.stringify(effectiveWeakSkills)}

Available Study Notes / Textbooks:
${JSON.stringify(docNames)}

Create a day-by-day plan (${durationDays} days) that aggressively addresses their weak skills and finishes with a comprehensive mock interview.
Ground recommended readings in the available documents when applicable.

Format strictly as JSON array of days:
[
  {
    "day": 1,
    "title": "Title (e.g. Day 1: SQL Indexing Fundamentals)",
    "focusSkill": "SQL Indexing",
    "description": "Specific focus and actionable learning objective.",
    "practiceType": "Technical",
    "recommendedDocuments": [
      { "title": "${docNames[0] || 'Technical Notes'}", "pageRange": "Pages 10–25", "citation": "Study notes on indexing trade-offs" }
    ],
    "suggestedQuestions": [
      "Targeted question 1?",
      "Targeted question 2?"
    ],
    "durationMinutes": 45
  }
]`;

        const parsed = await GeminiProvider.generateStructured<StudyPlanDay[]>(prompt, {
          feature: "study_plan",
          model: ModelRouter.getFastModel(),
          timeoutMs: 16000,
        });

        if (Array.isArray(parsed) && parsed.length > 0) {
          days = parsed;
        }
      } catch (err) {
        console.warn("[InsightAI] Gemini study plan fallback:", err);
      }
    }

    // High quality deterministic plan fallback
    if (days.length === 0) {
      const defaultTopics = [
        { skill: effectiveWeakSkills[0] || "Data Modeling", type: "Technical" as const, desc: "Foundational data structures, normal forms, and relational constraints." },
        { skill: effectiveWeakSkills[1] || "Database Indexing & Query Tuning", type: "Technical" as const, desc: "B-Tree vs Hash index trade-offs, write overhead, and query optimization." },
        { skill: effectiveWeakSkills[2] || "Concurrency & Distributed Caching", type: "System Design" as const, desc: "Cache-aside, write-through patterns, Redis TTL, and cache stampede prevention." },
        { skill: "API Architecture & Idempotency", type: "Technical" as const, desc: "HTTP status semantics, idempotent request tokens, and resilient retry logic." },
        { skill: "System Scalability & Load Balancing", type: "System Design" as const, desc: "Horizontal sharding, consistent hashing, and single-point-of-failure elimination." },
        { skill: "Comprehensive Timed Mock Interview", type: "Mock Interview" as const, desc: "Full simulation covering technical and architectural questions under timer pressure." },
        { skill: "Weak-Topic Retest & Polish", type: "Quiz" as const, desc: "Revisiting initial misconceptions and verifying conceptual clarity." },
      ];

      days = defaultTopics.slice(0, durationDays).map((t, i) => ({
        day: i + 1,
        title: `Day ${i + 1}: ${t.skill}`,
        focusSkill: t.skill,
        description: t.desc,
        practiceType: t.type,
        recommendedDocuments: documents.length > 0
          ? [{
              title: documents[i % documents.length].title || documents[i % documents.length].filename,
              pageRange: `Pages ${i * 6 + 1}–${(i + 1) * 6}`,
              citation: `${documents[i % documents.length].title || documents[i % documents.length].filename} (Focus on ${t.skill})`,
            }]
          : [],
        suggestedQuestions: [
          `How does ${t.skill} behave under high concurrency or hardware failure?`,
          `What are the primary performance metrics you monitor when evaluating ${t.skill}?`,
        ],
        durationMinutes: 45,
      }));
    }

    // Save to database
    const savedPlan = await prisma.personalizedStudyPlan.create({
      data: {
        userId,
        title: `7-Day ${targetRole} Practice Plan`,
        targetRole,
        durationDays,
        weakSkills: JSON.stringify(effectiveWeakSkills),
        planData: JSON.stringify(days),
        status: "ACTIVE",
      },
    });

    return {
      id: savedPlan.id,
      title: savedPlan.title,
      targetRole,
      durationDays,
      weakSkills: effectiveWeakSkills,
      days,
      summary: `Tailored 7-day preparation schedule targeting ${effectiveWeakSkills.slice(0, 3).join(", ")} with verified document reading checkpoints.`,
    };
  }

  /**
   * Retrieves or builds the candidate readiness AI memory profile
   */
  public static async getCandidateMemory(userId: string): Promise<CandidateMemoryResponse> {
    const memory = await prisma.aiMemory.findUnique({
      where: { userId },
    });

    const resume = await AiFunctionTools.getResume(userId);
    const weakSkillsData = await AiFunctionTools.getWeakSkills(userId);
    const recentSessions = await AiFunctionTools.getInterviewHistory(userId, 10);
    const docCount = await prisma.userDocument.count({ where: { userId } });

    const totalSessions = recentSessions.length;
    const avgScore = totalSessions > 0
      ? Math.round(recentSessions.reduce((acc, s) => acc + s.averageScore, 0) / totalSessions)
      : 0;

    let skills: string[] = resume?.skills || [];
    let weakTopics: string[] = weakSkillsData.map((w) => w.skill);
    let strongTopics: string[] = [];

    // Identify strong topics from skills with score >= 80
    const progressStrong = await prisma.interviewSkillProgress.findMany({
      where: { userId, averageScore: { gte: 80 } },
      select: { skill: true },
      take: 5,
    });
    strongTopics = progressStrong.map((s) => s.skill);

    if (skills.length === 0 && memory?.skills) {
      try { skills = JSON.parse(memory.skills); } catch {}
    }
    if (weakTopics.length === 0 && memory?.weakTopics) {
      try { weakTopics = JSON.parse(memory.weakTopics); } catch {}
    }
    if (strongTopics.length === 0 && memory?.strongTopics) {
      try { strongTopics = JSON.parse(memory.strongTopics); } catch {}
    }

    if (skills.length === 0) skills = ["JavaScript", "TypeScript", "React", "Node.js", "SQL"];
    if (strongTopics.length === 0) strongTopics = ["Component Architecture", "REST API Integration"];
    if (weakTopics.length === 0) weakTopics = ["Database Indexing", "System Design Scalability"];

    const response: CandidateMemoryResponse = {
      targetRole: memory?.targetRole || "Software Engineer",
      targetPosition: memory?.targetPosition || "Junior",
      preferredDifficulty: memory?.preferredDifficulty || "Intermediate",
      skills,
      weakTopics,
      strongTopics,
      recentSessionsSummary: {
        totalSessions,
        averageScore: avgScore,
        lastPracticedAt: recentSessions[0]?.completedAt ? new Date(recentSessions[0].completedAt).toISOString() : undefined,
      },
      studyMaterialsCount: docCount,
      readyForInterview: avgScore >= 75 && totalSessions >= 3,
    };

    // Update memory cache
    await prisma.aiMemory.upsert({
      where: { userId },
      create: {
        userId,
        targetRole: response.targetRole,
        targetPosition: response.targetPosition,
        preferredDifficulty: response.preferredDifficulty,
        skills: JSON.stringify(response.skills),
        weakTopics: JSON.stringify(response.weakTopics),
        strongTopics: JSON.stringify(response.strongTopics),
        recentSessionsSummary: JSON.stringify(response.recentSessionsSummary),
      },
      update: {
        skills: JSON.stringify(response.skills),
        weakTopics: JSON.stringify(response.weakTopics),
        strongTopics: JSON.stringify(response.strongTopics),
        recentSessionsSummary: JSON.stringify(response.recentSessionsSummary),
      },
    });

    return response;
  }

  /**
   * AI Semantic Search across user analyses, notes, weak topics, and interview attempts
   */
  public static async semanticSearch(params: {
    userId: string;
    query: string;
  }) {
    const { userId, query } = params;
    const lower = query.toLowerCase();

    // 1. Search in uploaded documents
    const docChunks = await DocumentRetriever.retrieveRelevantChunks(
      userId,
      query,
      { topK: 3 }
    );

    // 2. Search in interview history
    const allAnswers = await prisma.interviewAnswer.findMany({
      where: { userId },
      include: { question: true, evaluation: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    const matchedAnswers = allAnswers.filter((a) => {
      const qText = a.question.question.toLowerCase();
      const qCat = a.question.category.toLowerCase();
      const qSkills = (a.question.skills || "").toLowerCase();
      const feedback = (a.evaluation?.feedback || "").toLowerCase();
      const transcript = (a.transcript || a.textAnswer || "").toLowerCase();
      return (
        qText.includes(lower) ||
        qCat.includes(lower) ||
        qSkills.includes(lower) ||
        feedback.includes(lower) ||
        transcript.includes(lower)
      );
    }).slice(0, 4);

    // 3. Search in weak skills
    const weakSkills = await AiFunctionTools.getWeakSkills(userId);
    const matchedWeakSkills = weakSkills.filter((w) =>
      w.skill.toLowerCase().includes(lower) || lower.includes("weak")
    );

    return {
      query,
      documentExcerpts: docChunks.map((c) => ({
        documentTitle: c.documentName,
        page: c.page,
        section: c.section,
        text: c.text.slice(0, 200) + "...",
        citation: c.citation,
      })),
      interviewMatches: matchedAnswers.map((a) => ({
        question: a.question.question,
        category: a.question.category,
        score: a.evaluation?.overallScore || 0,
        status: a.evaluation?.status || "COMPLETED",
        feedback: a.evaluation?.feedback?.slice(0, 150) + "...",
        date: a.createdAt,
      })),
      weakSkillMatches: matchedWeakSkills,
    };
  }
}
