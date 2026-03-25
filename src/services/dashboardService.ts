// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  stats: {
    savedInternships: number;
    totalSearches: number;
    totalInternships: number;
    profileComplete: boolean;
    profileCompleteness: number;
    activeDays: number;
  };
  analytics: {
    domainDistribution: Array<{ domain: string; count: number; percentage: number }>;
    scoreTrend: Array<{ date: string; avgScore: number; topScore: number; resultCount: number }>;
    averageMatchScore: number;
  };
  recentSearches: Array<{
    id: string;
    date: string;
    source: string;
    skills: string[];
    domain: string;
    resultCount: number;
  }>;
  savedInternships: Array<{
    id: string;
    internship: any;
    score: number;
    savedAt: string;
  }>;
  topSkills: Array<{ skill: string; count: number }>;
}

export interface RecommendationHistoryItem {
  _id: string;
  userId: string;
  profileSnapshot: {
    skills: string[];
    interests: string[];
    preferred_domain: string;
    experience_level: string;
    location: string;
  };
  recommendations: Array<{
    internshipId: string;
    title: string;
    company: string;
    score: number;
    reasoning: string;
  }>;
  source: string;
  createdAt: string;
}

export interface HistoryResponse {
  success: boolean;
  data: RecommendationHistoryItem[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface SavedInternshipItem {
  _id: string;
  userId: string;
  profileId: string;
  internshipId: {
    _id: string;
    internshipId: string;
    title: string;
    company: string;
    location: string;
    domain: string;
    role_complexity: string;
    skills_required: string[];
    description: string;
    posted_date: string;
  };
  score: number;
  breakdown: any;
  reasoning: string;
  createdAt: string;
}

export interface ResumeUploadResult {
  extractedProfile: {
    skills: string[];
    interests: string[];
    experience_level: string;
    preferred_domain: string;
  };
  recommendations: any[];
  fileName: string;
}

export interface SkillGapProfileInput {
  skills: string[];
  interests: string[];
  experience_level: string;
  preferred_domain: string;
}

export interface SkillGapAnalysisData {
  summary: string;
  readiness_score: number;
  current_strengths: unknown[];
  skill_gaps: unknown[];
  learning_path: unknown[];
  recommended_projects: unknown[];
  industry_insights: unknown[];
  source?: string;
}

export interface ResumeUploadData {
  extractedProfile: {
    skills: string[];
    experience_level: string;
    preferred_domain: string;
    [key: string]: unknown;
  };
  analysis: unknown;
}

// ─── Configuration ──────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function getToken(): string | null {
  return localStorage.getItem("ire_auth_token");
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ─── Dashboard API ──────────────────────────────────────────────────────────

export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load dashboard");
  return data.data;
}

export async function fetchHistory(page: number = 1, limit: number = 10): Promise<HistoryResponse> {
  const res = await fetch(
    `${BACKEND_URL}/api/dashboard/history?page=${page}&limit=${limit}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load history");
  return data;
}

export async function fetchSavedInternships(): Promise<SavedInternshipItem[]> {
  const res = await fetch(`${BACKEND_URL}/api/dashboard/saved`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load saved internships");
  return data.data;
}

export async function saveInternship(
  internshipId: string,
  score: number,
  breakdown: unknown,
  reasoning: string
): Promise<SavedInternshipItem> {
  const res = await fetch(`${BACKEND_URL}/api/dashboard/save`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ internshipId, score, breakdown, reasoning }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save");
  return data.data;
}

export async function removeSavedInternship(savedId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BACKEND_URL}/api/dashboard/saved/${savedId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to remove");
  return data;
}

// ─── Skill Gap API ──────────────────────────────────────────────────────────

export async function fetchSkillGapAnalysis(profile: SkillGapProfileInput): Promise<SkillGapAnalysisData> {
  const res = await fetch(`${BACKEND_URL}/api/skill-gap`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Skill gap analysis failed");
  return data.data;
}

// ─── Resume Upload API ──────────────────────────────────────────────────────

export async function uploadResume(file: File): Promise<ResumeUploadResult> {
  const formData = new FormData();
  formData.append("resume", file);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}/api/resume/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Resume upload failed");
  return data.data;
}
