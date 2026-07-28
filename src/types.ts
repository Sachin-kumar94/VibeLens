export interface User {
  id: string;
  email: string;
  name: string;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface EmotionDetail {
  emotion: string;
  confidence: number;
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  imageUrl?: string;
  fileName?: string;
  timestamp: string;
  
  // 1. Emotion Detection
  primaryEmotion: string;
  confidenceScore: number;
  emotions: Record<string, number>; // e.g. { Happy: 0.85, Neutral: 0.1, ... }
  facesDetectedCount: number;
  
  // 2. Scene Recognition
  sceneType: string; // e.g. "Sunset", "Beach", "Office"
  sceneConfidence: number;
  objectsDetected: string[];
  
  // 3. Color Psychology Analysis
  colorTone: string; // "Warm Tone", "Cold Tone", "Bright Tone", "Dark Tone", "Neutral Tone"
  colors: string[]; // hex codes e.g. ["#ff5733", "#2c3e50"]
  colorInterpretation: string; // Emotional description based on colors
  
  // 4. Vibe Classification
  overallVibe: string; // "Calm", "Energetic", "Aesthetic", "Cozy", "Dramatic" etc.
  vibeConfidence: number;
  
  // 5. AI Caption Generator
  captions: {
    style: string; // "Instagram", "LinkedIn", "Story", "Professional", "Creative"
    text: string;
  }[];
  
  // 6. Hashtag Generator
  hashtags: string[];
  
  // 7. Music Recommendations
  musicRecommendations: {
    title: string;
    artist: string;
    genre: string;
    vibe: string;
    spotifyUrl?: string;
  }[];
}

export interface MoodTrendPoint {
  date: string;
  Happy: number;
  Neutral: number;
  Sad: number;
  Energetic: number;
  Calm: number;
}

export interface AnalyticsSummary {
  totalAnalyses: number;
  emotionDistribution: { name: string; count: number; color: string }[];
  vibeDistribution: { name: string; count: number; color: string }[];
  weeklyTrends: MoodTrendPoint[];
}

export interface VoiceAnalysis {
  id: string;
  userId: string;
  pitch: "high" | "medium" | "low";
  pitchHz: number;
  tone: "positive" | "negative" | "neutral" | "aggressive" | "friendly";
  energy: "low" | "medium" | "high";
  speechIntensity: number; // dB
  loudness: number; // LUFS or raw ratio
  vocalEnergy: number; // 0-100 score
  speech_speed: "slow" | "normal" | "fast";
  wordsPerMinute: number;
  pauseFrequency: number;
  speakingSpeed: string;
  emotion: "Happy" | "Sad" | "Angry" | "Fear" | "Excited" | "Calm" | "Nervous" | "Neutral" | "Stressed";
  confidence: number;
  emotions: Record<string, number>;
  createdAt: string;
}

export interface BodyAnalysis {
  id: string;
  userId: string;
  eye_contact_score: number;
  eye_state: "Direct eye contact" | "Looking away" | "Looking down" | "Looking left" | "Looking right";
  focus_score: number;
  posture_score: number;
  posture_state: "Straight posture" | "Slouching posture" | "Leaning posture" | "Standing posture" | "Sitting posture";
  posture_confidence: number;
  gesture_score: number;
  gesture_state: "Open hand gestures" | "Closed hand gestures" | "Excessive movement" | "Minimal movement" | "Pointing gestures";
  engagement_score: number;
  communication_effectiveness: number;
  attention_score: number;
  attention_state: "Focused" | "Distracted" | "Fatigued" | "Highly attentive";
  attention_percentage: number;
  concentration_score: number;
  body_state: "Confident" | "Nervous" | "Engaged" | "Distracted" | "Fatigued" | "Relaxed" | "Stressed";
  createdAt: string;
}

export interface FusionAnalysis {
  id: string;
  userId: string;
  face_emotion: string;
  face_confidence: number;
  voice_emotion: string;
  voice_confidence: number;
  body_state: string;
  body_confidence: number;
  scene_type: string;
  color_tone: string;
  overall_vibe: string;
  ei_score: number;
  confidence: number;
  explanation: string;
  createdAt: string;
}

