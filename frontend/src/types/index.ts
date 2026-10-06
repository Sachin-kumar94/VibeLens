export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  theme: "light" | "dark";
  preferences: {
    language: string;
    demoMode: boolean;
    autoCalibrate: boolean;
    autoSave: boolean;
    privateMode: boolean;
  };
  baseline: {
    confidence: number;
    speechPaceWpm: number;
    postureAlignment: number;
    vocalEnergy: number;
  };
  createdAt: string;
}

export type AnalysisType = "image" | "voice" | "body" | "fusion" | "session";
export type QualityRating = "Good" | "Fair" | "Poor";

export interface QualityEvaluation {
  rating: QualityRating;
  resolution?: string;
  lighting?: "Optimal" | "Subtle" | "Low";
  faceVisibility?: "High" | "Partial" | "Occluded";
  framing?: "Ideal" | "Close" | "Wide";
  noiseLevel?: "Low" | "Moderate" | "High";
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  type: AnalysisType;
  title: string;
  timestamp: string;
  inputUrl?: string;
  fileName?: string;
  isDemo?: boolean;

  // Emotion & Vibe
  primaryEmotion: string;
  confidenceScore: number;
  emotions: Record<string, number>;
  overallVibe: string;
  vibeConfidence: number;

  // Quality & Evidence
  quality: QualityEvaluation;
  evidence: {
    observedCues: string[];
    aiInterpretation: string;
    whyThisResult: string;
  };

  // Image Specifics
  sceneType?: string;
  objectsDetected?: string[];
  colorTone?: string;
  colors?: string[];
  colorInterpretation?: string;
  captions?: { style: string; text: string }[];
  hashtags?: string[];
  musicRecommendations?: {
    title: string;
    artist: string;
    genre: string;
    vibe: string;
    spotifyUrl?: string;
  }[];

  // Recommendations
  recommendations: string[];
  notes?: string;
}

export interface VoiceAnalysis {
  id: string;
  userId?: string;
  timestamp: string;
  audioUrl?: string;
  durationSeconds: number;
  pitch: "high" | "medium" | "low";
  pitchHz: number;
  tone: "positive" | "negative" | "neutral" | "friendly" | "calm";
  energy: "low" | "medium" | "high";
  speechIntensity: number; // dB
  loudness: number; // LUFS
  vocalEnergy: number; // 0-100 score
  speech_speed: "slow" | "normal" | "fast";
  wordsPerMinute: number;
  pauseFrequency: number;
  speakingSpeed: string;
  emotion: string;
  confidence: number;
  emotions: Record<string, number>;
  signalQuality: QualityRating;
  clarity: number;
  aiInterpretation: string;
  isDemo?: boolean;
}

export interface BodyAnalysis {
  id: string;
  userId?: string;
  timestamp: string;
  imageUrl?: string;
  eye_contact_score: number;
  eye_state: "Direct eye contact" | "Looking away" | "Looking down" | "Looking left" | "Looking right";
  focus_score: number;
  posture_score: number;
  posture_state: "Straight posture" | "Slouching posture" | "Leaning posture" | "Sitting posture" | "Standing posture";
  posture_angle: number; // e.g. 88 degrees
  gesture_score: number;
  gesture_state: "Open hand gestures" | "Closed hand gestures" | "Excessive movement" | "Minimal movement";
  engagement_score: number;
  communication_effectiveness: number;
  attention_score: number;
  body_state: "Confident" | "Nervous" | "Engaged" | "Relaxed" | "Stressed";
  strengths: string[];
  suggestions: string[];
  signalQuality: QualityRating;
  isDemo?: boolean;
}

export interface FusionAnalysis {
  id: string;
  userId?: string;
  timestamp: string;
  face_emotion: string;
  face_confidence: number;
  voice_emotion: string;
  voice_confidence: number;
  body_state: string;
  body_confidence: number;
  overall_vibe: string;
  confidence: number;
  consistency_score: number; // e.g. 91%
  consistency_state: "Strong alignment" | "Moderate alignment" | "Mixed signals";
  explanation: string;
  observedSignals: {
    visual: string;
    acoustic: string;
    kinesic: string;
    context: string;
  };
  vibeSpectrum: {
    calm: number;
    energy: number;
    confidence: number;
    warmth: number;
    focus: number;
    engagement: number;
  };
  isDemo?: boolean;
}

export interface JournalEntry {
  id: string;
  userId?: string;
  date: string;
  time: string;
  photoUrl?: string;
  emotion: string;
  vibe: string;
  context: string;
  note: string;
  confidenceScore: number;
  signals: string[];
  createdAt: string;
}

export interface SessionReport {
  sessionId: string;
  mode: "presentation" | "interview" | "general";
  durationSeconds: number;
  overallVibe: string;
  confidenceScore: number;
  consistencyScore: number;
  metrics: {
    eyeContact: number;
    postureAlignment: number;
    speechPaceWpm: number;
    vocalEnergy: number;
    clarity: number;
    stressSignals: "Low" | "Moderate" | "Elevated";
  };
  strengths: string[];
  improvements: string[];
  beforeAfterDelta?: {
    confidence: { before: number; after: number; change: string };
    eyeContact: { before: number; after: number; change: string };
    pacing: { before: number; after: number; change: string };
    posture: { before: number; after: number; change: string };
  };
  completedAt: string;
}

export interface AnalyticsSummary {
  totalAnalyses: number;
  averageConfidence: number;
  topEmotion: string;
  topVibe: string;
  baselineVsCurrent: {
    baselineConfidence: number;
    currentConfidence: number;
    delta: number;
    baselinePace: number;
    currentPace: number;
    paceDelta: number;
  };
  moodTimeline: {
    day: string;
    emotion: string;
    vibe: string;
    confidence: number;
  }[];
  weeklyTrends: {
    date: string;
    Happy: number;
    Calm: number;
    Focused: number;
    Confident: number;
  }[];
}
