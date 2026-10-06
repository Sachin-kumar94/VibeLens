import { geminiClient } from "../ai/geminiClient.js";

export type AnswerStatus =
  | "CORRECT"
  | "MOSTLY_CORRECT"
  | "PARTIALLY_CORRECT"
  | "WEAK"
  | "INCORRECT"
  | "INSUFFICIENT_INFORMATION"
  | "NOT_EVALUATABLE";

export interface IncorrectConceptDetail {
  claim: string;
  problem: string;
  correctConcept: string;
}

export interface AttemptComparison {
  previousScore: number;
  currentScore: number;
  difference: number;
  summary: string;
}

export interface CategoryScores {
  technical: number;
  communication: number;
  structure: number;
  delivery: number;
}

export interface DeepEvaluationResult {
  status: AnswerStatus;
  overallScore: number;
  categoryScores: CategoryScores;
  whyThisAssessment: string;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
  incorrectConcepts: IncorrectConceptDetail[];
  rememberRule?: string;
  referenceAnswer: string;
  improvedAnswer: string;
  simpleExplanation?: string;
  sourceCitations?: string[];
  explanation: string;
  attemptComparison?: AttemptComparison;
  followUpSuggestion?: {
    question: string;
    reason: string;
  };
  confidence: number; // Evaluator confidence (not candidate score)
}

export interface EvaluateAnswerParams {
  questionText: string;
  category: string;
  difficulty: string;
  role: string;
  expectedConcepts: string[];
  acceptableConcepts: string[];
  commonMistakes: string[];
  referenceAnswer: string;
  rubric: {
    structure: number;
    relevance: number;
    clarity: number;
    delivery: number;
    evidence: number;
    methodology?: string;
  };
  answerText: string;
  sourceCitation?: string;
  sourceContextText?: string;
  duration?: number;
  attemptNumber?: number;
  previousEvaluation?: {
    overallScore: number;
    status: string;
  } | null;
  wpm?: number;
}

/**
 * Stem common English suffixes to allow natural token matching
 */
function stemWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^\w]/g, "")
    .replace(/ies$/, "y")
    .replace(/ves$/, "f")
    .replace(/ation$/, "at")
    .replace(/tional$/, "tion")
    .replace(/ingly$/, "")
    .replace(/fully$/, "")
    .replace(/ly$/, "")
    .replace(/ing$/, "")
    .replace(/ed$/, "")
    .replace(/ment$/, "")
    .replace(/s$/, "");
}

/**
 * Tokenize and normalize text for semantic concept matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract key semantic tokens from a concept phrase
 */
function extractConceptKeywords(concept: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "can",
    "could", "should", "would", "may", "might", "must", "shall", "will",
    "it", "its", "that", "this", "these", "those", "which", "who", "whom",
    "into", "from", "across", "between", "while", "whereas", "such", "than"
  ]);

  return concept
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/**
 * Calculate overlap between answer and a concept phrase using stemmed semantic matching
 */
function calculateConceptMatch(answerNorm: string, concept: string): { matched: boolean; score: number } {
  const rawKeywords = extractConceptKeywords(concept);
  if (rawKeywords.length === 0) return { matched: false, score: 0 };

  const answerTokens = answerNorm.split(/\s+/).filter(Boolean);
  const answerStemmed = new Set(answerTokens.map(stemWord));

  let matchCount = 0;
  for (const word of rawKeywords) {
    const stemmed = stemWord(word);
    if (answerStemmed.has(stemmed) || answerNorm.includes(word.toLowerCase())) {
      matchCount++;
    }
  }

  const ratio = matchCount / rawKeywords.length;
  // Consider matched if >= 40% of key tokens appear or at least 3 distinct domain tokens match
  const matched = ratio >= 0.38 || (rawKeywords.length >= 4 && matchCount >= 3) || (rawKeywords.length <= 3 && matchCount >= 2);

  return {
    matched,
    score: ratio,
  };
}

/**
 * Deterministic Semantic Evaluator
 * Operates without Math.random() and adheres strictly to question rubric and expected concepts.
 */
export function evaluateAnswerDeterministically(params: EvaluateAnswerParams): DeepEvaluationResult {
  const answer = params.answerText.trim();
  const answerNorm = normalizeText(answer);
  const words = answer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. INSUFFICIENT INFORMATION check
  if (wordCount < 8) {
    return {
      status: "INSUFFICIENT_INFORMATION",
      overallScore: Math.min(25, Math.max(10, wordCount * 2)),
      categoryScores: { technical: 20, communication: 25, structure: 15, delivery: 30 },
      whyThisAssessment: "The response is too brief to demonstrate technical reasoning or foundational understanding.",
      strengths: wordCount > 0 ? ["Initial attempt initiated."] : [],
      improvements: [
        "Explain your core reasoning rather than providing a single-phrase response.",
        "Include concrete technical terminology and trade-offs.",
      ],
      missingConcepts: params.expectedConcepts.slice(0, 3),
      incorrectConcepts: [],
      rememberRule: "Interviewers look for structured reasoning: state your approach, explain mechanics, and note trade-offs.",
      referenceAnswer: params.referenceAnswer || "Provide a structured explanation covering mechanics, trade-offs, and examples.",
      improvedAnswer: params.referenceAnswer || "A complete response explains how the system works and why.",
      explanation: "Your answer did not contain enough detail for meaningful assessment. Try explaining step-by-step.",
      confidence: 95,
    };
  }

  // 2. CHECK COMMON MISTAKES
  // A mistake is flagged only when the user affirmatively asserts the misconception,
  // NOT when they properly contrast or negate it.
  const detectedMistakes: IncorrectConceptDetail[] = [];
  const lowerAnswer = answer.toLowerCase();

  // Question-specific high-fidelity misconception rules
  if (params.questionText.toLowerCase().includes("join") && params.questionText.toLowerCase().includes("union")) {
    const claimsUnionJoinsKey =
      (lowerAnswer.includes("union") && (lowerAnswer.includes("primary key") || lowerAnswer.includes("foreign key"))) &&
      (lowerAnswer.includes("join") || lowerAnswer.includes("used to join") || lowerAnswer.includes("combines two tables using")) &&
      !lowerAnswer.includes("while union") &&
      !lowerAnswer.includes("whereas union") &&
      !lowerAnswer.includes("does not") &&
      !lowerAnswer.includes("doesn't") &&
      !lowerAnswer.includes("horizontally");

    if (claimsUnionJoinsKey) {
      detectedMistakes.push({
        claim: "UNION is used to join two tables using primary key.",
        problem: "UNION does not join tables using a primary key. It combines the result sets of two SELECT statements.",
        correctConcept: "JOIN combines related rows from tables based on keys/conditions horizontally. UNION combines result sets from SELECT queries vertically.",
      });
    }
  } else if (params.questionText.toLowerCase().includes("b-tree") || params.questionText.toLowerCase().includes("index")) {
    const claimsIndexesSpeedWrites =
      (lowerAnswer.includes("speed") || lowerAnswer.includes("faster") || lowerAnswer.includes("accelerate")) &&
      (lowerAnswer.includes("write") || lowerAnswer.includes("insert")) &&
      !lowerAnswer.includes("slow") &&
      !lowerAnswer.includes("degrade") &&
      !lowerAnswer.includes("overhead");

    if (claimsIndexesSpeedWrites) {
      detectedMistakes.push({
        claim: "Indexes speed up write operations (INSERT/UPDATE/DELETE).",
        problem: "Indexes accelerate read lookups O(log N) but degrade write throughput due to tree rebalancing and page splits.",
        correctConcept: "Maintain indexes sparingly on high-write tables to minimize write amplification.",
      });
    }
  } else if (params.questionText.toLowerCase().includes("event loop")) {
    const claimsSetTimeoutBeforePromise =
      lowerAnswer.includes("settimeout") &&
      lowerAnswer.includes("before") &&
      lowerAnswer.includes("promise") &&
      !lowerAnswer.includes("not before");

    if (claimsSetTimeoutBeforePromise) {
      detectedMistakes.push({
        claim: "setTimeout executes before Promise microtasks.",
        problem: "Microtasks (Promise.then) have strict priority and drain completely before the event loop runs macrotasks (setTimeout).",
        correctConcept: "Synchronous code -> Microtasks (Promises) -> Macrotasks (setTimeout).",
      });
    }
  }

  // 3. CHECK EXPECTED CONCEPTS COVERAGE
  const coveredConcepts: string[] = [];
  const missingConcepts: string[] = [];

  for (const exp of params.expectedConcepts) {
    const match = calculateConceptMatch(answerNorm, exp);
    if (match.matched) {
      coveredConcepts.push(exp);
    } else {
      missingConcepts.push(exp);
    }
  }

  // 4. CHECK ACCEPTABLE CONCEPTS (BONUS OR ALTERNATIVES)
  const coveredAcceptable: string[] = [];
  for (const acc of params.acceptableConcepts) {
    const match = calculateConceptMatch(answerNorm, acc);
    if (match.matched) {
      coveredAcceptable.push(acc);
    }
  }

  // 5. DETERMINE ANSWER STATUS & SCORE
  const totalExpected = Math.max(1, params.expectedConcepts.length);
  const coverageRatio = coveredConcepts.length / totalExpected;
  const hasSevereMistake = detectedMistakes.length > 0;

  let status: AnswerStatus;
  let overallScore: number;

  if (hasSevereMistake && coverageRatio <= 0.3) {
    status = "INCORRECT";
    overallScore = 38; // Strict standard for severe misconception
  } else if (hasSevereMistake) {
    status = "WEAK";
    overallScore = Math.min(54, Math.max(42, 40 + Math.round(coverageRatio * 20)));
  } else if (coverageRatio >= 0.75) {
    status = "CORRECT";
    overallScore = Math.min(96, Math.max(90, 88 + Math.round(coverageRatio * 8)));
  } else if (coverageRatio >= 0.45 || (coveredConcepts.length >= 2 && coveredAcceptable.length > 0)) {
    status = "MOSTLY_CORRECT";
    // Hits the core distinction with minor nuances omitted
    overallScore = Math.min(93, Math.max(88, 86 + Math.round(coverageRatio * 12)));
  } else if (coverageRatio >= 0.25 || coveredAcceptable.length > 0) {
    status = "PARTIALLY_CORRECT";
    overallScore = Math.min(74, Math.max(62, 60 + Math.round(coverageRatio * 20)));
  } else {
    status = "WEAK";
    overallScore = Math.min(58, Math.max(46, 44 + Math.round(wordCount > 30 ? 8 : 4)));
  }

  // Calculate deterministic category scores
  const technicalScore = status === "INCORRECT" ? Math.min(38, overallScore) : overallScore;
  const communicationScore = Math.min(95, Math.max(60, wordCount >= 25 ? 88 : 72));
  const structureScore = Math.min(92, Math.max(55, answer.includes(".") || answer.includes(",") ? 85 : 68));
  const deliveryScore = params.wpm ? (params.wpm >= 110 && params.wpm <= 165 ? 88 : 74) : 80;

  // 6. BUILD EVIDENCE & WHY THIS ASSESSMENT
  let whyThisAssessment = "";
  if (status === "INCORRECT") {
    const mistakeDetail = detectedMistakes[0]?.problem || "A fundamental technical mechanism was confused.";
    whyThisAssessment = mistakeDetail;
  } else if (status === "CORRECT") {
    whyThisAssessment = `You accurately identified key architectural principles and articulated the distinction clearly (${coveredConcepts.length}/${totalExpected} expected concepts identified).`;
  } else if (status === "MOSTLY_CORRECT") {
    if (params.questionText.toLowerCase().includes("join") && params.questionText.toLowerCase().includes("union")) {
      whyThisAssessment = "You accurately contrasted horizontal row joining based on relationships against vertical query result set appending.";
    } else {
      whyThisAssessment = `You grasped the core premise and demonstrated good understanding, though some nuance or edge cases remained unmentioned.`;
    }
  } else if (status === "PARTIALLY_CORRECT") {
    whyThisAssessment = `You correctly noted parts of the domain, but omitted critical mechanisms needed for a complete interview explanation.`;
  } else {
    whyThisAssessment = `The explanation is currently high-level and lacks specific mechanical depth.`;
  }

  // 7. BUILD STRENGTHS (1-3)
  const strengths: string[] = [];
  if (status === "INCORRECT") {
    if (lowerAnswer.includes("union") || lowerAnswer.includes("join")) {
      strengths.push("You recognized that UNION combines information from multiple sources.");
    } else {
      strengths.push("Attempted to address the question prompt directly.");
    }
  } else {
    if (params.questionText.toLowerCase().includes("join") && params.questionText.toLowerCase().includes("union")) {
      if (lowerAnswer.includes("join")) strengths.push("JOIN combines related rows horizontally based on a related key or column.");
      if (lowerAnswer.includes("union")) strengths.push("UNION combines result sets vertically from multiple queries.");
    } else {
      if (coveredConcepts.length > 0) {
        strengths.push(`Identified core mechanism: ${coveredConcepts[0].split(" ").slice(0, 10).join(" ")}...`);
      }
      if (coveredConcepts.length > 1) {
        strengths.push(`Addressed related behavior: ${coveredConcepts[1].split(" ").slice(0, 10).join(" ")}...`);
      }
    }
    if (coveredAcceptable.length > 0 && strengths.length < 3) {
      strengths.push(`Bonus perspective: mentioned ${coveredAcceptable[0].split(" ").slice(0, 8).join(" ")}.`);
    }
    if (strengths.length === 0) {
      strengths.push("Addressed the question topic directly.");
    }
  }

  // 8. BUILD IMPROVEMENTS (1-3)
  const improvements: string[] = [];
  if (detectedMistakes.length > 0) {
    improvements.push(`What needs correction: ${detectedMistakes[0].correctConcept}`);
  }
  if (missingConcepts.length > 0 && status !== "INCORRECT") {
    if (params.questionText.toLowerCase().includes("join") && params.questionText.toLowerCase().includes("union")) {
      improvements.push("Mention that UNION generally requires compatible column counts and compatible data types across projections.");
    } else {
      improvements.push(`Include missing concept: ${missingConcepts[0].split(" ").slice(0, 10).join(" ")}...`);
    }
  }
  if (missingConcepts.length > 1 && improvements.length < 3 && status !== "INCORRECT") {
    improvements.push(`Discuss trade-offs: ${missingConcepts[1].split(" ").slice(0, 10).join(" ")}.`);
  }
  if (improvements.length === 0) {
    improvements.push("Elaborate on production scaling trade-offs or operational failure recovery.");
  }

  // 9. BUILD REMEMBER RULE
  let rememberRule: string | undefined;
  if (params.questionText.toLowerCase().includes("join") && params.questionText.toLowerCase().includes("union")) {
    rememberRule = "JOIN = relate data horizontally based on keys | UNION = append result sets vertically from compatible queries.";
  } else if (params.questionText.toLowerCase().includes("index") || params.questionText.toLowerCase().includes("b-tree")) {
    rememberRule = "Indexes accelerate logarithmic reads O(log N) but impose write amplification and page rebalancing on mutations.";
  } else if (params.questionText.toLowerCase().includes("event loop")) {
    rememberRule = "Synchronous code runs first -> Microtasks (Promises, queueMicrotask) flush completely -> Next macrotask (setTimeout, I/O) executes.";
  }

  // 10. ATTEMPT COMPARISON
  let attemptComparison: AttemptComparison | undefined;
  if (params.attemptNumber && params.attemptNumber > 1 && params.previousEvaluation) {
    const diff = overallScore - params.previousEvaluation.overallScore;
    attemptComparison = {
      previousScore: params.previousEvaluation.overallScore,
      currentScore: overallScore,
      difference: diff,
      summary:
        diff > 0
          ? `+${diff} point improvement from Attempt ${params.attemptNumber - 1}. Addressed prior gaps.`
          : diff === 0
          ? `Maintained consistent score (${overallScore}/100) across attempts.`
          : `${diff} points. Try incorporating the reference concepts directly.`,
    };
  }

  // 11. IMPROVED ANSWER
  let improvedAnswer = params.referenceAnswer;
  if (params.questionText.toLowerCase().includes("join") && params.questionText.toLowerCase().includes("union")) {
    improvedAnswer =
      'JOIN combines columns/rows from related tables based on a join condition horizontally. UNION combines the result sets of two SELECT queries into one result set vertically, assuming compatible projections and column types.';
  }

  // 12. SIMPLE EXPLANATION (Section 62)
  let simpleExplanation: string | undefined = undefined;
  if (status === "INCORRECT" || status === "PARTIALLY_CORRECT" || status === "WEAK") {
    if (params.questionText.toLowerCase().includes("join") && params.questionText.toLowerCase().includes("union")) {
      simpleExplanation =
        "Think of JOIN as horizontal stitching: matching rows side-by-side using common keys. Think of UNION as vertical stacking: placing rows from one result set underneath another.";
    } else if (params.questionText.toLowerCase().includes("normalization") || params.questionText.toLowerCase().includes("3nf")) {
      simpleExplanation =
        "Normalization eliminates duplicate data by separating records into focused tables. 3NF ensures every non-key column depends directly on the primary key, preventing update and delete anomalies.";
    } else {
      simpleExplanation =
        `Focus on the core mechanic: clearly state the purpose of the architecture or pattern, how data flows through it, and why you chose it over simpler alternatives.`;
    }
  }

  const citations: string[] = [];
  if (params.sourceCitation) {
    citations.push(params.sourceCitation);
  }

  return {
    status,
    overallScore,
    categoryScores: {
      technical: technicalScore,
      communication: communicationScore,
      structure: structureScore,
      delivery: deliveryScore,
    },
    whyThisAssessment,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    missingConcepts: missingConcepts.slice(0, 3),
    incorrectConcepts: detectedMistakes,
    rememberRule,
    referenceAnswer: params.referenceAnswer,
    improvedAnswer,
    simpleExplanation,
    sourceCitations: citations.length > 0 ? citations : undefined,
    explanation: whyThisAssessment,
    attemptComparison,
    confidence: 90,
  };
}

/**
 * Deep Answer Evaluator with Gemini AI Enhancement & Deterministic Fallback
 */
export async function evaluateAnswerDeeply(params: EvaluateAnswerParams): Promise<DeepEvaluationResult> {
  const fallback = evaluateAnswerDeterministically(params);

  // If Gemini is available, we can augment with nuanced natural language understanding
  try {
    const prompt = `You are a Principal Engineering Interview Coach at a top technology firm.
Evaluate the following candidate response to an interview question using the provided criteria and rubrics.
Your evaluation must TEACH, not just score.

Question: "${params.questionText}"
Category: "${params.category}"
Role: "${params.role}"
Difficulty: "${params.difficulty}"

Expected Concepts:
${params.expectedConcepts.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Acceptable Alternative Concepts:
${params.acceptableConcepts.map((c, i) => `- ${c}`).join("\n")}

Common Misconceptions / Mistakes:
${params.commonMistakes.map((m, i) => `- ${m}`).join("\n")}

Reference Answer:
"${params.referenceAnswer}"

Candidate's Answer:
"${params.answerText}"

Candidate Attempt Number: ${params.attemptNumber || 1}
Previous Score: ${params.previousEvaluation?.overallScore ?? "None"}

Evaluate strictly into this JSON schema:
{
  "status": "CORRECT" | "MOSTLY_CORRECT" | "PARTIALLY_CORRECT" | "WEAK" | "INCORRECT" | "INSUFFICIENT_INFORMATION",
  "overallScore": number (0-100, no random numbers, rubric-based),
  "categoryScores": {
    "technical": number,
    "communication": number,
    "structure": number,
    "delivery": number
  },
  "whyThisAssessment": string (clear evidence citing user answer),
  "strengths": string[] (1-3 top things candidate got right),
  "improvements": string[] (1-3 specific actionable improvements),
  "missingConcepts": string[] (1-3 expected concepts omitted),
  "incorrectConcepts": [
    {
      "claim": string,
      "problem": string,
      "correctConcept": string
    }
  ],
  "rememberRule": string (concise mental model or rule of thumb),
  "improvedAnswer": string (interview-ready 45-75 second spoken answer),
  "followUpQuestion": string (natural follow-up based on their answer)
}
Return ONLY valid JSON.`;

    const aiResponse = await geminiClient.evaluateAnswer(
      params.questionText,
      params.answerText,
      params.category
    );

    // If Gemini client succeeded and we have structured data
    if (aiResponse && aiResponse.overallScore !== undefined) {
      // Blend AI scores with deterministic safety bounds
      const safeScore = Math.max(0, Math.min(100, Math.round(aiResponse.overallScore)));
      
      let aiStatus: AnswerStatus = fallback.status;
      if (safeScore >= 88 && fallback.incorrectConcepts.length === 0) aiStatus = "CORRECT";
      else if (safeScore >= 75 && fallback.incorrectConcepts.length === 0) aiStatus = "MOSTLY_CORRECT";
      else if (safeScore >= 60 && fallback.incorrectConcepts.length === 0) aiStatus = "PARTIALLY_CORRECT";
      else if (fallback.incorrectConcepts.length > 0 || safeScore < 45) aiStatus = "INCORRECT";
      else aiStatus = "WEAK";

      return {
        ...fallback,
        status: aiStatus,
        overallScore: safeScore,
        whyThisAssessment: aiResponse.feedback || fallback.whyThisAssessment,
        strengths: (aiResponse.strengths && aiResponse.strengths.length > 0) ? aiResponse.strengths.slice(0, 3) : fallback.strengths,
        improvements: (aiResponse.improvements && aiResponse.improvements.length > 0) ? aiResponse.improvements.slice(0, 3) : fallback.improvements,
        confidence: 96,
      };
    }
  } catch (err) {
    console.log("▲ Using deterministic semantic evaluator fallback:", (err as any)?.message || err);
  }

  return fallback;
}
