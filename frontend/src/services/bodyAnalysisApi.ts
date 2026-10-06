/**
 * VibeLens Body Language Analysis API Client
 */

export interface NormalizedPoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface BodyAnalysisResponse {
  id: string;
  analysisId?: string;
  title: string;
  timestamp: string;
  sourceType: "camera" | "upload" | "sample";
  captureMode: "portrait" | "upper_body" | "full_body";
  imageUrl?: string;
  posture: {
    state: string;
    score: number;
    alignment: string;
    shoulderTiltDeg: number;
    torsoVerticality: string;
    openness: string;
    observations: string[];
  };
  gaze: {
    direction: "Centered" | "Forward" | "Left" | "Right" | "Down" | "Uncertain";
    score: number;
    quality: "Good" | "Fair" | "Limited";
    contactStability: string;
    observations: string[];
  };
  gestures: {
    activity: "Minimal" | "Moderate" | "Active" | "Dynamic";
    openness: "Open" | "Neutral" | "Constrained";
    spanRating: string;
    frequency: string;
  };
  engagement: {
    level: "High" | "Moderate" | "Reserved";
    score: number;
    presenceDescriptor: string;
  };
  movementStability: {
    stability: "High" | "Moderate" | "Unsteady";
    score: number;
    jitterRating: string;
  };
  confidence: number;
  signalQuality: {
    rating: "Good" | "Fair" | "Poor";
    score: number;
    cameraQuality: "Optimal" | "Subtle" | "Low";
    personVisibility: "High" | "Moderate" | "Low";
    framing: string;
    lighting: string;
    resolution: string;
  };
  evidence: {
    observedSignals: string[];
    aiInterpretation: string;
    confidenceRationale: string;
    whyThisResult: string;
    keyPoints: { label: string; value: string; status: "optimal" | "acceptable" | "attention" }[];
  };
  observations: string[];
  coach: {
    whatWentWell: string[];
    whatToImprove: string[];
    nextPractice: string[];
    presentationPresence: string;
  };
  isDemo: boolean;
}

export interface BodyHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  imageUrl?: string;
  sourceType: string;
  captureMode: string;
  postureSignal: string;
  postureScore: number;
  gazeSignal: string;
  gazeScore: number;
  gestureSignal: string;
  movementStability: string;
  confidence: number;
  signalQualityScore: number;
  signalQuality: string;
  isDemo: boolean;
}

const API_BASE = "/api";

export const bodyAnalysisApi = {
  /**
   * Run real body language analysis on captured portrait image Blob or uploaded File
   */
  async analyzeBody(
    imageBlobOrFile: Blob | File,
    options?: {
      landmarks?: NormalizedPoseLandmark[];
      captureMode?: "portrait" | "upper_body" | "full_body";
      sourceType?: "camera" | "upload" | "sample";
      width?: number;
      height?: number;
      qualityHint?: any;
      isDemo?: boolean;
    }
  ): Promise<BodyAnalysisResponse> {
    const formData = new FormData();
    const fileName =
      imageBlobOrFile instanceof File
        ? imageBlobOrFile.name
        : `portrait_${new Date().toISOString().slice(11, 19).replace(/:/g, "-")}.jpg`;

    formData.append("image", imageBlobOrFile, fileName);

    if (options?.landmarks && options.landmarks.length > 0) {
      formData.append("landmarks", JSON.stringify(options.landmarks));
    }
    if (options?.captureMode) formData.append("captureMode", options.captureMode);
    if (options?.sourceType) formData.append("sourceType", options.sourceType);
    if (options?.width) formData.append("width", String(options.width));
    if (options?.height) formData.append("height", String(options.height));
    if (options?.qualityHint) formData.append("qualityHint", JSON.stringify(options.qualityHint));
    if (options?.isDemo) formData.append("isDemo", "true");

    const res = await fetch(`${API_BASE}/analyze/body`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to analyze body language.");
    }
    return data.data;
  },

  /**
   * Upload body image standalone
   */
  async uploadBodyImage(file: File): Promise<{ imageUrl: string; fileName: string; fileSize: number }> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE}/analyze/body`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to upload image.");
    }
    return {
      imageUrl: data.data.imageUrl,
      fileName: file.name,
      fileSize: file.size,
    };
  },

  /**
   * Retrieve historical body analyses
   */
  async getBodyAnalyses(): Promise<BodyHistoryItem[]> {
    const res = await fetch(`${API_BASE}/analyze/body/history`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to retrieve history.");
    }
    return data.data || [];
  },

  /**
   * Retrieve specific analysis record
   */
  async getBodyAnalysisById(id: string): Promise<BodyAnalysisResponse> {
    const res = await fetch(`${API_BASE}/analyze/body/${id}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to load analysis details.");
    }
    return data.data;
  },

  /**
   * Permanently delete body analysis
   */
  async deleteBodyAnalysis(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/analyze/body/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to delete body analysis.");
    }
  },

  /**
   * Load studio demo sample
   */
  async getStudioSample(): Promise<BodyAnalysisResponse> {
    const res = await fetch(`${API_BASE}/analyze/body/sample`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to load studio sample.");
    }
    return data.data;
  },
};
