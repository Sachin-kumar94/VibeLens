const API_BASE = "/api";

export interface AnalysisRecord {
  id: string;
  type: "image" | "voice" | "body" | "fusion";
  title: string;
  timestamp: string;
  inputUrl?: string;
  fileUrl?: string;
  inputText?: string;
  quality?: {
    rating: "Good" | "Fair" | "Poor";
    resolution?: string;
    lighting?: string;
    noiseLevel?: string;
    faceVisibility?: string;
    framing?: string;
  };
  signals?: Record<string, any>;
  emotion?: {
    primary: string;
    confidence: number;
    secondary?: string;
    valence?: number;
    arousal?: number;
  };
  vibe?: {
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
  insights?: string[];
  recommendations?: string[];
  explanation?: {
    observedSignals: string[];
    aiInterpretation: string;
    confidenceRationale: string;
    whyThisResult: string;
  };
  isDemo?: boolean;
  notes?: string;
  confidence?: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  vibe: string;
  emotion: string;
  confidence: number;
  context: string;
  userNote: string;
  signalsObserved: string[];
  thumbnailUrl?: string;
  sourceMode: string;
  analysisId?: string;
}

export interface AnalyticsSummary {
  totalAnalyses: number;
  averageConfidence: number;
  topEmotion: string;
  topVibe: string;
  distribution: {
    image: number;
    voice: number;
    body: number;
    fusion: number;
  };
  baselineVsCurrent: {
    baselineConfidence: number;
    currentConfidence: number;
    delta: number;
  };
  emotionTrends: Array<{
    index: number;
    date: string;
    title: string;
    calm: number;
    happy: number;
    focused: number;
    neutral: number;
    serious: number;
  }>;
  dynamicInsights: Array<{
    id: string;
    title: string;
    description: string;
    confidence?: number;
    changePercent: number;
    metric: string;
  }>;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface SearchResult {
  analyses: any[];
  voices: any[];
  journal: any[];
  sessions: any[];
  total: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = json.error?.message || json.error || json.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  // Handle both { success: true, data: T } and direct T formats
  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  // Multimodal Analysis
  async analyzeImage(payload: { imageUrl?: string; contextHint?: string; qualityHint?: any }): Promise<any> {
    return request("/analyze/image", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async analyzeVoice(payload: { audioUrl?: string; speechText?: string; durationSeconds?: number; qualityHint?: any }): Promise<any> {
    return request("/analyze/voice", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async analyzeBody(payload: { videoUrl?: string; posePoints?: any; cameraFacing?: string; qualityHint?: any; imageUrl?: string }): Promise<any> {
    return request("/analyze/body", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async analyzeFusion(payload: {
    image?: any;
    voice?: any;
    body?: any;
    context?: string;
    contextText?: string;
    imageAnalysisId?: string;
    voiceAnalysisId?: string;
    bodyAnalysisId?: string;
  }): Promise<any> {
    return request("/analyze/fusion", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getFusionHistory(): Promise<any[]> {
    return request("/analyze/fusion/history");
  },

  async getFusionById(id: string): Promise<any> {
    return request(`/analyze/fusion/${id}`);
  },

  async deleteFusion(id: string): Promise<{ success: boolean; deletedId: string }> {
    return request(`/analyze/fusion/${id}`, { method: "DELETE" });
  },

  async addFusionToJournal(id: string, userNote?: string): Promise<any> {
    return request(`/analyze/fusion/${id}/journal`, {
      method: "POST",
      body: JSON.stringify({ userNote }),
    });
  },

  // History / Archive
  async getAnalyses(type?: string): Promise<any[]> {
    const url = type && type !== "all" ? `/analyses/all?type=${type}` : `/analyses/all`;
    return request(url);
  },

  async getAnalysisById(id: string): Promise<any> {
    return request(`/analyses/${id}`);
  },

  async deleteAnalysis(id: string): Promise<{ success: boolean; deletedId: string }> {
    return request(`/analyses/${id}`, { method: "DELETE" });
  },

  // Analytics & Journal
  async getAnalytics(): Promise<AnalyticsSummary> {
    return request("/analytics");
  },

  async getJournal(): Promise<JournalEntry[]> {
    return request("/journal");
  },

  async createJournalEntry(payload: Partial<JournalEntry>): Promise<JournalEntry> {
    return request("/journal", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateJournalEntry(id: string, payload: Partial<JournalEntry>): Promise<JournalEntry> {
    return request(`/journal/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteJournalEntry(id: string): Promise<{ success: boolean; deletedId: string }> {
    return request(`/journal/${id}`, { method: "DELETE" });
  },

  // Profile
  async getProfile(): Promise<any> {
    return request("/profile");
  },

  async updateProfile(updates: any): Promise<any> {
    return request("/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Session & Coaching
  async startSession(mode: string = "presentation"): Promise<any> {
    return request("/session/start", {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
  },

  async completeSession(sessionId: string, signals: any = {}): Promise<any> {
    return request("/session/complete", {
      method: "POST",
      body: JSON.stringify({ sessionId, signals, duration: signals.duration }),
    });
  },

  async getSessionHistory(): Promise<any[]> {
    return request("/session/history");
  },

  // Reports
  async getWeeklyReport(): Promise<any> {
    return request("/reports/weekly");
  },

  async getMonthlyReport(): Promise<any> {
    return request("/reports/monthly");
  },

  // Privacy & Data Sovereignty
  async getPrivacyAudit(): Promise<any> {
    const res = await request<any>("/privacy/audit");
    return res.audit || res;
  },

  async exportUserData(): Promise<void> {
    window.location.href = `${API_BASE}/privacy/export`;
  },

  async eraseAllData(): Promise<any> {
    return request("/privacy/erase", { method: "DELETE" });
  },

  // Search & Notifications
  async search(query: string): Promise<SearchResult> {
    return request(`/search?q=${encodeURIComponent(query)}`);
  },

  async getNotifications(): Promise<{ notifications: UserNotification[]; unreadCount: number }> {
    const res = await fetch(`${API_BASE}/notifications`, { credentials: "include" });
    const json = await res.json();
    return {
      notifications: json.data || [],
      unreadCount: json.unreadCount || 0,
    };
  },

  async markNotificationRead(id: string): Promise<any> {
    return request(`/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAllNotificationsRead(): Promise<any> {
    return request("/notifications/mark-all-read", { method: "POST" });
  },
};
