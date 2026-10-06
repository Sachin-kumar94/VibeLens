import { prisma } from "../prisma.service.js";

export interface SkillProfileSummary {
  totalSkillsPracticed: number;
  strengths: Array<{ skill: string; averageScore: number; attempts: number }>;
  needsPractice: Array<{ skill: string; averageScore: number; attempts: number }>;
  recommendedNextTopics: string[];
  allSkills: Array<{
    skill: string;
    attempts: number;
    averageScore: number;
    recentScore: number;
    lastPracticedAt: Date;
  }>;
}

/**
 * Record answer score across all associated skills for the user
 */
export async function recordSkillAttempts(userId: string, skills: string[], score: number) {
  if (!userId || !Array.isArray(skills) || skills.length === 0) return;

  for (const rawSkill of skills) {
    const skill = rawSkill.trim();
    if (!skill) continue;

    const existing = await prisma.skillMastery.findUnique({
      where: {
        userId_skill: {
          userId,
          skill,
        },
      },
    });

    if (existing) {
      const newAttempts = existing.attempts + 1;
      const newAverage = Number(((existing.averageScore * existing.attempts + score) / newAttempts).toFixed(1));

      await prisma.skillMastery.update({
        where: { id: existing.id },
        data: {
          attempts: newAttempts,
          averageScore: newAverage,
          recentScore: score,
          lastPracticedAt: new Date(),
        },
      });
    } else {
      await prisma.skillMastery.create({
        data: {
          userId,
          skill,
          attempts: 1,
          averageScore: score,
          recentScore: score,
          lastPracticedAt: new Date(),
        },
      });
    }
  }
}

/**
 * Retrieve user's cumulative skill mastery profile
 */
export async function getUserSkillProfile(userId: string): Promise<SkillProfileSummary> {
  const records = await prisma.skillMastery.findMany({
    where: { userId },
    orderBy: { lastPracticedAt: "desc" },
  });

  const strengths: Array<{ skill: string; averageScore: number; attempts: number }> = [];
  const needsPractice: Array<{ skill: string; averageScore: number; attempts: number }> = [];

  for (const r of records) {
    if (r.attempts >= 2 && r.averageScore >= 78) {
      strengths.push({ skill: r.skill, averageScore: r.averageScore, attempts: r.attempts });
    } else if (r.averageScore < 70) {
      needsPractice.push({ skill: r.skill, averageScore: r.averageScore, attempts: r.attempts });
    }
  }

  // Sort needs practice by lowest score first
  needsPractice.sort((a, b) => a.averageScore - b.averageScore);
  strengths.sort((a, b) => b.averageScore - a.averageScore);

  const recommendedNextTopics = needsPractice.slice(0, 3).map((n) => n.skill);
  if (recommendedNextTopics.length === 0 && records.length > 0) {
    recommendedNextTopics.push(records[0].skill);
  }

  return {
    totalSkillsPracticed: records.length,
    strengths,
    needsPractice,
    recommendedNextTopics,
    allSkills: records,
  };
}
