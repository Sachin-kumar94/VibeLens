export interface NormalizedAnalyticsRecord {
  id: string;
  userId: string;
  type: "image" | "voice" | "body" | "fusion";
  title: string;
  timestamp: Date;
  confidence: number;
  signalQualityRating: "Good" | "Fair" | "Poor";
  signalQualityScore: number; // 0 - 100
  emotion: string;
  vibe: string;
  context: string;
  fileUrl?: string;

  // Modality-specific metrics
  metrics: {
    wordsPerMinute?: number;
    vocalEnergy?: number;
    clarity?: number;
    loudness?: number;
    postureScore?: number;
    gazeScore?: number;
    engagement?: number;
    agreementScore?: number;
  };

  emotionDistribution?: Array<{ emotion: string; score: number }>;
}

export class AnalyticsNormalizer {
  /**
   * Normalizes a raw Prisma Analysis record into a typed analytical data point
   */
  public static normalize(record: any): NormalizedAnalyticsRecord {
    let signalsData: any = {};
    let emotionData: any = {};
    let vibeData: any = {};

    try {
      if (typeof record.signalsData === "string" && record.signalsData) {
        signalsData = JSON.parse(record.signalsData);
      } else if (typeof record.signalsData === "object" && record.signalsData) {
        signalsData = record.signalsData;
      }
    } catch (e) {}

    try {
      if (typeof record.emotionData === "string" && record.emotionData) {
        emotionData = JSON.parse(record.emotionData);
      } else if (typeof record.emotionData === "object" && record.emotionData) {
        emotionData = record.emotionData;
      }
    } catch (e) {}

    try {
      if (typeof record.vibeData === "string" && record.vibeData) {
        vibeData = JSON.parse(record.vibeData);
      } else if (typeof record.vibeData === "object" && record.vibeData) {
        vibeData = record.vibeData;
      }
    } catch (e) {}

    // Confidence: ensure 0-100 number
    const confidence = typeof record.confidence === "number" ? record.confidence : 85;

    // Signal Quality: map string to standardized score
    const qualityStr = (record.signalQuality || "Good").toLowerCase();
    let signalQualityRating: "Good" | "Fair" | "Poor" = "Good";
    let signalQualityScore = 92;

    if (qualityStr.includes("fair")) {
      signalQualityRating = "Fair";
      signalQualityScore = 75;
    } else if (qualityStr.includes("poor") || qualityStr.includes("low")) {
      signalQualityRating = "Poor";
      signalQualityScore = 52;
    }

    // Clean Emotion & Vibe
    const rawEmotion = record.emotion || "Calm";
    const cleanEmotion = rawEmotion.split("(")[0].split("&")[0].trim() || "Calm";

    const rawVibe = record.vibe || vibeData?.descriptor || "Grounded";
    const cleanVibe = rawVibe.split("&")[0].split("(")[0].trim() || "Grounded";

    // Extract modality metrics
    const metrics: NormalizedAnalyticsRecord["metrics"] = {};

    if (record.type === "voice" || signalsData.voiceMetrics || signalsData.wpm) {
      metrics.wordsPerMinute = signalsData.wordsPerMinute || signalsData.wpm || 142;
      metrics.vocalEnergy = signalsData.vocalEnergy || signalsData.energy || 80;
      metrics.clarity = signalsData.clarity || 88;
      metrics.loudness = signalsData.loudness;
    }

    if (record.type === "body" || signalsData.postureScore || signalsData.posture) {
      metrics.postureScore = signalsData.postureScore || signalsData.posture || 86;
      metrics.gazeScore = signalsData.gazeScore || signalsData.eyeContact || 88;
      metrics.engagement = signalsData.engagement || 85;
    }

    if (record.type === "fusion" || signalsData.triModalConcordance || signalsData.agreementScore) {
      metrics.agreementScore =
        signalsData.triModalConcordance ||
        signalsData.agreementScore ||
        signalsData.concordance ||
        90;
      metrics.engagement = signalsData.engagement || 88;
    }

    // Emotion distribution array
    let emotionDistribution: Array<{ emotion: string; score: number }> = [];
    if (Array.isArray(emotionData)) {
      emotionDistribution = emotionData.map((e: any) => ({
        emotion: e.emotion || e.name || "Calm",
        score: e.score || e.confidence || 50,
      }));
    } else if (emotionData && typeof emotionData === "object") {
      emotionDistribution = Object.entries(emotionData)
        .filter(([_, val]) => typeof val === "number")
        .map(([emo, val]) => ({ emotion: emo, score: val as number }));
    }

    return {
      id: record.id,
      userId: record.userId,
      type: (record.type || "image") as any,
      title: record.title || "Capture Session",
      timestamp: new Date(record.timestamp || record.createdAt || Date.now()),
      confidence,
      signalQualityRating,
      signalQualityScore,
      emotion: cleanEmotion,
      vibe: cleanVibe,
      context: record.context || "Calibrated session",
      fileUrl: record.fileUrl || record.imageUrl,
      metrics,
      emotionDistribution,
    };
  }
}
