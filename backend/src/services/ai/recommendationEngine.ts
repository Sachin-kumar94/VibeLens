export interface RecommendationResult {
  strengths: string[];
  observations: string[];
  actionTips: string[];
  contextualNote: string;
}

export class RecommendationEngine {
  /**
   * Generates actionable, realistic, non-clinical human coaching advice
   * for Presentation, Interview, Vocal, or Image reflection sessions.
   */
  public static generateRecommendations(params: {
    type: "presentation" | "interview" | "voice" | "image" | "body" | "fusion";
    metrics?: Record<string, any>;
    emotion?: string;
    vibe?: string;
    wpm?: number;
    clarity?: number;
    eyeContact?: number;
    posture?: number;
  }): RecommendationResult {
    const { type, emotion = "Calm", vibe = "Composed Presence", wpm = 144, clarity = 90, eyeContact = 92, posture = 88 } = params;

    const strengths: string[] = [];
    const observations: string[] = [];
    const actionTips: string[] = [];

    // Analyze Strengths
    if (eyeContact >= 85) {
      strengths.push("Direct, grounded gaze engagement without defensive shifting or blinking.");
    }
    if (clarity >= 85) {
      strengths.push("Clean vocal articulation; consonant definitions remained sharp through transitions.");
    }
    if (wpm >= 130 && wpm <= 155) {
      strengths.push(`Measured spoken cadence (${wpm} WPM) within the optimal professional threshold.`);
    }
    if (posture >= 80) {
      strengths.push("Symmetric upper torso alignment with relaxed shoulder posture.");
    }

    if (strengths.length === 0) {
      strengths.push("Calm willingness to reflect and calibrate personal communication habits.");
    }

    // Observations
    observations.push(`Dominant communicative state detected as "${emotion}" with an overall "${vibe}".`);
    if (wpm > 155) {
      observations.push(`Pacing reached ${wpm} WPM in moments of high information density.`);
    } else if (wpm < 125) {
      observations.push(`Deliberate, slow cadence (${wpm} WPM) with extended intervals between phrases.`);
    } else {
      observations.push(`Rhythmic pacing (${wpm} WPM) supported audience comprehension.`);
    }

    // Actionable 3 Practical Tips
    if (type === "presentation") {
      actionTips.push("Anchor transitions with a 2-second diaphragmatic pause to let pivotal data settle.");
      actionTips.push("Consciously broaden gestures to the frame boundaries when outlining strategic scale.");
      actionTips.push("Conclude key points with descending vocal pitch inflection for grounded authority.");
    } else if (type === "interview") {
      actionTips.push("Structure answers using Situation-Context-Impact to keep responses concise under 90s.");
      actionTips.push("Hold warm gaze contact for 3 full seconds at the start of each answer.");
      actionTips.push("Take a silent breath before answering rather than using vocal fillers like 'Um' or 'Basically'.");
    } else if (type === "voice") {
      actionTips.push("Engage low diaphragmatic support before beginning extended sentences.");
      actionTips.push("Vary pitch emphasis on verbs to bring natural melodic vitality to key assertions.");
      actionTips.push("Hydrate 10 minutes prior to speaking to prevent subtle vocal fry or dryness.");
    } else if (type === "body") {
      actionTips.push("Position your camera at exact eye level to preserve natural head-tilt angle.");
      actionTips.push("Keep shoulders gently depressed away from ears to release upper cervical tension.");
      actionTips.push("Rest hands open in the lower third of frame to convey openness and receptive attentiveness.");
    } else {
      // fusion & image
      actionTips.push("Align vocal warmth with facial micro-expressions to maximize perceived authenticity.");
      actionTips.push("Observe whether your physical posture matches the assertive tone in your voice.");
      actionTips.push("Schedule a quiet 60-second breathing calibration before major collaborative meetings.");
    }

    return {
      strengths,
      observations,
      actionTips: actionTips.slice(0, 3),
      contextualNote: "Observations are computed from geometric facial mesh and acoustic waveform patterns. Not a medical or psychological diagnosis.",
    };
  }
}
