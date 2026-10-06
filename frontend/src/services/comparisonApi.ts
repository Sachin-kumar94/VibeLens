import { api } from "./api";

const API_BASE = "/api";

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
    const errorMsg =
      json.error?.message || json.error || json.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }
  return json as T;
}

export interface ComparePayload {
  analysisAId: string;
  analysisBId: string;
}

export const comparisonApi = {
  /**
   * Compares two user-owned sessions in real-time
   */
  async compareSessions(analysisAId: string, analysisBId: string): Promise<any> {
    return request("/compare", {
      method: "POST",
      body: JSON.stringify({ analysisAId, analysisBId }),
    });
  },

  /**
   * Saves a comparison record to the database
   */
  async saveComparison(payload: {
    analysisAId: string;
    analysisBId: string;
    result: any;
    title?: string;
  }): Promise<any> {
    return request("/compare/save", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Gets user's latest saved comparison
   */
  async getRecentComparison(): Promise<any> {
    return request("/compare/recent");
  },

  /**
   * Gets a saved comparison by ID
   */
  async getComparisonById(id: string): Promise<any> {
    return request(`/compare/${id}`);
  },

  /**
   * Deletes a comparison by ID
   */
  async deleteComparison(id: string): Promise<any> {
    return request(`/compare/${id}`, {
      method: "DELETE",
    });
  },
};
