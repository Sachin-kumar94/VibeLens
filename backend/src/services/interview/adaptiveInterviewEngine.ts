export type DifficultyLevel = "Easy" | "Intermediate" | "Advanced" | "Expert";

export interface SessionHistoryItem {
  questionId: string;
  category: string;
  difficulty: DifficultyLevel;
  skills: string[];
  score: number;
  status: string;
}

export interface AdaptiveRecommendation {
  nextDifficulty: DifficultyLevel;
  recommendedCategory?: string;
  recommendedSkills?: string[];
  adaptationReason: string;
  difficultyChange: "INCREASED" | "MAINTAINED" | "DECREASED";
}

const DIFFICULTY_ORDER: DifficultyLevel[] = ["Easy", "Intermediate", "Advanced", "Expert"];

/**
 * Adaptive Interview Engine
 * Evaluates performance trends to smoothly adapt difficulty and balance skill coverage.
 */
export function calculateNextAdaptiveStep(
  history: SessionHistoryItem[],
  currentConfiguredDifficulty: DifficultyLevel,
  isAdaptiveModeEnabled: boolean,
  maxDifficulty?: DifficultyLevel
): AdaptiveRecommendation {
  const maxAllowed = maxDifficulty || currentConfiguredDifficulty || "Expert";
  const maxAllowedIndex = DIFFICULTY_ORDER.indexOf(maxAllowed);

  if (!isAdaptiveModeEnabled || history.length === 0) {
    return {
      nextDifficulty: currentConfiguredDifficulty,
      adaptationReason: "Fixed difficulty mode active.",
      difficultyChange: "MAINTAINED",
    };
  }

  // Get the most recent 2 answers
  const recent = history.slice(-2);
  const lastScore = recent[recent.length - 1].score;
  const currentDiff = recent[recent.length - 1].difficulty;
  const currIndex = DIFFICULTY_ORDER.indexOf(currentDiff);

  // Track skills with lower scores (< 65)
  const weakSkills: string[] = [];
  for (const item of history) {
    if (item.score < 65) {
      weakSkills.push(...item.skills);
    }
  }

  // Two consecutive strong answers (>= 80) -> Step up difficulty (respecting max allowed)
  if (recent.length >= 2 && recent.every((r) => r.score >= 80)) {
    if (currIndex < DIFFICULTY_ORDER.length - 1 && currIndex + 1 <= maxAllowedIndex) {
      const nextDiff = DIFFICULTY_ORDER[currIndex + 1];
      return {
        nextDifficulty: nextDiff,
        recommendedSkills: weakSkills.length > 0 ? [weakSkills[0]] : undefined,
        adaptationReason: `Strong demonstrated mastery (${recent.map((r) => r.score).join(", ")}/100). Stepping up to ${nextDiff}.`,
        difficultyChange: "INCREASED",
      };
    }
  }

  // Single very high score (>= 92) from Easy -> Step to Intermediate (respecting max allowed)
  if (currentDiff === "Easy" && lastScore >= 92 && currIndex < DIFFICULTY_ORDER.length - 1 && currIndex + 1 <= maxAllowedIndex) {
    const nextDiff = DIFFICULTY_ORDER[currIndex + 1];
    return {
      nextDifficulty: nextDiff,
      adaptationReason: `Comprehensive answer (${lastScore}/100) on fundamentals. Advancing to ${nextDiff}.`,
      difficultyChange: "INCREASED",
    };
  }

  // Consecutive weak answers (< 55) -> Step down or consolidate fundamentals
  if (recent.length >= 2 && recent.every((r) => r.score < 55)) {
    if (currIndex > 0) {
      const nextDiff = DIFFICULTY_ORDER[currIndex - 1];
      return {
        nextDifficulty: nextDiff,
        recommendedSkills: weakSkills.length > 0 ? [weakSkills[0]] : undefined,
        adaptationReason: `Consolidating core fundamentals before advancing. Adjusting to ${nextDiff}.`,
        difficultyChange: "DECREASED",
      };
    }
  }

  // Otherwise maintain current difficulty and target weak skill if any
  return {
    nextDifficulty: currentDiff,
    recommendedSkills: weakSkills.length > 0 ? [weakSkills[0]] : undefined,
    adaptationReason: `Maintaining ${currentDiff} difficulty to deepen topic breadth.`,
    difficultyChange: "MAINTAINED",
  };
}
