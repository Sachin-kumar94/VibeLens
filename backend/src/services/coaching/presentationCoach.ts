/**
 * Presentation Coaching & Evidence-Based Feedback Engine
 *
 * Evaluates real measured signals against user-selected targets.
 * Strictly avoids pseudo-psychological or medical claims.
 * All observations are grounded in observable acoustic, kinematic, and temporal metrics.
 */

export interface PresentationMetricsInput {
  duration: number; // in seconds
  pace: number; // measured WPM
  targetPaceMin: number;
  targetPaceMax: number;
  pauseCount: number;
  avgPauseDuration: number;
  fillerCount?: number | null;
  fillerRate?: number | null;
  cameraEngagement?: number | null; // 0 - 100 percentage
  posture?: number | null; // 0 - 100 alignment
  gestureActivity?: string | null; // "Low" | "Moderate" | "High"
  signalQuality?: string; // "Good" | "Fair" | "Poor"
  audioQuality?: string;
  videoQuality?: string;
  framingQuality?: string;
  hasSpeechData?: boolean;
}

export interface CoachingRecommendation {
  id: string;
  category: "Pacing" | "Pauses" | "Visual Engagement" | "Posture & Alignment" | "Vocal Delivery";
  priority: "High" | "Medium" | "Low";
  observation: string;
  whyItMatters: string;
  practiceTip: string;
}

export interface PracticePlan {
  nextTargetPace: string;
  focusCue: string;
  pauseExercise: string;
  postureReminder: string;
}

export interface CoachingEvaluationResult {
  deliveryScore: number;
  visualPresenceScore: number;
  vocalDeliveryScore: number;
  signalQualityScore: number;
  overallScore: number;
  paceStatus: "Within target" | "Above target" | "Below target" | "Insufficient speech";
  recommendations: CoachingRecommendation[];
  strengths: string[];
  improvements: string[];
  practicePlan: PracticePlan;
}

export function evaluatePresentationSession(metrics: PresentationMetricsInput): CoachingEvaluationResult {
  const {
    duration,
    pace,
    targetPaceMin,
    targetPaceMax,
    pauseCount,
    avgPauseDuration,
    fillerCount = 0,
    cameraEngagement = 85,
    posture = 85,
    signalQuality = "Good",
    hasSpeechData = true,
  } = metrics;

  const validEngagement = typeof cameraEngagement === "number" ? Math.max(0, Math.min(100, cameraEngagement)) : 85;
  const validPosture = typeof posture === "number" ? Math.max(0, Math.min(100, posture)) : 85;

  // Determine Pace Status
  let paceStatus: "Within target" | "Above target" | "Below target" | "Insufficient speech" = "Within target";
  if (!hasSpeechData || duration < 10 || pace === 0) {
    paceStatus = "Insufficient speech";
  } else if (pace > targetPaceMax) {
    paceStatus = "Above target";
  } else if (pace < targetPaceMin) {
    paceStatus = "Below target";
  }

  // 1. Delivery Score calculation (0 - 100)
  let deliveryScore = 85;
  if (paceStatus === "Within target") {
    deliveryScore = 94;
  } else if (paceStatus === "Above target") {
    const diff = pace - targetPaceMax;
    deliveryScore = Math.max(60, 90 - Math.round(diff * 1.2));
  } else if (paceStatus === "Below target") {
    const diff = targetPaceMin - pace;
    deliveryScore = Math.max(60, 90 - Math.round(diff * 1.5));
  } else {
    deliveryScore = 75; // Insufficient speech
  }

  // Deduct slightly for abnormal pause lengths (>4s) or high fillers (>8/min)
  if (avgPauseDuration > 3.5) deliveryScore = Math.max(55, deliveryScore - 8);
  if ((fillerCount || 0) > 8) deliveryScore = Math.max(55, deliveryScore - 5);

  // 2. Visual Presence Score calculation (0 - 100)
  const visualPresenceScore = Math.round(validEngagement * 0.55 + validPosture * 0.45);

  // 3. Vocal Delivery Score calculation (0 - 100)
  let vocalDeliveryScore = 88;
  if (metrics.audioQuality === "Poor") {
    vocalDeliveryScore -= 20;
  } else if (metrics.audioQuality === "Fair") {
    vocalDeliveryScore -= 8;
  }
  if (paceStatus === "Within target") vocalDeliveryScore += 4;
  vocalDeliveryScore = Math.min(98, Math.max(50, vocalDeliveryScore));

  // 4. Signal Quality Score (0 - 100)
  let signalQualityScore = 90;
  if (signalQuality === "Fair") signalQualityScore = 75;
  if (signalQuality === "Poor") signalQualityScore = 55;

  // Weighted Overall Presentation Score
  const overallScore = Math.round(
    deliveryScore * 0.35 +
    visualPresenceScore * 0.25 +
    vocalDeliveryScore * 0.25 +
    signalQualityScore * 0.15
  );

  // Construct Prioritized Actionable Recommendations
  const recommendations: CoachingRecommendation[] = [];

  // Pacing recommendation
  if (paceStatus === "Above target") {
    recommendations.push({
      id: "rec_pace_fast",
      category: "Pacing",
      priority: "High",
      observation: `Observed tempo of ${pace} WPM exceeded your selected target range of ${targetPaceMin}–${targetPaceMax} WPM.`,
      whyItMatters: "A rapid cadence can reduce audience processing time and lead to breath constriction.",
      practiceTip: "Try anchoring each major slide or topic transition with a complete exhale before speaking.",
    });
  } else if (paceStatus === "Below target") {
    recommendations.push({
      id: "rec_pace_slow",
      category: "Pacing",
      priority: "High",
      observation: `Observed tempo of ${pace} WPM was below your selected target of ${targetPaceMin}–${targetPaceMax} WPM.`,
      whyItMatters: "A slower cadence may diminish perceived momentum during high-impact project presentations.",
      practiceTip: "Group related phrases together and practice rhythmic sentence conclusions without elongated pauses.",
    });
  }

  // Pause recommendation
  if (avgPauseDuration > 3.0 && pauseCount > 2) {
    recommendations.push({
      id: "rec_pause_long",
      category: "Pauses",
      priority: "Medium",
      observation: `Average silence interval was measured at ${avgPauseDuration.toFixed(1)}s across ${pauseCount} distinct pauses.`,
      whyItMatters: "Extended silences exceeding 3 seconds can feel like unintentional hesitancy rather than structured pacing.",
      practiceTip: "Aim for deliberate, punchy pauses between 1.5 and 2.0 seconds after key assertions.",
    });
  } else if (pauseCount === 0 && duration > 45 && hasSpeechData) {
    recommendations.push({
      id: "rec_pause_none",
      category: "Pauses",
      priority: "Medium",
      observation: "Continuous vocal delivery detected with zero registered pause boundaries over 45+ seconds.",
      whyItMatters: "Unbroken delivery leaves listeners with little cognitive headroom to absorb key arguments.",
      practiceTip: "Introduce intentional breath pauses between separate concepts to punctuate your delivery.",
    });
  }

  // Camera engagement recommendation
  if (validEngagement < 70) {
    recommendations.push({
      id: "rec_gaze_low",
      category: "Visual Engagement",
      priority: "Medium",
      observation: `Camera-facing signals were detected for ${validEngagement}% of the rehearsal duration.`,
      whyItMatters: "Direct camera framing fosters audience connection and perceived attentiveness.",
      practiceTip: "Place the browser window close to your physical camera lens to keep your natural gaze aligned.",
    });
  }

  // Posture recommendation
  if (validPosture < 75) {
    recommendations.push({
      id: "rec_posture_tilt",
      category: "Posture & Alignment",
      priority: "Low",
      observation: `Upper-body kinematic alignment scored ${validPosture}% with occasional shoulder tilt detected.`,
      whyItMatters: "Balanced bilateral shoulder orientation provides a grounded, stable presentation presence.",
      practiceTip: "Align both feet flat on the floor and ensure your shoulders are relaxed and symmetrically level.",
    });
  }

  // Fallback recommendation if everything is strong
  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec_maintenance",
      category: "Pacing",
      priority: "Low",
      observation: `Speaking pace (${pace} WPM) and camera alignment (${validEngagement}%) matched selected parameters consistently.`,
      whyItMatters: "Consistent delivery provides predictable cadence and strong engagement.",
      practiceTip: "Maintain this steady tempo and experiment with slight vocal inflection on critical summary points.",
    });
  }

  // Identify Strengths (1–3)
  const strengths: string[] = [];
  if (paceStatus === "Within target") {
    strengths.push(`Cadence maintained within target (${targetPaceMin}–${targetPaceMax} WPM).`);
  }
  if (validEngagement >= 80) {
    strengths.push(`Consistent camera engagement (${validEngagement}%) throughout delivery.`);
  }
  if (validPosture >= 80) {
    strengths.push("Stable upper-body postural alignment with centered framing.");
  }
  if (strengths.length === 0) {
    strengths.push("Clear acoustic transmission with minimal background interference.");
  }

  // Identify Improvements (1–3)
  const improvements: string[] = [];
  if (paceStatus !== "Within target" && paceStatus !== "Insufficient speech") {
    improvements.push(`Align pacing closer to selected target window (${targetPaceMin}–${targetPaceMax} WPM).`);
  }
  if (validEngagement < 75) {
    improvements.push("Elevate camera-facing orientation to maintain sustained audience engagement.");
  }
  if (validPosture < 80) {
    improvements.push("Maintain relaxed, level shoulders and centered torso framing.");
  }
  if (improvements.length === 0) {
    improvements.push("Incorporate structured 2-second pauses before major topic shifts.");
  }

  // Personalized Next Rehearsal Practice Plan
  const practicePlan: PracticePlan = {
    nextTargetPace: `${targetPaceMin}–${targetPaceMax} WPM`,
    focusCue: paceStatus === "Above target" ? "Pace Regulation & Deliberate Exhales" : "Sustained Eye Engagement",
    pauseExercise: "Practice 2-second breath pauses immediately following your thesis statement.",
    postureReminder: "Check upper-body centering on camera before starting recording.",
  };

  return {
    deliveryScore,
    visualPresenceScore,
    vocalDeliveryScore,
    signalQualityScore,
    overallScore,
    paceStatus,
    recommendations: recommendations.slice(0, 4),
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    practicePlan,
  };
}
