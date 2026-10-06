/**
 * Presentation Coach Frontend API Service
 */

const API_BASE = "/api/presentation";

export interface PresentationIntegrityEventItem {
  id?: string;
  type: string;
  timestamp: number;
  duration?: number;
  source?: string;
  metadata?: string | Record<string, any> | null;
  createdAt?: string;
}

export interface PresentationSessionPayload {
  title?: string;
  context: string;
  targetDuration: number;
  targetPaceMin: number;
  targetPaceMax: number;
  duration: number;
  audioUrl?: string | null;
  audioStorageKey?: string | null;
  videoUrl?: string | null;
  videoStorageKey?: string | null;
  transcript?: string;
  pace: number;
  pauseCount: number;
  avgPauseDuration: number;
  longestPause?: number;
  fillerCount?: number;
  fillerRate?: number;
  cameraEngagement?: number;
  posture?: number;
  gestureActivity?: string;
  signalQuality: string;
  audioQuality?: string;
  videoQuality?: string;
  framingQuality?: string;
  topic?: string | null;
  userNotes?: string | null;
  feedbackMode?: "Minimal" | "Standard" | "Detailed";
  integrityEvents?: PresentationIntegrityEventItem[];
  isDemo?: boolean;
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

export interface CoachingEvaluation {
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

export interface SavedPresentationSession {
  id: string;
  userId: string;
  title: string;
  context: string;
  targetDuration: number;
  targetPaceMin: number;
  targetPaceMax: number;
  duration: number;
  audioUrl?: string | null;
  videoUrl?: string | null;
  transcript?: string;
  pace: number;
  pauseCount: number;
  avgPauseDuration: number;
  longestPause?: number;
  fillerCount?: number;
  fillerRate?: number;
  cameraEngagement: number;
  posture: number;
  gestureActivity: string;
  signalQuality: string;
  audioQuality: string;
  videoQuality: string;
  framingQuality: string;
  topic?: string | null;
  userNotes?: string | null;
  feedbackMode?: string;
  integrityEvents?: PresentationIntegrityEventItem[];
  coaching: CoachingRecommendation[];
  strengths: string[];
  improvements: string[];
  practicePlan: PracticePlan;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const presentationCoachApi = {
  async createSession(payload: PresentationSessionPayload): Promise<{ success: boolean; session: SavedPresentationSession }> {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create session: ${res.statusText}`);
    }
    return res.json();
  },

  async analyzeSession(metrics: Partial<PresentationSessionPayload>): Promise<{ success: boolean; evaluation: CoachingEvaluation }> {
    const res = await fetch(`${API_BASE}/sessions/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(metrics),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to analyze session: ${res.statusText}`);
    }
    return res.json();
  },

  async getSessions(): Promise<{ success: boolean; sessions: SavedPresentationSession[] }> {
    const res = await fetch(`${API_BASE}/sessions`, {
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch sessions: ${res.statusText}`);
    }
    return res.json();
  },

  async getSession(id: string): Promise<{ success: boolean; session: SavedPresentationSession }> {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch session: ${res.statusText}`);
    }
    return res.json();
  },

  async deleteSession(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete session: ${res.statusText}`);
    }
    return res.json();
  },

  async addToJournal(id: string, userNote: string): Promise<{ success: boolean; journalEntry: any }> {
    const res = await fetch(`${API_BASE}/sessions/${id}/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userNote }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to add to journal: ${res.statusText}`);
    }
    return res.json();
  },

  async exportReport(id: string, format: "json" | "markdown" | "csv"): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/${id}/report?format=${format}`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(`Failed to export report in format ${format}`);
    }
    if (format === "json") return res.json();
    return res.text();
  },
};
