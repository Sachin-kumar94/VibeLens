export interface InterviewReportData {
  sessionId: string;
  role: string;
  interviewType: string;
  difficulty: string;
  createdAt: string;
  completedAt?: string;
  totalDurationSeconds: number;
  averageScore: number;
  averageWpm: number;
  totalQuestionsAnswered: number;
  totalQuestionsPlanned: number;
  answers: Array<{
    questionText: string;
    category: string;
    difficulty: string;
    criteria: string;
    duration: number;
    wpm: number;
    pauseCount: number;
    fillerCount: number;
    cameraFacingSignal?: string;
    audioQuality?: string;
    evaluation?: {
      overallScore: number;
      structureScore: number;
      relevanceScore: number;
      clarityScore: number;
      deliveryScore: number;
      evidenceScore: number;
      strengths: string[];
      improvements: string[];
      nextPractice: string[];
      feedback: string;
    };
  }>;
  overallStrengths: string[];
  overallImprovements: string[];
  recommendedPracticePlan: string[];
  disclaimer: string;
}

export function buildInterviewReport(session: any): InterviewReportData {
  const answers = (session.answers || []).filter((a: any) => a.status !== "SKIPPED");
  const answeredCount = answers.length;

  let totalDuration = 0;
  let scoreSum = 0;
  let scoredCount = 0;
  let wpmSum = 0;
  const strengthsSet = new Set<string>();
  const improvementsSet = new Set<string>();
  const nextPracticeSet = new Set<string>();

  const formattedAnswers = answers.map((ans: any) => {
    totalDuration += ans.duration || 0;
    if (ans.wpm > 0) wpmSum += ans.wpm;

    let evalObj: any = null;
    if (ans.evaluation) {
      scoredCount++;
      scoreSum += ans.evaluation.overallScore;

      let parsedStrengths: string[] = [];
      let parsedImprovements: string[] = [];
      let parsedNext: string[] = [];

      try { parsedStrengths = JSON.parse(ans.evaluation.strengths); } catch (e) { parsedStrengths = [ans.evaluation.strengths]; }
      try { parsedImprovements = JSON.parse(ans.evaluation.improvements); } catch (e) { parsedImprovements = [ans.evaluation.improvements]; }
      try { parsedNext = JSON.parse(ans.evaluation.nextPractice); } catch (e) { parsedNext = [ans.evaluation.nextPractice]; }

      parsedStrengths.forEach((s) => strengthsSet.add(s));
      parsedImprovements.forEach((i) => improvementsSet.add(i));
      parsedNext.forEach((n) => nextPracticeSet.add(n));

      evalObj = {
        overallScore: ans.evaluation.overallScore,
        structureScore: ans.evaluation.structureScore,
        relevanceScore: ans.evaluation.relevanceScore,
        clarityScore: ans.evaluation.clarityScore,
        deliveryScore: ans.evaluation.deliveryScore,
        evidenceScore: ans.evaluation.evidenceScore,
        strengths: parsedStrengths,
        improvements: parsedImprovements,
        nextPractice: parsedNext,
        feedback: ans.evaluation.feedback,
      };
    }

    return {
      questionText: ans.question?.question || "Interview Prompt",
      category: ans.question?.category || "General",
      difficulty: ans.question?.difficulty || "Intermediate",
      criteria: ans.question?.criteria || "",
      duration: Math.round(ans.duration || 0),
      wpm: ans.wpm || 0,
      pauseCount: ans.pauseCount || 0,
      fillerCount: ans.fillerCount || 0,
      cameraFacingSignal: ans.cameraFacingSignal || "Unavailable",
      audioQuality: ans.audioQuality || "Good",
      evaluation: evalObj,
    };
  });

  const averageScore = scoredCount > 0 ? Math.round(scoreSum / scoredCount) : 0;
  const averageWpm = answeredCount > 0 ? Math.round(wpmSum / answeredCount) : 0;

  return {
    sessionId: session.id,
    role: session.role || "Software Engineer",
    interviewType: session.interviewType || "Behavioral",
    difficulty: session.difficulty || "Intermediate",
    createdAt: session.createdAt.toISOString(),
    completedAt: session.completedAt ? session.completedAt.toISOString() : undefined,
    totalDurationSeconds: Math.round(totalDuration),
    averageScore,
    averageWpm,
    totalQuestionsAnswered: answeredCount,
    totalQuestionsPlanned: session.questionCount || 5,
    answers: formattedAnswers,
    overallStrengths: Array.from(strengthsSet).slice(0, 4),
    overallImprovements: Array.from(improvementsSet).slice(0, 4),
    recommendedPracticePlan: Array.from(nextPracticeSet).slice(0, 3),
    disclaimer:
      "Interview feedback is an automated practice aid based on your response and available audio/video signals. It does not predict hiring or employment outcomes.",
  };
}
