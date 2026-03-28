import { skillKeyMap, stateKeyMap, fieldSectorMap } from "../data/translations.ts";
import type { CandidateProfile, FrontendRecommendation, BreakdownScores } from "./aiService";
import { getRecommendations as getLocalRecommendations } from "../engine/recommendationEngine.ts";


// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface BackendPayload {
  skills: string[];
  interests: string[];
  preferred_domain: string;
  experience_level: string;
  location: string;
}

export interface BackendInternshipResult {
  _id?: string;
  title: string;
  company: string;
  domain?: string;
  location: string;
  duration: string;
  stipend: string;
  required_skills?: string[];
  description: string;
  score?: number;
  reasoning?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  aiEnhanced?: boolean;
  breakdown?: {
    skill_match?: number;
    domain_match?: number;
    interest_match?: number;
    location_match?: number;
    experience_fit?: number;
    growth_potential?: number;
  };
}

export interface BackendResponseData {
  success: boolean;
  data: BackendInternshipResult[];
  aiUsed?: boolean;
}

// ─── Configuration ──────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ─── Data Transformations ───────────────────────────────────────────────────

/**
 * Map education level to experience_level expected by backend.
 */
const EDUCATION_TO_EXPERIENCE: Record<string, string> = {
  "10th": "beginner",
  "12th": "beginner",
  diploma: "intermediate",
  bachelors: "intermediate",
  masters: "advanced",
  phd: "advanced",
};

/**
 * Map field of study to a preferred_domain string for the backend.
 */
function fieldToDomain(field: string): string {
  const domainMap: Record<string, string> = {
    engineering: "Web Development",
    science: "Data Science",
    commerce: "Finance",
    arts: "Content Writing",
    medical: "Healthcare",
    law: "Legal",
    design: "UI/UX Design",
    agriculture: "Agriculture",
    education: "Education",
  };
  return domainMap[field] || "all";
}

/**
 * Pick a default icon based on the internship domain.
 */
function domainIcon(domain: string | undefined): string {
  if (!domain) return "💼";
  const icons: Record<string, string> = {
    AI: "🤖",
    "Machine Learning": "🧠",
    "Data Science": "📊",
    "Web Development": "🌐",
    "Mobile Development": "📱",
    "UI/UX Design": "🎨",
    Cybersecurity: "🔒",
    Cloud: "☁️",
    DevOps: "⚙️",
    Blockchain: "⛓️",
    IoT: "📡",
    "Game Development": "🎮",
    Finance: "💰",
    Healthcare: "🏥",
    Education: "📚",
    "Content Writing": "✍️",
    Legal: "⚖️",
    Agriculture: "🌾",
  };
  return icons[domain] || "💼";
}

/**
 * Convert the frontend form data into the shape the backend API expects.
 */
function transformFormToBackend(formData: CandidateProfile): BackendPayload {
  const { education, field, skills, sector, locationIdx } = formData;

  // Convert skill indices to skill name strings
  const englishSkills = Object.keys(skillKeyMap);
  const skillStrings = skills
    .map((idx) => skillKeyMap[englishSkills[idx] as keyof typeof skillKeyMap])
    .filter(Boolean);

  // Build interests from sector preference and field
  const interests: string[] = [];
  if (sector && sector !== "all") interests.push(sector);
  const relatedSectors = fieldSectorMap[field as keyof typeof fieldSectorMap] || [];
  for (const s of relatedSectors) {
    if (!interests.includes(s)) interests.push(s);
  }

  // Map location index to string
  const location = stateKeyMap[locationIdx] || "";

  return {
    skills: skillStrings,
    interests,
    preferred_domain: fieldToDomain(field),
    experience_level: EDUCATION_TO_EXPERIENCE[education] || "beginner",
    location,
  };
}

/**
 * Convert a single backend internship result into the shape the
 * frontend RecommendationCard expects.
 */
function transformBackendResult(item: BackendInternshipResult, index: number): FrontendRecommendation {
  const breakdown = item.breakdown || {};

  const mappedBreakdown: BreakdownScores = {
    skills: Math.round(breakdown.skill_match || 0),
    field: Math.round(breakdown.domain_match || 0),
    sector: Math.round(breakdown.interest_match || 0),
    location: Math.round(breakdown.location_match || 0),
    experience: Math.round(breakdown.experience_fit || 0),
    growth: Math.round(breakdown.growth_potential || 0),
    mode: 50,
  };

  return {
    id: item._id || String(index + 1),
    title: item.title,
    company: item.company,
    sector: item.domain || "General",
    location: item.location,
    state: item.location,
    duration: item.duration,
    stipend: item.stipend,
    mode: "On-site",
    skills: item.required_skills || [],
    education: [],
    description: item.description,
    icon: domainIcon(item.domain),
    score: Math.round(item.score || 0),
    reasoning: item.reasoning || "",
    matchedSkills: item.matchedSkills || [],
    missingSkills: item.missingSkills || [],
    aiEnhanced: item.aiEnhanced || false,
    breakdown: mappedBreakdown,
  };
}

// ─── API Functions ──────────────────────────────────────────────────────────

export interface RecommendedResultsArray extends Array<FrontendRecommendation> {
  _aiUsed?: boolean;
}

/**
 * Send the candidate profile to the backend and receive recommendations.
 *
 * @param formData — raw form data from CandidateForm
 * @returns recommendations shaped for RecommendationCard
 */
export async function getBackendRecommendations(formData: CandidateProfile): Promise<RecommendedResultsArray> {
  try {
    const payload = transformFormToBackend(formData);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("authToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND_URL}/api/recommendations`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const json = (await res.json()) as BackendResponseData;

    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      console.warn("Backend returned 0 results or failed, falling back to local engine");
      return getLocalFallback(formData);
    }

    const results: RecommendedResultsArray = json.data.map(transformBackendResult);
    results._aiUsed = !!json.aiUsed;

    return results;
  } catch (error) {
    console.error("Backend request failed, falling back to local engine:", error);
    return getLocalFallback(formData);
  }
}

/**
 * Fallback to local recommendation engine when backend is unavailable or empty.
 */
function getLocalFallback(formData: CandidateProfile): RecommendedResultsArray {
  // Ensure we get at least 5 results from the local engine if possible
  const localResults = getLocalRecommendations(formData, 10);
  
  const results: RecommendedResultsArray = localResults.map((item, index) => ({
    id: String(item.id || index + 1),
    title: item.title,
    company: item.company,
    sector: item.sector,
    location: item.location,
    state: item.state,
    duration: item.duration,
    stipend: item.stipend,
    mode: item.mode as any,
    skills: item.skills,
    education: item.education as string[],
    description: item.description,
    score: item.score,
    reasoning: "Showing local recommendation as a fallback.",
    breakdown: item.breakdown,
  }));

  results._aiUsed = false;
  return results;
}

/**
 * Quick health-check against the backend.
 * Returns true if the server is reachable.
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
