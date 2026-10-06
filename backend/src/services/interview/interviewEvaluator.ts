export interface RubricConfig {
  structure: number;
  relevance: number;
  clarity: number;
  delivery: number;
  evidence: number;
  methodology?: "STAR" | "TECHNICAL_DESIGN" | "LEADERSHIP_ALIGNMENT" | "PRODUCT_TRADEOFF" | "GENERAL_COMMUNICATION";
}

export interface SpeechMetricsInput {
  wpm: number;
  pauseCount: number;
  avgPauseDuration: number;
  longestPause?: number;
  fillerCount: number;
  fillerRate?: number;
  audioQuality?: string;
}

export interface VisualMetricsInput {
  hasVisualData: boolean;
  cameraFacingSignal?: string; // "Good" | "Moderate" | "Limited" | "Unavailable"
  postureSignal?: string; // "Upright" | "Forward Lean" | "Moderate" | "Unavailable"
  framingQuality?: string; // "Good" | "Fair" | "Poor" | "Unavailable"
  videoQuality?: string;
}

export interface IntegrityEventItem {
  type: string;
  timestamp: number;
  duration?: number;
  source?: string;
  metadata?: any;
}

export interface EvaluatorInput {
  questionText: string;
  category: string;
  criteria: string;
  timeTargetMin: number;
  timeTargetMax: number;
  rubric: RubricConfig;
  transcript: string;
  duration: number;
  speechMetrics: SpeechMetricsInput;
  visualMetrics: VisualMetricsInput;
  integrityEvents?: IntegrityEventItem[];
  faceVisibility?: number;
}

export interface EvaluationResult {
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
  transcriptObservations: string;
  deliveryObservations: string;
  rubricVersion: string;
  analysisProvider: string;
  paceState?: "Within target" | "Above target" | "Below target" | "Insufficient data";
  actualWpm?: number;
  fillerCount?: number;
  fillerRate?: number;
  structureBreakdown?: {
    methodology: string;
    hasOpening: boolean;
    hasTransitions: boolean;
    hasConclusion: boolean;
    star?: { situation: boolean; task: boolean; action: boolean; result: boolean };
    technical?: { problem: boolean; approach: boolean; tradeoffs: boolean; implementation: boolean; result: boolean };
    project?: { architecture: boolean; techChoices: boolean; challenges: boolean; lessons: boolean };
  };
  integritySummary?: {
    eventCount: number;
    focusChanges: number;
    pageHiddenSeconds: number;
    pasteEvents: number;
    fullscreenExits: number;
    faceVisiblePercent: number;
    interruptions: number;
    notes: string;
  };
}

export function evaluateInterviewAnswer(input: EvaluatorInput): EvaluationResult {
  const {
    questionText,
    category,
    criteria,
    timeTargetMin,
    timeTargetMax,
    rubric,
    transcript = "",
    duration = 0,
    speechMetrics,
    visualMetrics,
  } = input;

  const cleanText = transcript.trim();
  const words = cleanText.length > 0 ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  // 1. Check for minimal speech presence
  if (wordCount < 6 || duration < 5) {
    return {
      overallScore: 38,
      structureScore: 35,
      relevanceScore: 40,
      clarityScore: 40,
      deliveryScore: 35,
      evidenceScore: 30,
      strengths: [
        "Session initiated with microphone connection established.",
      ],
      improvements: [
        "Spoken answer was too brief or inaudible (fewer than 6 words detected).",
        "Ensure your microphone input level is active and articulate your complete response.",
      ],
      nextPractice: [
        "Retake this question and aim for at least 45 seconds of continuous, structured speech.",
      ],
      feedback: "Speech detection was limited. The response contained insufficient audible content to evaluate answer structure or technical depth.",
      transcriptObservations: cleanText.length > 0 ? `Captured fragment: "${cleanText}"` : "No spoken words transcribed.",
      deliveryObservations: `Duration: ${Math.round(duration)}s. Microphone was active but minimal speech signal was detected.`,
      rubricVersion: "1.0.0",
      analysisProvider: "vibelens-rule-engine-v2",
    };
  }

  // 2. Delivery & Cadence Evaluation
  const actualWpm = duration > 5 ? Math.round((wordCount / duration) * 60) : speechMetrics.wpm || 0;
  let deliveryScore = 80;

  // Pace scoring: ideal conversational interview pace is 125 - 165 WPM
  if (actualWpm >= 125 && actualWpm <= 165) {
    deliveryScore += 10;
  } else if ((actualWpm >= 105 && actualWpm < 125) || (actualWpm > 165 && actualWpm <= 185)) {
    deliveryScore += 4;
  } else if (actualWpm < 95 || actualWpm > 200) {
    deliveryScore -= 12;
  }

  // Filler words calculation
  const fillerCount = speechMetrics.fillerCount || (cleanText.match(/\b(um|uh|er|ah|like|you know|basically|sort of)\b/gi) || []).length;
  const fillerRate = wordCount > 0 ? Number(((fillerCount / wordCount) * 100).toFixed(1)) : 0;

  if (fillerRate <= 2.0) {
    deliveryScore += 6;
  } else if (fillerRate > 4.5) {
    deliveryScore -= 8;
  }

  // Duration adherence
  const isWithinTarget = duration >= timeTargetMin && duration <= timeTargetMax;
  const isBelowTarget = duration < timeTargetMin;
  const isAboveTarget = duration > timeTargetMax;

  if (isWithinTarget) {
    deliveryScore += 4;
  } else if (duration < timeTargetMin * 0.6) {
    deliveryScore -= 8;
  }

  deliveryScore = Math.max(45, Math.min(96, deliveryScore));

  // 3. Structure Evaluation (STAR / Technical / Leadership)
  const lowerText = cleanText.toLowerCase();
  let structureScore = 74;

  const hasOpeningHook = /\b(i believe|in my experience|when approaching|specifically|the primary challenge|my approach|to solve this|first and foremost)\b/i.test(lowerText);
  if (hasOpeningHook) structureScore += 8;

  const hasTransitions = /\b(first|second|furthermore|in addition|specifically|however|on the other hand|because of this|subsequently)\b/i.test(lowerText);
  if (hasTransitions) structureScore += 6;

  const hasConclusion = /\b(ultimately|in summary|as a result|the outcome was|moving forward|in conclusion|that allowed us|this experience taught)\b/i.test(lowerText);
  if (hasConclusion) structureScore += 7;

  // Methodology-specific checks
  const method = rubric.methodology || "STAR";
  if (method === "STAR") {
    const hasSituation = /\b(situation|context|background|problem|team was|faced with|project was)\b/i.test(lowerText);
    const hasAction = /\b(i decided|i built|i led|i initiated|my role|i designed|i stepped in|i proposed)\b/i.test(lowerText);
    const hasResult = /\b(result|outcome|impact|reduced|increased|delivered|learned|resolved)\b/i.test(lowerText);
    if (hasSituation && hasAction && hasResult) {
      structureScore += 8;
    } else if (hasAction && hasResult) {
      structureScore += 4;
    }
  } else if (method === "TECHNICAL_DESIGN" || method === "PRODUCT_TRADEOFF") {
    const hasTradeoffs = /\b(trade-off|tradeoff|versus|alternative|latency|throughput|consistency|bottleneck|constraint|scalability)\b/i.test(lowerText);
    const hasImplementation = /\b(cache|queue|database|architecture|service|component|render|state|protocol|api)\b/i.test(lowerText);
    if (hasTradeoffs && hasImplementation) {
      structureScore += 8;
    } else if (hasTradeoffs || hasImplementation) {
      structureScore += 4;
    }
  } else if (method === "LEADERSHIP_ALIGNMENT") {
    const hasConsensus = /\b(consensus|alignment|disagreement|listened|empathy|perspective|stakeholder|framework|transparency)\b/i.test(lowerText);
    if (hasConsensus) structureScore += 7;
  }

  structureScore = Math.max(50, Math.min(97, structureScore));

  // 4. Relevance & Topic Alignment
  let relevanceScore = 75;
  const questionKeywords = questionText
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const matchedKeywords = questionKeywords.filter((kw) => lowerText.includes(kw));
  const matchRatio = questionKeywords.length > 0 ? matchedKeywords.length / questionKeywords.length : 0.5;

  if (matchRatio >= 0.4) relevanceScore += 12;
  else if (matchRatio >= 0.2) relevanceScore += 6;
  else relevanceScore -= 5;

  // Criteria keyword matching
  const criteriaWords = criteria.toLowerCase().split(/[,\s]+/).filter((w) => w.length > 4);
  const matchedCriteria = criteriaWords.filter((cw) => lowerText.includes(cw));
  if (matchedCriteria.length >= 2) relevanceScore += 8;

  relevanceScore = Math.max(50, Math.min(96, relevanceScore));

  // 5. Clarity & Articulation
  let clarityScore = 78;
  const sentences = cleanText.split(/[.?!]+/).filter((s) => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : wordCount;

  // Optimal sentence length: 12 - 24 words per sentence
  if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 26) {
    clarityScore += 8;
  } else if (avgWordsPerSentence > 36) {
    clarityScore -= 6; // Run-on sentences
  }

  if (wordCount >= 60) clarityScore += 6;
  clarityScore = Math.max(50, Math.min(97, clarityScore));

  // 6. Evidence & Substance
  let evidenceScore = 72;
  const hasNumbersOrMetrics = /\b(\d+|percent|%|hours|days|weeks|months|users|latency|ms|throughput|revenue)\b/i.test(lowerText);
  if (hasNumbersOrMetrics) evidenceScore += 10;

  const hasSpecificExamples = /\b(for instance|for example|such as|specifically|in one project|one case)\b/i.test(lowerText);
  if (hasSpecificExamples) evidenceScore += 8;

  evidenceScore = Math.max(45, Math.min(95, evidenceScore));

  // 7. Calculate Weighted Overall Practice Score
  const weights = {
    structure: rubric.structure || 25,
    relevance: rubric.relevance || 25,
    clarity: rubric.clarity || 20,
    delivery: rubric.delivery || 15,
    evidence: rubric.evidence || 15,
  };

  const rawOverall =
    (structureScore * weights.structure +
      relevanceScore * weights.relevance +
      clarityScore * weights.clarity +
      deliveryScore * weights.delivery +
      evidenceScore * weights.evidence) /
    100;

  const overallScore = Math.max(48, Math.min(96, Math.round(rawOverall)));

  // 8. Generate Evidence-Based Strengths
  const strengths: string[] = [];

  if (hasOpeningHook) {
    strengths.push("Opened with a clear thesis statement that framed the response direction immediately.");
  } else {
    strengths.push("Maintained topical focus on the core prompt requirements throughout.");
  }

  if (actualWpm >= 120 && actualWpm <= 165) {
    strengths.push(`Measured speaking tempo of ${actualWpm} WPM supported listener comprehension and executive presence.`);
  } else if (fillerRate <= 2.5) {
    strengths.push(`Clean verbal articulation with minimal filler hesitation (${fillerCount} filler occurrences, ${fillerRate}% rate).`);
  }

  if (hasNumbersOrMetrics || hasSpecificExamples) {
    strengths.push("Grounded your explanation with concrete technical context rather than generic high-level statements.");
  }

  if (visualMetrics.hasVisualData && visualMetrics.cameraFacingSignal === "Good") {
    strengths.push("Consistent camera-facing alignment maintained throughout the delivery window.");
  }

  // Ensure minimum 2 strengths
  if (strengths.length < 2) {
    strengths.push("Demonstrated direct conversational engagement with structured phrase boundaries.");
  }

  // 9. Generate Constructive Improvements
  const improvements: string[] = [];

  if (!hasConclusion) {
    improvements.push("Conclude with an explicit summary sentence linking your answer back to the primary challenge.");
  }

  if (isBelowTarget) {
    improvements.push(`Response duration (${Math.round(duration)}s) was below target (${timeTargetMin}–${timeTargetMax}s). Expand with one concrete illustrative example.`);
  } else if (isAboveTarget) {
    improvements.push(`Response duration (${Math.round(duration)}s) exceeded target window. Tighten opening background context to leave more room for results.`);
  }

  if (fillerRate > 3.5) {
    improvements.push(`Filler words detected at a ${fillerRate}% rate (${fillerCount} words). Use a deliberate 1-second breath pause before complex transitions.`);
  }

  if (!hasNumbersOrMetrics && method === "STAR") {
    improvements.push("Incorporate quantifiable impact or measurable trade-off metrics into the resolution phase.");
  }

  if (visualMetrics.hasVisualData && visualMetrics.postureSignal === "Forward Lean") {
    improvements.push("Observable forward lean detected during delivery. Maintain a grounded, upright spine alignment for relaxed breathing.");
  }

  // Ensure minimum 2 improvements
  if (improvements.length < 2) {
    improvements.push("State your decisive recommendation earlier in the response before detailing implementation nuances.");
  }

  // 10. Generate Next Practice Action Plan
  const nextPractice: string[] = [
    `Re-record a ${timeTargetMin}–${timeTargetMax}s version of this prompt focusing on: leading with your core conclusion in the first 15 seconds.`,
    method === "STAR"
      ? "Practice stating Situation (15s) → Action (45s) → Measurable Result (20s)."
      : "Practice outlining Approach → Alternative Considered → Selected Trade-off.",
  ];

  // 11. Narrative synthesis feedback
  const feedback = `You delivered a ${Math.round(duration)}s response at ${actualWpm} WPM with a practice score of ${overallScore}. ${
    isWithinTarget ? "Pacing remained well within the designated time window." : isBelowTarget ? "The answer was concise but would benefit from further empirical depth." : "The answer was comprehensive but exceeded target duration."
  } ${hasOpeningHook ? "Your opening framed your viewpoint decisively." : "Consider opening with a direct thesis statement."}`;

  // 12. Observations
  const firstSentence = sentences[0] ? sentences[0].trim() : "Response transcribed.";
  const transcriptObservations = `First phrase recorded: "${firstSentence.substring(0, 110)}${firstSentence.length > 110 ? "..." : ""}". Total transcribed volume: ${wordCount} words across ${sentences.length} sentence units.`;

  const deliveryObservations = `Measured tempo: ${actualWpm} WPM (Target: 125–165 WPM). Pauses detected: ${speechMetrics.pauseCount || 0} (Avg duration: ${(speechMetrics.avgPauseDuration || 0).toFixed(1)}s). Filler words: ${fillerCount} (${fillerRate}%). ${
    visualMetrics.hasVisualData
      ? `Visual signals: Camera-facing status: ${visualMetrics.cameraFacingSignal || "Good"}, Posture: ${visualMetrics.postureSignal || "Upright"}.`
      : "Visual analysis was not performed (audio-only mode)."
  }`;

  // 13. Speaking Pace State
  let paceState: "Within target" | "Above target" | "Below target" | "Insufficient data" = "Within target";
  if (duration < 5 || wordCount < 6) {
    paceState = "Insufficient data";
  } else if (actualWpm >= 125 && actualWpm <= 165) {
    paceState = "Within target";
  } else if (actualWpm > 165) {
    paceState = "Above target";
  } else {
    paceState = "Below target";
  }

  // 14. Answer Structure Breakdown
  const hasSituation = /\b(situation|context|background|problem|team was|faced|facing|encounter|project was|working on|scenario)\b/i.test(lowerText);
  const hasTask = /\b(task|goal|objective|responsibility|needed to|assigned|deliverable|had to|required|requirement)\b/i.test(lowerText);
  const hasAction = /\b(i decided|i built|i led|i initiated|my role|i designed|i stepped in|i proposed|i chose|i opted|i implemented|i wrote|we implemented|implemented)\b/i.test(lowerText);
  const hasResult = /\b(result|outcome|impact|reduced|reducing|reduction|increased|increasing|delivered|learned|resolved|improved|improving|ensured|maintained)\b/i.test(lowerText);

  const hasProblem = /\b(problem|challenge|bottleneck|issue|incident|outage|failure)\b/i.test(lowerText);
  const hasApproach = /\b(approach|strategy|architecture|design|evaluated|decision)\b/i.test(lowerText);
  const hasTradeoffs = /\b(trade-off|tradeoff|versus|alternative|latency|throughput|consistency|constraint|scalability)\b/i.test(lowerText);
  const hasImplementation = /\b(cache|queue|database|service|component|render|state|protocol|api|schema)\b/i.test(lowerText);
  const hasTechResult = /\b(metric|benchmark|sla|deployed|production|resolved|speed|efficiency)\b/i.test(lowerText);

  const hasArch = /\b(stack|architecture|microservice|database|postgres|react|node|cloud)\b/i.test(lowerText);
  const hasTechChoices = /\b(chose|selected|opted|used|framework|library|tool)\b/i.test(lowerText);
  const hasChallenges = /\b(challenge|obstacle|difficulty|hardest|struggle|bug)\b/i.test(lowerText);
  const hasLessons = /\b(lesson|learned|takeaway|in hindsight|next time|refined)\b/i.test(lowerText);

  const detectedSteps: string[] = [];
  const missingSteps: string[] = [];

  if (method === "STAR") {
    if (hasSituation) detectedSteps.push("Situation"); else missingSteps.push("Situation");
    if (hasTask) detectedSteps.push("Task"); else missingSteps.push("Task");
    if (hasAction) detectedSteps.push("Action"); else missingSteps.push("Action");
    if (hasResult) detectedSteps.push("Result"); else missingSteps.push("Result");
  } else if (method === "TECHNICAL_DESIGN" || method === "PRODUCT_TRADEOFF") {
    if (hasProblem) detectedSteps.push("Problem Definition"); else missingSteps.push("Problem Definition");
    if (hasApproach) detectedSteps.push("Approach & Strategy"); else missingSteps.push("Approach & Strategy");
    if (hasTradeoffs) detectedSteps.push("Trade-off Analysis"); else missingSteps.push("Trade-off Analysis");
    if (hasImplementation) detectedSteps.push("Implementation Architecture"); else missingSteps.push("Implementation Architecture");
    if (hasTechResult) detectedSteps.push("Outcome & Reliability"); else missingSteps.push("Outcome & Reliability");
  } else {
    if (hasArch) detectedSteps.push("Architecture"); else missingSteps.push("Architecture");
    if (hasTechChoices) detectedSteps.push("Technology Choices"); else missingSteps.push("Technology Choices");
    if (hasChallenges) detectedSteps.push("Key Challenges"); else missingSteps.push("Key Challenges");
    if (hasLessons) detectedSteps.push("Lessons & Results"); else missingSteps.push("Lessons & Results");
  }

  const structureBreakdown = {
    methodology: method,
    framework: method,
    detectedSteps,
    missingSteps,
    hasOpening: hasOpeningHook,
    hasTransitions,
    hasConclusion,
    star: { situation: hasSituation, task: hasTask, action: hasAction, result: hasResult },
    technical: { problem: hasProblem, approach: hasApproach, tradeoffs: hasTradeoffs, implementation: hasImplementation, result: hasTechResult },
    project: { architecture: hasArch, techChoices: hasTechChoices, challenges: hasChallenges, lessons: hasLessons },
  };

  // 15. Integrity / Distraction Signals Analysis
  const integrityEventsList = input.integrityEvents || [];
  let focusChanges = 0;
  let pageHiddenSeconds = 0;
  let pasteEvents = 0;
  let fullscreenExits = 0;
  let interruptions = 0;

  for (const evt of integrityEventsList) {
    if (evt.type === "WINDOW_BLUR" || evt.type === "PAGE_HIDDEN" || evt.type === "TAB_SWITCH") {
      focusChanges++;
      pageHiddenSeconds += Number(evt.duration) || 0;
    } else if (evt.type === "PASTE_DURING_ANSWER") {
      pasteEvents++;
    } else if (evt.type === "FULLSCREEN_EXIT") {
      fullscreenExits++;
    } else if (evt.type === "CAMERA_LOST" || evt.type === "MICROPHONE_DISCONNECTED" || evt.type === "NETWORK_INTERRUPT") {
      interruptions++;
    }
  }

  const faceVisiblePercent = input.faceVisibility !== undefined ? Math.round(input.faceVisibility * 100) : 94;

  const integritySummary = {
    eventCount: integrityEventsList.length,
    focusChanges,
    pageHiddenSeconds: Math.round(pageHiddenSeconds),
    pasteEvents,
    fullscreenExits,
    faceVisiblePercent,
    interruptions,
    notes:
      focusChanges === 0 && interruptions === 0
        ? "Continuous uninterrupted browser focus maintained throughout delivery."
        : `${focusChanges} focus change event(s) and ${interruptions} technical interruption(s) observed.`,
  };

  return {
    overallScore,
    structureScore,
    relevanceScore,
    clarityScore,
    deliveryScore,
    evidenceScore,
    strengths,
    improvements,
    nextPractice,
    feedback,
    transcriptObservations,
    deliveryObservations,
    rubricVersion: "1.0.0",
    analysisProvider: "vibelens-rule-engine-v2",
    paceState,
    actualWpm,
    fillerCount,
    fillerRate,
    structureBreakdown,
    integritySummary,
  };
}
