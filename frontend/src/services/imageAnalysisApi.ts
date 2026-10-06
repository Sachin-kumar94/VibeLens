const API_BASE = "/api";

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

export interface ImageAnalysisData {
  id: string;
  analysisId: string;
  title: string;
  type: "image";
  fileUrl: string;
  fileName: string;
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

  // Quality & AI confidence
  signalQuality: "Good" | "Fair" | "Poor";
  signalQualityScore: number;
  signalQualityReasons: string[];
  aiConfidence: number;

  insights: string[];
  recommendations: string[];

  isDemo: boolean;
  savedAt?: string;
}

export interface CaptionOption {
  id: string;
  platform: string;
  tone: string;
  text: string;
  characterCount: number;
}

export interface HashtagGroup {
  category: string;
  tags: string[];
}

export interface MusicRecommendation {
  mood: string;
  genre: string;
  energy: string;
  tempo: string;
  keyCharacteristics: string[];
  suggestedStyleTracks: Array<{
    title: string;
    artist: string;
    aestheticMatch: string;
  }>;
  listeningNote: string;
}

class ImageAnalysisApiService {
  /**
   * Uploads and executes real AI image analysis
   */
  public async analyzeImage(
    file?: File | Blob,
    options?: { isDemo?: boolean; contextHint?: string }
  ): Promise<ImageAnalysisData> {
    const formData = new FormData();
    if (file) {
      const fileName = file instanceof File ? file.name : "camera-capture.jpg";
      formData.append("image", file, fileName);
    }
    if (options?.isDemo) {
      formData.append("isDemo", "true");
    }
    if (options?.contextHint) {
      formData.append("contextHint", options.contextHint);
    }

    const response = await fetch(`${API_BASE}/analyze/image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(
        json.error || json.reason || "Failed to analyze visual signals."
      );
    }

    return json.data as ImageAnalysisData;
  }

  /**
   * Retrieves an existing analysis by ID
   */
  public async getAnalysis(id: string): Promise<ImageAnalysisData> {
    const response = await fetch(`${API_BASE}/analyses/${id}`, {
      method: "GET",
      credentials: "include",
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.error || "Analysis record could not be loaded.");
    }

    return json.data as ImageAnalysisData;
  }

  /**
   * Deletes an analysis record
   */
  public async deleteAnalysis(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/analyses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.error || "Failed to delete analysis.");
    }

    return json;
  }

  /**
   * Generates platform-specific caption suggestions
   */
  public async generateCaptions(payload: {
    analysisId?: string;
    emotion?: string;
    vibe?: string;
    scene?: string;
    platform?: "Instagram" | "LinkedIn" | "Story" | "Professional" | "Creative";
    tone?: "Natural" | "Inspiring" | "Professional" | "Minimal" | "Playful";
  }): Promise<{ captions: CaptionOption[]; platform: string; tone: string }> {
    const response = await fetch(`${API_BASE}/content/captions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.error || "Failed to generate captions.");
    }

    return json;
  }

  /**
   * Generates relevant hashtags based on image context
   */
  public async generateHashtags(payload: {
    analysisId?: string;
    emotion?: string;
    vibe?: string;
    scene?: string;
  }): Promise<{
    groups: HashtagGroup[];
    flatList: string[];
    copyAllString: string;
  }> {
    const response = await fetch(`${API_BASE}/content/hashtags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.error || "Failed to generate hashtags.");
    }

    return json;
  }

  /**
   * Suggests acoustic accompaniment mood & tracks
   */
  public async suggestMusic(payload: {
    analysisId?: string;
    emotion?: string;
    vibe?: string;
    scene?: string;
  }): Promise<{ recommendation: MusicRecommendation; disclaimer: string }> {
    const response = await fetch(`${API_BASE}/content/music`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.error || "Failed to generate music suggestions.");
    }

    return json;
  }

  /**
   * Translates a caption into the requested language
   */
  public async translateCaption(payload: {
    text: string;
    targetLanguage: string;
  }): Promise<{ originalText: string; targetLanguage: string; translatedText: string }> {
    const response = await fetch(`${API_BASE}/content/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.error || "Failed to translate caption.");
    }

    return json;
  }
}

export const imageAnalysisApi = new ImageAnalysisApiService();
