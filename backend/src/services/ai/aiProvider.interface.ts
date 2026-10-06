export interface SignalQualityInput {
  resolution?: string;
  lighting?: "Optimal" | "Subtle" | "Low";
  noiseLevel?: "Low" | "Moderate" | "High";
  faceVisibility?: "High" | "Partial" | "Occluded";
  framing?: "Ideal" | "Close" | "Wide";
}

export interface ImageAnalysisRequest {
  imagePath?: string;
  imageUrl?: string;
  imageBuffer?: Buffer;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  contextHint?: string;
  qualityHint?: SignalQualityInput;
  isDemo?: boolean;
}

export interface VoiceAnalysisRequest {
  audioUrl?: string;
  audioBuffer?: Buffer;
  speechText?: string;
  durationSeconds?: number;
  qualityHint?: SignalQualityInput;
}

export interface BodyAnalysisRequest {
  videoUrl?: string;
  posePoints?: number[][];
  cameraFacing?: "front" | "side";
  qualityHint?: SignalQualityInput;
}

export interface FusionAnalysisRequest {
  image?: ImageAnalysisRequest;
  voice?: VoiceAnalysisRequest;
  body?: BodyAnalysisRequest;
  contextText?: string;
}

export interface AnalysisResponsePayload {
  title: string;
  type: "image" | "voice" | "body" | "fusion";
  quality: {
    rating: "Good" | "Fair" | "Poor";
    resolution?: string;
    lighting?: "Optimal" | "Subtle" | "Low";
    noiseLevel?: "Low" | "Moderate" | "High";
    faceVisibility?: "High" | "Partial" | "Occluded";
    framing?: "Ideal" | "Close" | "Wide";
  };
  signals: Record<string, any>;
  emotion: {
    primary: string;
    confidence: number;
    secondary?: string;
    valence?: number;
    arousal?: number;
  };
  vibe: {
    descriptor: string;
    radialProfile: {
      calm: number;
      energy: number;
      confidence: number;
      warmth: number;
      focus: number;
      engagement: number;
    };
  };
  insights: string[];
  recommendations: string[];
  explanation: {
    observedSignals: string[];
    aiInterpretation: string;
    confidenceRationale: string;
    whyThisResult: string;
  };
  isDemo: boolean;
}

export interface DetectedObject {
  name: string;
  confidence: number;
}

export interface DetectedColor {
  name: string;
  hex: string;
}

export interface EmotionSignal {
  emotion: string;
  score: number;
  label?: string;
}

export interface NormalizedImageAnalysisResult {
  title: string;
  type: "image";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  timestamp: string;

  // Primary Emotion
  primaryEmotion: string;
  primaryEmotionConfidence: number;
  emotionExplanation: string;
  emotionDistribution: EmotionSignal[];

  // Scene
  scene: string;
  sceneConfidence: number;
  sceneContext: string[];

  // Objects
  objects: DetectedObject[];

  // Color Palette & Tone
  colorPalette: DetectedColor[];
  colorTone: string;

  // Vibe
  vibe: string;
  vibeConfidence: number;
  vibeRadialProfile: {
    calm: number;
    energy: number;
    confidence: number;
    warmth: number;
    focus: number;
    engagement: number;
  };

  // Evidence & Transparency
  evidence: {
    expression: string;
    visualContext: string;
    colorTone: string;
    composition: string;
    details?: string;
  };

  // Signal Quality vs AI Confidence
  signalQuality: "Good" | "Fair" | "Poor";
  signalQualityScore: number;
  signalQualityReasons: string[];
  aiConfidence: number;

  // Insights & Recommendations
  insights: string[];
  recommendations: string[];

  isDemo: boolean;
}

export interface IAIProvider {
  analyzeImage(req: ImageAnalysisRequest): Promise<NormalizedImageAnalysisResult>;
}
