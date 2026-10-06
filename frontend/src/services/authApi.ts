const API_BASE = "/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  plan: string;
  role: string;
  status: string;
  theme: string;
  language: string;
  baseline: {
    confidence: number;
    speechPaceWpm: number;
    postureAlignment: number;
    vocalEnergy: number;
  };
  preferences: {
    theme: string;
    sensoryFeedback: boolean;
    privateMode: boolean;
  };
  createdAt: string;
  lastLoginAt?: string;
}

export interface ActiveSession {
  id: string;
  browser: string;
  os: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
  rememberMe: boolean;
}

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    plan: string;
  };
  summary: {
    totalAnalyses: number;
    thisMonthCount: number;
    averageConfidence: number;
    currentVibe: string;
    lastAnalysis: {
      id: string;
      type: string;
      title: string;
      timestamp: string;
      vibe: string;
      confidence: number;
    } | null;
  };
  recentAnalyses: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
    primaryResult: string;
    confidence: number;
    thumbnail?: string;
    status: string;
  }>;
  latestInsight: {
    id: string;
    summary: string;
    evidence: string;
    createdAt: string;
    confidence: number;
  } | null;
  trend: {
    trend7d: Array<{
      date: string;
      label: string;
      shortDate: string;
      confidence: number;
      emotion: number;
      engagement: number;
    }>;
    trend30d: Array<{
      date: string;
      label: string;
      shortDate: string;
      confidence: number;
      emotion: number;
      engagement: number;
    }>;
  };
  baseline: {
    baselineValue: number;
    currentValue: number;
    change: number;
    sampleSize: number;
  } | null;
  quickActions: Array<{
    id: string;
    label: string;
    desc: string;
    path: string;
    icon: string;
  }>;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Essential for HttpOnly session cookie
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    const message =
      json.error?.message ||
      json.message ||
      `Request failed with status ${response.status}`;
    const code = json.error?.code || "UNKNOWN_ERROR";
    const error = new Error(message) as any;
    error.code = code;
    error.status = response.status;
    throw error;
  }

  return json.data as T;
}

export const authApi = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ user: UserProfile; token?: string; requiresEmailVerification: boolean; message: string }> {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ user: UserProfile; token?: string; message: string }> {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async requestLoginOTP(email: string): Promise<{ message: string }> {
    return request("/auth/login/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async verifyLoginOTP(email: string, otp: string): Promise<{ user: UserProfile; token?: string }> {
    return request("/auth/login/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  async requestRegisterOTP(email: string, name?: string): Promise<{ message: string }> {
    return request("/auth/register/request-otp", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  },

  async verifyRegisterOTP(email: string, otp: string, name?: string): Promise<{ user: UserProfile; token?: string }> {
    return request("/auth/register/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, name }),
    });
  },

  async resendOTP(email: string, purpose: "LOGIN" | "REGISTER", name?: string): Promise<{ message: string }> {
    return request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email, purpose, name }),
    });
  },

  async registerRequestOTP(email: string, name?: string): Promise<{ message: string }> {
    return this.requestRegisterOTP(email, name);
  },

  async verifyRegistrationOTP(email: string, otp: string, name?: string): Promise<{ user: UserProfile; token?: string }> {
    return this.verifyRegisterOTP(email, otp, name);
  },

  async sendOtp(email: string, name?: string): Promise<{ success: boolean; message: string }> {
    return request("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  },

  async verifyOtp(email: string, otp: string): Promise<{ user: UserProfile; token?: string }> {
    return request("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  async logout(): Promise<{ message: string }> {
    return request("/auth/logout", {
      method: "POST",
    });
  },

  async logoutAll(): Promise<{ message: string }> {
    return request("/auth/logout-all", {
      method: "POST",
    });
  },

  async getCurrentUser(): Promise<{ user: UserProfile }> {
    return request("/auth/me", {
      method: "GET",
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: {
    token: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ message: string }> {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  async resendVerification(): Promise<{ message: string }> {
    return request("/auth/resend-verification", {
      method: "POST",
    });
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ message: string }> {
    return request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getSessions(): Promise<{ sessions: ActiveSession[] }> {
    return request("/auth/sessions", {
      method: "GET",
    });
  },

  async revokeSession(id: string): Promise<{ message: string }> {
    return request(`/auth/sessions/${id}`, {
      method: "DELETE",
    });
  },

  async deleteAccount(password?: string): Promise<{ message: string }> {
    return request("/auth/account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  },

  async getDashboard(): Promise<DashboardData> {
    return request("/dashboard", {
      method: "GET",
    });
  },

  async getProviders(): Promise<{ google: boolean; microsoft: boolean; github: boolean; linkedin: boolean }> {
    return request("/auth/providers", {
      method: "GET",
    });
  },

  startGoogleLogin(): void {
    window.location.href = "/api/auth/google";
  },

  startMicrosoftLogin(): void {
    window.location.href = "/api/auth/microsoft";
  },

  startGithubLogin(): void {
    window.location.href = "/api/auth/github";
  },

  startLinkedinLogin(): void {
    window.location.href = "/api/auth/linkedin";
  },
};
