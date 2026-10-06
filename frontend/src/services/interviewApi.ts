const API_BASE = "/api/interviews";

export interface InterviewQuestionItem {
  id: string;
  category: string;
  subCategory?: string;
  role: string;
  roles?: string[];
  interviewTypes?: string[];
  difficulty: "Easy" | "Intermediate" | "Advanced" | "Expert";
  tags?: string[];
  skills?: string[];
  question: string;
  criteria: string;
  timeTargetMin: number;
  timeTargetMax: number;
  whyThisQuestion?: string;
  expectedConcepts?: string[];
  acceptableConcepts?: string[];
  commonMistakes?: string[];
  referenceAnswer?: string;
  hints?: string[];
  followUpTemplates?: string[];
  rubric: {
    structure: number;
    relevance: number;
    clarity: number;
    delivery: number;
    evidence: number;
    methodology?: string;
  };
  isCustom?: boolean;
  source?: string;
  sourceType?: "RESUME" | "JOB_DESCRIPTION" | "STUDY_MATERIAL" | "STANDARD" | "CUSTOM";
  sourceCitation?: string;
  sourceDocumentId?: string;
  sourceChunkId?: string;
  page?: number;
  section?: string;
}

export interface InterviewAnswerItem {
  id: string;
  sessionId: string;
  questionId: string;
  userId: string;
  parentAnswerId?: string;
  answerType?: "PRIMARY" | "FOLLOW_UP_1" | "FOLLOW_UP_2";
  attemptNumber?: number;
  textAnswer?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: number;
  transcript?: string;
  wpm: number;
  pauseCount: number;
  avgPauseDuration: number;
  longestPause: number;
  fillerCount: number;
  fillerRate: number;
  cameraFacingSignal?: string;
  faceVisibility?: number;
  postureSignal?: string;
  framingQuality?: string;
  audioQuality?: string;
  videoQuality?: string;
  sourceDocumentId?: string;
  sourceChunkId?: string;
  sourceCitation?: string;
  integrityEvents?: string;
  status: string;
  createdAt: string;
  question?: InterviewQuestionItem;
  parentAnswer?: InterviewAnswerItem;
  followUpAnswers?: InterviewAnswerItem[];
  evaluation?: {
    id: string;
    status?: "CORRECT" | "MOSTLY_CORRECT" | "PARTIALLY_CORRECT" | "WEAK" | "INCORRECT" | "INSUFFICIENT_INFORMATION" | "NOT_EVALUATABLE";
    overallScore: number;
    structureScore: number;
    relevanceScore: number;
    clarityScore: number;
    deliveryScore: number;
    evidenceScore: number;
    categoryScores?: {
      technical: number;
      communication: number;
      structure: number;
      delivery: number;
    } | string;
    strengths: string | string[];
    improvements: string | string[];
    nextPractice: string | string[];
    missingConcepts?: string | string[];
    incorrectConcepts?: Array<{ claim: string; problem: string; correctConcept: string }> | string;
    referenceAnswer?: string;
    improvedAnswer?: string;
    simpleExplanation?: string;
    sourceCitations?: string[] | string;
    whyThisAssessment?: string;
    rememberRule?: string;
    attemptComparison?: {
      previousScore: number;
      currentScore: number;
      difference: number;
      summary: string;
    } | string;
    feedback: string;
    transcriptObservations?: string;
    deliveryObservations?: string;
    rubricVersion: string;
    analysisProvider: string;
    paceState?: "Within target" | "Above target" | "Below target" | "Insufficient data";
    actualWpm?: number;
    structureBreakdown?: {
      methodology: string;
      hasOpening: boolean;
      hasTransitions: boolean;
      hasConclusion: boolean;
      star?: { situation: boolean; task: boolean; action: boolean; result: boolean };
      technical?: { problem: boolean; approach: boolean; tradeoffs: boolean; implementation: boolean; result: boolean };
      project?: { architecture: boolean; techChoices: boolean; challenges: boolean; lessons: boolean };
    };
    integritySummary?: {
      eventCount: number;
      focusChanges: number;
      pageHiddenSeconds: number;
      pasteEvents: number;
      fullscreenExits: number;
      faceVisiblePercent: number;
      interruptions: number;
      notes: string;
    };
  };
}

export interface InterviewSessionItem {
  id: string;
  userId: string;
  role: string;
  position?: string;
  experienceRange?: string;
  interviewType: string;
  category: string;
  difficulty: string;
  maxDifficulty?: string;
  practiceMode?: "Interview" | "Practice" | "Study";
  learningMode?: "Interview" | "Practice" | "Study";
  questionSources?: string[] | string;
  documentIds?: string[] | string;
  jobDescription?: string;
  resumeText?: string;
  questionCount: number;
  currentQuestionIndex?: number;
  targetDuration: number;
  targetMin?: number;
  targetMax?: number;
  cameraMode: string;
  cameraEnabled?: boolean;
  microphoneEnabled?: boolean;
  adaptiveDifficulty?: boolean;
  followUpsEnabled?: boolean;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  averageScore?: number;
  createdAt: string;
  completedAt?: string;
  answers: InterviewAnswerItem[];
  integrityEvents?: any[];
  initialQuestions?: InterviewQuestionItem[];
  questions?: any[];
}

export interface InterviewReportPayload {
  sessionId: string;
  role: string;
  interviewType: string;
  difficulty: string;
  createdAt: string;
  completedAt?: string;
  totalDurationSeconds: number;
  averageScore: number;
  averageWpm: number;
  totalQuestionsAnswered: number;
  totalQuestionsPlanned: number;
  answers: any[];
  integritySummary?: {
    majorInterruptions: number;
    focusChanges: number;
    faceVisibilityPct: number;
    audioInterruptions: number;
    [key: string]: any;
  };
  overallStrengths: string[];
  overallImprovements: string[];
  recommendedPracticePlan: string[];
  disclaimer: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = json.error?.message || json.error || json.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const interviewApi = {
  // Questions Bank
  async getQuestions(filters: {
    category?: string;
    role?: string;
    difficulty?: string;
    search?: string;
    customOnly?: boolean;
  } = {}): Promise<InterviewQuestionItem[]> {
    const query = new URLSearchParams();
    if (filters.category) query.set("category", filters.category);
    if (filters.role) query.set("role", filters.role);
    if (filters.difficulty) query.set("difficulty", filters.difficulty);
    if (filters.search) query.set("search", filters.search);
    if (filters.customOnly) query.set("customOnly", "true");

    const qs = query.toString();
    return request<InterviewQuestionItem[]>(`/questions${qs ? `?${qs}` : ""}`);
  },

  async createCustomQuestion(data: {
    question: string;
    category?: string;
    role?: string;
    difficulty?: string;
    criteria?: string;
    timeTargetMin?: number;
    timeTargetMax?: number;
    rubric?: any;
  }): Promise<InterviewQuestionItem> {
    return request<InterviewQuestionItem>("/questions/custom", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteCustomQuestion(id: string): Promise<any> {
    return request(`/questions/${id}`, { method: "DELETE" });
  },

  async generateQuestionsFromJd(
    jobDescription: string,
    role: string = "Software Engineer",
    difficulty: string = "Intermediate"
  ): Promise<InterviewQuestionItem[]> {
    return request<InterviewQuestionItem[]>("/questions/generate-from-jd", {
      method: "POST",
      body: JSON.stringify({ jobDescription, role, difficulty }),
    });
  },

  // Sessions
  async createSession(data: {
    role?: string;
    position?: string;
    experienceRange?: string;
    interviewType?: string;
    category?: string;
    difficulty?: string;
    maxDifficulty?: string;
    practiceMode?: "Interview" | "Practice" | "Study";
    learningMode?: "Interview" | "Practice" | "Study";
    questionSources?: string[];
    documentIds?: string[];
    jobDescription?: string;
    resumeText?: string;
    resumeId?: string;
    questionCount?: number;
    targetDuration?: number;
    targetMin?: number;
    targetMax?: number;
    cameraMode?: string;
    cameraEnabled?: boolean;
    microphoneEnabled?: boolean;
    adaptiveDifficulty?: boolean;
    followUpsEnabled?: boolean;
  }): Promise<InterviewSessionItem> {
    return request<InterviewSessionItem>("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async startSession(id: string): Promise<InterviewSessionItem> {
    return request<InterviewSessionItem>(`/sessions/${id}/start`, { method: "POST" });
  },

  async getSession(id: string): Promise<InterviewSessionItem> {
    return request<InterviewSessionItem>(`/sessions/${id}`);
  },

  async getSessions(): Promise<InterviewSessionItem[]> {
    return request<InterviewSessionItem[]>("/sessions");
  },

  async deleteSession(id: string): Promise<any> {
    return request(`/sessions/${id}`, { method: "DELETE" });
  },

  async finishSession(id: string): Promise<{ session: InterviewSessionItem; report: InterviewReportPayload }> {
    return request(`/sessions/${id}/finish`, { method: "POST" });
  },

  async getReport(id: string): Promise<InterviewReportPayload> {
    return request<InterviewReportPayload>(`/sessions/${id}/report`);
  },

  async getInsights(id: string): Promise<any> {
    return request(`/sessions/${id}/insights`);
  },

  // Integrity Events
  async recordIntegrityEvents(
    sessionId: string,
    events: any[],
    answerId?: string
  ): Promise<{ count: number; events: any[] }> {
    return request<{ count: number; events: any[] }>(`/sessions/${sessionId}/integrity`, {
      method: "POST",
      body: JSON.stringify({ events, answerId }),
    });
  },

  async getIntegritySummary(sessionId: string): Promise<any> {
    return request(`/sessions/${sessionId}/integrity`);
  },

  // Answers & Evaluations
  async saveAndEvaluateAnswer(
    sessionId: string,
    data: {
      questionId: string;
      parentAnswerId?: string;
      answerType?: string;
      attemptNumber?: number;
      textAnswer?: string;
      duration: number;
      audioUrl?: string;
      videoUrl?: string;
      transcript?: string;
      wpm?: number;
      pauseCount?: number;
      avgPauseDuration?: number;
      longestPause?: number;
      fillerCount?: number;
      fillerRate?: number;
      cameraFacingSignal?: string;
      faceVisibility?: number;
      postureSignal?: string;
      framingQuality?: string;
      audioQuality?: string;
      videoQuality?: string;
      hasVisualData?: boolean;
      integrityEvents?: any[];
    }
  ): Promise<InterviewAnswerItem> {
    return request<InterviewAnswerItem>(`/sessions/${sessionId}/answers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getNextQuestion(sessionId: string): Promise<{
    question: InterviewQuestionItem | null;
    adaptation: {
      nextDifficulty: string;
      recommendedCategory?: string;
      recommendedSkills?: string[];
      adaptationReason: string;
      difficultyChange: "INCREASED" | "MAINTAINED" | "DECREASED";
    };
    answeredCount: number;
    totalCount: number;
    hasMore: boolean;
  }> {
    return request(`/sessions/${sessionId}/next-question`, { method: "POST" });
  },

  async getSkillProfile(): Promise<{
    totalSkillsPracticed: number;
    strengths: Array<{ skill: string; averageScore: number; attempts: number }>;
    needsPractice: Array<{ skill: string; averageScore: number; attempts: number }>;
    recommendedNextTopics: string[];
    allSkills: any[];
  }> {
    return request("/skills");
  },

  async getAnswer(id: string): Promise<InterviewAnswerItem> {
    return request<InterviewAnswerItem>(`/answers/${id}`);
  },

  async generateFollowUp(answerId: string): Promise<{
    hasMoreFollowUps: boolean;
    followUpNumber?: number;
    parentAnswerId?: string;
    question?: InterviewQuestionItem;
    message?: string;
  }> {
    return request(`/answers/${answerId}/follow-up`, { method: "POST" });
  },

  // Media Upload
  async uploadMedia(blob: Blob, filename: string = "recording.webm"): Promise<{ fileUrl: string; size: number }> {
    const formData = new FormData();
    formData.append("media", blob, filename);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || "Media upload failed");
    }

    return json.data;
  },

  getDownloadUrl(answerId: string): string {
    return `${API_BASE}/answers/${answerId}/download`;
  },
};
