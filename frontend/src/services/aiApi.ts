const API_BASE = "/api/ai";

export interface StudyCitation {
  documentId: string;
  title: string;
  page: number;
  section: string;
  text: string;
  citation: string;
}

export interface AskVibeLensResponse {
  answer: string;
  citations: StudyCitation[];
  relatedQuestions: string[];
  keyConcept: string;
  sourceDocumentNames: string[];
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  citation: string;
  page: number;
  topic: string;
}

export interface QuizResponse {
  id: string;
  title: string;
  questions: QuizQuestionItem[];
}

export interface FlashcardItem {
  id: string;
  documentId: string;
  front: string;
  back: string;
  topic?: string;
  difficulty: string;
  masteryStatus: string;
  citation?: string;
  page?: number;
}

export interface NotesSummaryResponse {
  documentTitle: string;
  pageCount: number;
  executiveSummary: string;
  keyConcepts: Array<{ term: string; definition: string; page?: number }>;
  importantDefinitions: string[];
  interviewQuestions: string[];
  potentialTraps: string[];
  revisionNotes: string[];
}

export interface StudyPlanDay {
  day: number;
  title: string;
  focusSkill: string;
  description: string;
  practiceType: "Technical" | "System Design" | "Behavioral" | "Quiz" | "Mock Interview";
  recommendedDocuments: Array<{ title: string; pageRange?: string; citation?: string }>;
  suggestedQuestions: string[];
  durationMinutes: number;
}

export interface StudyPlanResponse {
  id: string;
  title: string;
  targetRole: string;
  durationDays: number;
  weakSkills: string[];
  days: StudyPlanDay[];
  summary: string;
}

export interface CandidateMemoryResponse {
  targetRole: string;
  targetPosition: string;
  preferredDifficulty: string;
  skills: string[];
  weakTopics: string[];
  strongTopics: string[];
  recentSessionsSummary: {
    totalSessions: number;
    averageScore: number;
    lastPracticedAt?: string;
  };
  studyMaterialsCount: number;
  readyForInterview: boolean;
}

export interface ExplainResponse {
  type: string;
  title: string;
  explanation: string;
  keyTakeaways: string[];
  suggestedAction: string;
  citations?: Array<{ documentName: string; page: number; section: string }>;
}

export interface SemanticSearchResult {
  query: string;
  documentExcerpts: Array<{
    documentTitle: string;
    page: number;
    section?: string;
    text: string;
    citation: string;
  }>;
  interviewMatches: Array<{
    question: string;
    category: string;
    score: number;
    status: string;
    feedback?: string;
    date: string;
  }>;
  weakSkillMatches: Array<{
    skill: string;
    attempts: number;
    averageScore: number;
    status: string;
  }>;
}

export const aiApi = {
  /**
   * "Ask VibeLens" Study Assistant grounded in uploaded notes
   */
  async askStudyAssistant(params: {
    message: string;
    documentId?: string;
    conversationId?: string;
  }): Promise<AskVibeLensResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to ask study assistant");
    return data.data;
  },

  /**
   * Generate quiz from uploaded document
   */
  async generateQuiz(documentId: string, questionsCount = 5, difficulty = "Intermediate"): Promise<QuizResponse> {
    const res = await fetch(`${API_BASE}/documents/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, questionsCount, difficulty }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to generate quiz");
    return data.data;
  },

  /**
   * Generate flashcards from uploaded document
   */
  async generateFlashcards(documentId: string, count = 8): Promise<FlashcardItem[]> {
    const res = await fetch(`${API_BASE}/documents/flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, count }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to generate flashcards");
    return data.data;
  },

  /**
   * Generate executive summary from uploaded document
   */
  async generateSummary(documentId: string): Promise<NotesSummaryResponse> {
    const res = await fetch(`${API_BASE}/documents/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to generate summary");
    return data.data;
  },

  /**
   * Generate 7-day personalized study plan
   */
  async generateStudyPlan(targetRole = "Software Engineer", durationDays = 7): Promise<StudyPlanResponse> {
    const res = await fetch(`${API_BASE}/study-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole, durationDays }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to generate study plan");
    return data.data;
  },

  /**
   * Get Candidate Memory
   */
  async getCandidateMemory(): Promise<CandidateMemoryResponse> {
    const res = await fetch(`${API_BASE}/memory`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch candidate memory");
    return data.data;
  },

  /**
   * AI Semantic Search
   */
  async semanticSearch(query: string): Promise<SemanticSearchResult> {
    const res = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to search");
    return data.data;
  },

  /**
   * "Explain This" & "Ask about My Result"
   */
  async explain(params: {
    type: "score" | "why_wrong" | "concept" | "recommendation" | "result_question";
    contextText?: string;
    questionText?: string;
    candidateAnswer?: string;
    category?: string;
    score?: number;
  }): Promise<ExplainResponse> {
    const res = await fetch(`${API_BASE}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to explain");
    return data.data;
  },

  /**
   * Health Check
   */
  async getHealth(): Promise<{ status: string; provider: string; model: string; latencyMs?: number; timestamp: string }> {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    return data.data;
  },

  /**
   * Test Brain
   */
  async testBrain(message: string = "Hello VibeLens"): Promise<{ configured: boolean; reply?: string; status?: string }> {
    const res = await fetch(`${API_BASE}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    return data.data;
  },
};
