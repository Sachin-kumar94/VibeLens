import { prisma } from "../prisma.service.js";
import { DocumentRetriever } from "../documents/documentRetriever.js";

export interface BuildInterviewContextParams {
  userId: string;
  role?: string;
  difficulty?: string;
  category?: string;
  includeResume?: boolean;
  includeSelectedDocs?: boolean;
  includeWeakSkills?: boolean;
  topicQuery?: string;
}

export interface BuiltInterviewContext {
  role: string;
  difficulty: string;
  candidateSkills: string[];
  recentProjects: string[];
  weakSkills: string[];
  groundedDocSnippets: Array<{ title: string; citation: string; text: string }>;
  contextPromptBlock: string;
}

export class ContextBuilder {
  /**
   * Safely constructs a bounded prompt context block for an interview question or evaluation
   */
  public static async buildInterviewContext(
    params: BuildInterviewContextParams
  ): Promise<BuiltInterviewContext> {
    const {
      userId,
      role = "Software Engineer",
      difficulty = "Intermediate",
      includeResume = true,
      includeSelectedDocs = true,
      includeWeakSkills = true,
      topicQuery,
    } = params;

    let candidateSkills: string[] = [];
    let recentProjects: string[] = [];
    let weakSkills: string[] = [];
    const groundedDocSnippets: Array<{ title: string; citation: string; text: string }> = [];

    // 1. Candidate Resume Profile
    if (includeResume) {
      try {
        const resume = await prisma.resumeProfile.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });

        if (resume) {
          try {
            candidateSkills = JSON.parse(resume.skills || "[]").slice(0, 12);
          } catch {}
          try {
            const rawProj = JSON.parse(resume.projects || "[]");
            recentProjects = rawProj.slice(0, 3).map((p: any) => p.name || p.title || String(p));
          } catch {}
        }
      } catch (err) {
        console.warn("[ContextBuilder] Could not fetch resume context:", err);
      }
    }

    // 2. Candidate Weak Skills (from past performance)
    if (includeWeakSkills) {
      try {
        const weak = await prisma.skillMastery.findMany({
          where: {
            userId,
            masteryState: { in: ["Needs Practice", "Developing"] },
          },
          orderBy: { averageScore: "asc" },
          take: 5,
        });
        weakSkills = weak.map((w: any) => w.skill);
      } catch (err) {
        console.warn("[ContextBuilder] Could not fetch weak skills:", err);
      }
    }

    // 3. Grounded Document Excerpts (selected documents only)
    if (includeSelectedDocs) {
      try {
        const selectedDocs = await prisma.userDocument.findMany({
          where: {
            userId,
            isSelectedForInterview: true,
            status: "READY",
          },
          select: { id: true, title: true, filename: true },
          take: 4,
        });

        if (selectedDocs.length > 0) {
          const docIds = selectedDocs.map((d) => d.id);
          const chunks = await DocumentRetriever.retrieveRelevantChunks(
            userId,
            topicQuery || role,
            {
              documentIds: docIds,
              topK: 3,
            }
          );

          for (const c of chunks) {
            groundedDocSnippets.push({
              title: c.documentName,
              citation: c.citation,
              text: c.text.slice(0, 400),
            });
          }
        }
      } catch (err) {
        console.warn("[ContextBuilder] Could not fetch document excerpts:", err);
      }
    }

    // Build concise, formatted prompt block
    const promptLines: string[] = [
      `TARGET ROLE: ${role}`,
      `TARGET DIFFICULTY: ${difficulty}`,
    ];

    if (candidateSkills.length > 0) {
      promptLines.push(`CANDIDATE KNOWN SKILLS: ${candidateSkills.join(", ")}`);
    }
    if (recentProjects.length > 0) {
      promptLines.push(`CANDIDATE RECENT PROJECTS: ${recentProjects.join(", ")}`);
    }
    if (weakSkills.length > 0) {
      promptLines.push(`IDENTIFIED WEAK AREAS (PRIORITIZE PROBING): ${weakSkills.join(", ")}`);
    }
    if (groundedDocSnippets.length > 0) {
      promptLines.push(`GROUNDED STUDY MATERIAL EXCERPTS:`);
      groundedDocSnippets.forEach((s) => {
        promptLines.push(`- [Source: ${s.citation}]\n  "${s.text}"`);
      });
    }

    return {
      role,
      difficulty,
      candidateSkills,
      recentProjects,
      weakSkills,
      groundedDocSnippets,
      contextPromptBlock: promptLines.join("\n\n"),
    };
  }

  /**
   * Builds bounded prompt context for answer evaluation combining question, rubric, and real metrics
   */
  public static buildEvaluationContext(params: {
    questionText: string;
    expectedConcepts?: string[];
    userAnswer: string;
    durationSeconds?: number;
    wpm?: number;
    pauseCount?: number;
    fillerCount?: number;
    cameraFacingSignal?: string;
  }): string {
    const {
      questionText,
      expectedConcepts = [],
      userAnswer,
      durationSeconds = 0,
      wpm = 0,
      pauseCount = 0,
      fillerCount = 0,
      cameraFacingSignal = "Steady",
    } = params;

    return `QUESTION POSED:
"${questionText}"

EXPECTED CORE CONCEPTS / ARCHITECTURAL PRINCIPLES:
${expectedConcepts.length > 0 ? expectedConcepts.map((c) => `- ${c}`).join("\n") : "Evaluate technical accuracy, trade-offs, and logical structure."}

CANDIDATE'S ACTUAL ANSWER:
"""
${userAnswer.slice(0, 2000)}
"""

OBJECTIVE DETERMINISTIC MEASUREMENTS (DO NOT FABRICATE):
- Speaking Duration: ${durationSeconds} seconds
- Speaking Rate: ${wpm} WPM
- Micro-Pauses: ${pauseCount}
- Filler Words Detected: ${fillerCount}
- Visual Framing/Camera Signal: ${cameraFacingSignal}`;
  }
}
