export interface VoiceAnalysisData {
  id?: string;
  title: string;
  type: "voice";
  fileUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration: number;
  timestamp: string;

  primaryEmotion: string;
  primaryEmotionConfidence: number;
  emotionSubtitle: string;
  emotionDistribution: {
    emotion: string;
    score: number;
    label?: string;
  }[];

  tone: string;
  toneDescriptors: string[];
  energy: "Low" | "Medium" | "High";
  energyScore: number;

  pitch: "Low" | "Medium" | "High";
  pitchHz: number;
  pitchVariation: "Low" | "Moderate" | "High";

  speakingRate: "Slow" | "Moderate" | "Fast";
  wordsPerMinute: number;
  pauseFrequency: number;
  speechIntensity: "Low" | "Moderate" | "High";
  speechIntensityDb: number;
  loudness: string;
  loudnessDb: number;
  vocalEnergy: number;
  clarity: number;
  clarityRating: "Low" | "Moderate" | "High";

  signalQuality: "Good" | "Fair" | "Poor";
  signalQualityScore: number;
  signalQualityReasons: string[];
  qualityDetails: {
    volume: "Low" | "Good" | "High";
    noise: "Low" | "Moderate" | "High";
    clarity: "Good" | "Fair" | "Poor";
    durationSec: number;
    speechPresence: "Detected" | "Marginal" | "Insufficient";
  };
  qualityNotes: string;

  confidence: number;
  evidence: {
    observedSignals: string[];
    aiInterpretation: string;
    confidenceRationale: string;
    whyThisResult: string;
  };

  timeline: {
    timestamp: string;
    seconds: number;
    emotion: string;
    tone: string;
    note: string;
  }[];

  speechSegments: {
    segment: number;
    timeRange: string;
    startSec: number;
    endSec: number;
    emotion: string;
    energy: "Low" | "Medium" | "High";
    paceWpm: number;
    note: string;
  }[];

  transcript?: {
    fullText: string;
    sentences: {
      start: string;
      seconds: number;
      text: string;
      signal: string;
    }[];
  };

  fillerWords: {
    count: number;
    ratePerMinute: number;
    words: { word: string; count: number }[];
  };

  coach: {
    whatWentWell: string[];
    whatToImprove: string[];
    recommendations: string[];
    presentationAdvice: string;
    interviewAdvice: string;
  };

  isDemo: boolean;
  provider: "Gemini" | "AcousticEngine" | "Demo";
}

export interface UserVocalBaseline {
  hasBaseline: boolean;
  totalSessions: number;
  averagePaceWpm: number;
  averageConfidence: number;
  averageVocalEnergy: number;
  averageClarity: number;
}

const API_BASE = "/api";

export const voiceAnalysisApi = {
  /**
   * Upload voice file to server storage
   */
  async uploadVoice(
    audioBlobOrFile: Blob | File,
    fileName?: string
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number; mimeType: string }> {
    const formData = new FormData();
    const name = fileName || (audioBlobOrFile instanceof File ? audioBlobOrFile.name : "voice_sample.webm");
    formData.append("audio", audioBlobOrFile, name);

    const res = await fetch(`${API_BASE}/analyze/voice/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      // Fallback: return client local information if standalone upload endpoint is optional
      return {
        fileUrl: URL.createObjectURL(audioBlobOrFile),
        fileName: name,
        fileSize: audioBlobOrFile.size,
        mimeType: audioBlobOrFile.type || "audio/webm",
      };
    }
    return data.data;
  },

  /**
   * Analyze recorded audio Blob or uploaded audio File
   */
  async analyzeVoice(
    audioBlobOrFile: Blob | File,
    options?: {
      fileName?: string;
      duration?: number;
      speechText?: string;
      qualityHint?: any;
      isDemo?: boolean;
    }
  ): Promise<VoiceAnalysisData> {
    const formData = new FormData();
    const fileName = options?.fileName || (audioBlobOrFile instanceof File ? audioBlobOrFile.name : "recording.webm");
    
    formData.append("audio", audioBlobOrFile, fileName);
    if (options?.duration) formData.append("duration", String(options.duration));
    if (options?.speechText) formData.append("speechText", options.speechText);
    if (options?.qualityHint) formData.append("qualityHint", JSON.stringify(options.qualityHint));
    if (options?.isDemo) formData.append("isDemo", "true");

    const res = await fetch(`${API_BASE}/analyze/voice`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || data?.details || "Failed to analyze voice recording.");
    }

    return data.data;
  },

  /**
   * Run demo analysis without local microphone
   */
  async runDemoAnalysis(): Promise<VoiceAnalysisData> {
    const formData = new FormData();
    formData.append("isDemo", "true");

    const res = await fetch(`${API_BASE}/analyze/voice`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to generate demo voice analysis.");
    }

    return data.data;
  },

  /**
   * Retrieve specific voice analysis by ID
   */
  async getVoiceAnalysis(id: string): Promise<VoiceAnalysisData> {
    const res = await fetch(`${API_BASE}/analyze/voice/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Voice analysis not found.");
    }
    return data.data;
  },

  /**
   * Delete voice analysis by ID
   */
  async deleteVoiceAnalysis(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/analyze/voice/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to delete voice analysis.");
    }
  },

  /**
   * Retrieve user's personal vocal baseline
   */
  async getVoiceBaseline(): Promise<UserVocalBaseline> {
    try {
      const res = await fetch(`${API_BASE}/analyze/voice/baseline`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch user vocal baseline:", e);
    }
    return {
      hasBaseline: false,
      totalSessions: 0,
      averagePaceWpm: 138,
      averageConfidence: 85,
      averageVocalEnergy: 78,
      averageClarity: 90,
    };
  },

  /**
   * Retrieve voice analysis history
   */
  async getVoiceHistory(limit = 20): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/analyze/voice/history?limit=${limit}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch voice history:", e);
    }
    return [];
  },
};
