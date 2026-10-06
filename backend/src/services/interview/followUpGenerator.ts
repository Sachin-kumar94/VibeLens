import { geminiClient } from "../ai/geminiClient.js";

export interface FollowUpContext {
  mainQuestionText: string;
  category: string;
  role: string;
  difficulty: string;
  candidateAnswerText: string;
  missingConcepts: string[];
  followUpTemplates: string[];
  currentFollowUpNumber: number; // 1, 2, or 3
  answerScore: number;
}

export interface GeneratedFollowUpResult {
  question: string;
  reason: string;
  difficulty: string;
  timeTargetMin: number;
  timeTargetMax: number;
}

/**
 * Generate an incisive, context-aware follow-up question
 */
export async function generateContextualFollowUp(ctx: FollowUpContext): Promise<GeneratedFollowUpResult> {
  // If template matches missing concepts, pick from templates
  const textLower = ctx.candidateAnswerText.toLowerCase();

  // Determine difficulty: if previous answer scored >= 85, follow up is slightly deeper
  const difficulties = ["Easy", "Intermediate", "Advanced", "Expert"];
  const currIdx = difficulties.indexOf(ctx.difficulty);
  const nextDifficulty = ctx.answerScore >= 85 && currIdx < difficulties.length - 1
    ? difficulties[currIdx + 1]
    : ctx.difficulty;

  // Try AI follow-up first
  try {
    const aiFollowUp = await geminiClient.generateFollowUp({
      mainQuestion: ctx.mainQuestionText,
      category: ctx.category,
      role: ctx.role,
      transcript: ctx.candidateAnswerText,
      criteria: "Depth of reasoning, missing concept exploration, and operational trade-offs.",
      followUpNumber: ctx.currentFollowUpNumber,
    });

    if (aiFollowUp && aiFollowUp.question) {
      return {
        question: aiFollowUp.question,
        reason: aiFollowUp.whyThisQuestion || "Drills deeper into trade-offs and edge cases raised in your answer.",
        difficulty: nextDifficulty,
        timeTargetMin: aiFollowUp.timeTargetMin || 45,
        timeTargetMax: aiFollowUp.timeTargetMax || 75,
      };
    }
  } catch (err) {
    console.log("▲ Follow-up AI generation note:", (err as any)?.message || err);
  }

  // Fallback heuristic based on question's curated followUpTemplates or answer gaps
  if (Array.isArray(ctx.followUpTemplates) && ctx.followUpTemplates.length >= ctx.currentFollowUpNumber) {
    const templateQ = ctx.followUpTemplates[ctx.currentFollowUpNumber - 1];
    return {
      question: templateQ,
      reason: "Explores the technical trade-offs and constraints connected to your primary explanation.",
      difficulty: nextDifficulty,
      timeTargetMin: 45,
      timeTargetMax: 75,
    };
  }

  // If candidate mentioned caching but didn't detail cache failure
  if (textLower.includes("cache") || textLower.includes("redis")) {
    return {
      question: "What would happen to your primary database if that cache layer experienced a sudden cold-start or network partition?",
      reason: "Tests cache thundering herd mitigation and fallback resiliency.",
      difficulty: nextDifficulty,
      timeTargetMin: 45,
      timeTargetMax: 75,
    };
  }

  // If candidate discussed architecture / microservices
  if (textLower.includes("service") || textLower.includes("api") || textLower.includes("database")) {
    return {
      question: "What specific metric or threshold would signal that this approach is no longer scaling and needs to be redesigned?",
      reason: "Evaluates observability awareness and operational capacity planning.",
      difficulty: nextDifficulty,
      timeTargetMin: 45,
      timeTargetMax: 75,
    };
  }

  // General trade-off follow-up
  return {
    question: "If you had to sacrifice either low latency or strong consistency in this scenario, which would you relax and why?",
    reason: "Assesses fundamental CAP theorem and real-world system trade-off prioritization.",
    difficulty: nextDifficulty,
    timeTargetMin: 45,
    timeTargetMax: 75,
  };
}
