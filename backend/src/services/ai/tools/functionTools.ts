import { prisma } from "../../prisma.service.js";
import { DocumentRetriever } from "../../documents/documentRetriever.js";

export interface CandidateProfileResult {
  id: string;
  name: string;
  email: string;
  confidenceBaseline: number;
  paceBaselineWpm: number;
  postureBaseline: number;
  vocalEnergyBaseline: number;
  plan: string;
}

export interface CandidateResumeSummary {
  id: string;
  name: string | null;
  skills: string[];
  projects: any[];
  experience: any[];
  education: any[];
  certifications: string[];
}

export class AiFunctionTools {
  /**
   * Retrieves user profile details and calibrated baselines
   */
  public static async getUserProfile(userId: string): Promise<CandidateProfileResult | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        confidenceBaseline: true,
        paceBaselineWpm: true,
        postureBaseline: true,
        vocalEnergyBaseline: true,
        plan: true,
      },
    });
    return user;
  }

  /**
   * Retrieves candidate's structured resume profile
   */
  public static async getResume(userId: string): Promise<CandidateResumeSummary | null> {
    const resume = await prisma.resumeProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!resume) return null;

    let skills: string[] = [];
    let projects: any[] = [];
    let experience: any[] = [];
    let education: any[] = [];
    let certifications: string[] = [];

    try { skills = resume.skills ? JSON.parse(resume.skills) : []; } catch { skills = []; }
    try { projects = resume.projects ? JSON.parse(resume.projects) : []; } catch { projects = []; }
    try { experience = resume.experience ? JSON.parse(resume.experience) : []; } catch { experience = []; }
    try { education = resume.education ? JSON.parse(resume.education) : []; } catch { education = []; }
    try { certifications = resume.certifications ? JSON.parse(resume.certifications) : []; } catch { certifications = []; }

    return {
      id: resume.id,
      name: resume.name,
      skills,
      projects,
      experience,
      education,
      certifications,
    };
  }

  /**
   * Searches user's uploaded documents (Study Materials, Resume, Notes) with page/citation references
   */
  public static async searchDocuments(
    userId: string,
    query: string,
    limit: number = 4
  ): Promise<Array<{ documentId: string; title: string; page: number; section: string; text: string; citation: string; score: number }>> {
    const chunks = await DocumentRetriever.retrieveRelevantChunks(
      userId,
      query,
      { topK: limit }
    );

    return chunks.map((c) => ({
      documentId: c.documentId,
      title: c.documentName,
      page: c.page,
      section: c.section || "General",
      text: c.text,
      citation: c.citation,
      score: Math.round((c.relevanceScore || 0.8) * 100),
    }));
  }

  /**
   * Retrieves recent interview sessions and question performances
   */
  public static async getInterviewHistory(userId: string, limit: number = 5) {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        answers: {
          include: {
            question: true,
            evaluation: true,
          },
        },
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      role: s.role,
      position: s.position,
      interviewType: s.interviewType,
      difficulty: s.difficulty,
      status: s.status,
      completedAt: s.completedAt,
      answersCount: s.answers.length,
      averageScore: s.answers.length > 0
        ? Math.round(
            s.answers.reduce((acc, a) => acc + (a.evaluation?.overallScore || 0), 0) /
              s.answers.length
          )
        : 0,
      questions: s.answers.map((a) => ({
        question: a.question.question,
        score: a.evaluation?.overallScore || 0,
        status: a.evaluation?.status || "PENDING",
      })),
    }));
  }

  /**
   * Returns skills where user scored < 70 or where status is 'Needs Practice' or 'Developing'
   */
  public static async getWeakSkills(userId: string): Promise<Array<{ skill: string; attempts: number; averageScore: number; status: string }>> {
    const progress = await prisma.interviewSkillProgress.findMany({
      where: {
        userId,
        OR: [
          { masteryState: "Needs Practice" },
          { masteryState: "Developing" },
          { averageScore: { lt: 70 } },
        ],
      },
      orderBy: { averageScore: "asc" },
      take: 10,
    });

    if (progress.length > 0) {
      return progress.map((p) => ({
        skill: p.skill,
        attempts: p.attempts,
        averageScore: Math.round(p.averageScore),
        status: p.masteryState,
      }));
    }

    // Fallback: check recent answers with scores < 70
    const answers = await prisma.interviewAnswer.findMany({
      where: {
        userId,
        evaluation: { overallScore: { lt: 70 } },
      },
      include: { question: true, evaluation: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    const skillMap = new Map<string, { attempts: number; totalScore: number }>();
    for (const a of answers) {
      let qSkills: string[] = [];
      try { qSkills = a.question.skills ? JSON.parse(a.question.skills) : []; } catch { qSkills = []; }
      if (qSkills.length === 0) qSkills = [a.question.category];

      for (const sk of qSkills) {
        const existing = skillMap.get(sk) || { attempts: 0, totalScore: 0 };
        existing.attempts += 1;
        existing.totalScore += a.evaluation?.overallScore || 50;
        skillMap.set(sk, existing);
      }
    }

    return Array.from(skillMap.entries()).map(([skill, data]) => ({
      skill,
      attempts: data.attempts,
      averageScore: Math.round(data.totalScore / data.attempts),
      status: "Needs Practice",
    }));
  }

  /**
   * Retrieves multimodal session history (voice, body, presentation, image)
   */
  public static async getRecentAnalyses(userId: string, limit: number = 6) {
    const analyses = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        timestamp: true,
        emotion: true,
        confidence: true,
        vibe: true,
        signalQuality: true,
      },
    });
    return analyses;
  }

  /**
   * Retrieves previous attempts for a specific question to compare progress
   */
  public static async getPreviousAttempts(userId: string, questionId: string) {
    const previous = await prisma.interviewAnswer.findMany({
      where: { userId, questionId },
      orderBy: { createdAt: "asc" },
      include: { evaluation: true },
    });

    return previous.map((p) => ({
      id: p.id,
      attemptNumber: p.attemptNumber,
      score: p.evaluation?.overallScore || 0,
      status: p.evaluation?.status || "COMPLETED",
      transcript: p.transcript || p.textAnswer,
      createdAt: p.createdAt,
    }));
  }
}
