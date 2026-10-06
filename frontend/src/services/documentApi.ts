const API_BASE = "/api/documents";

export interface UserDocumentItem {
  id: string;
  userId: string;
  filename: string;
  type: string;
  mimeType: string;
  size: number;
  pageCount?: number;
  title: string;
  sourceType: "RESUME" | "JOB_DESCRIPTION" | "STUDY_MATERIAL";
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED" | "DELETED";
  storagePath?: string;
  isSelectedForInterview: boolean;
  metadata?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    chunks: number;
  };
}

export interface DocumentChunkItem {
  id: string;
  documentId: string;
  page: number;
  section: string;
  text: string;
  tokenCount?: number;
  citation?: string;
}

export interface ResumeProfileData {
  id: string;
  name: string;
  summary?: string;
  education: Array<{ degree: string; institution: string; year?: string; details?: string[] }>;
  experience: Array<{ role: string; organization: string; dates?: string; details?: string[] }>;
  internships: Array<{ role: string; organization: string; details?: string[] }>;
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  skills: string[];
  technologies: string[];
  certifications: string[];
  achievements: string[];
  document?: UserDocumentItem;
  createdAt: string;
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

export const documentApi = {
  /**
   * Upload and process a PDF, DOCX, or TXT document
   */
  async uploadDocument(
    file: File,
    sourceType: "RESUME" | "JOB_DESCRIPTION" | "STUDY_MATERIAL",
    title?: string
  ): Promise<UserDocumentItem> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceType", sourceType);
    if (title) formData.append("title", title);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || "Failed to upload document.");
    }
    return json.data;
  },

  /**
   * Paste Job Description text directly
   */
  async pasteJobDescription(data: {
    text: string;
    title?: string;
    role?: string;
    company?: string;
  }): Promise<{ document: UserDocumentItem; analyzed: any }> {
    return request("/job-description/text", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * List user's documents
   */
  async getDocuments(sourceType?: string): Promise<UserDocumentItem[]> {
    const qs = sourceType ? `?sourceType=${sourceType}` : "";
    return request<UserDocumentItem[]>(`/${qs}`);
  },

  /**
   * Get single document details with chunk preview
   */
  async getDocument(id: string): Promise<UserDocumentItem & { chunks: DocumentChunkItem[] }> {
    return request(`/${id}`);
  },

  /**
   * Toggle document inclusion in interview question generation
   */
  async toggleSelection(id: string, isSelected: boolean): Promise<UserDocumentItem> {
    return request(`/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ isSelected }),
    });
  },

  /**
   * Delete document and learning references
   */
  async deleteDocument(id: string, cascadeQuestions = false): Promise<any> {
    return request(`/${id}?cascadeQuestions=${cascadeQuestions}`, {
      method: "DELETE",
    });
  },

  /**
   * Search through user's uploaded study material chunks
   */
  async searchDocuments(query: string): Promise<DocumentChunkItem[]> {
    return request(`/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get active parsed resume
   */
  async getActiveResume(): Promise<ResumeProfileData | null> {
    return request<ResumeProfileData | null>("/resume/active");
  },
};
