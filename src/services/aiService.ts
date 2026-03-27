import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import internships, { Internship } from "../data/internships.ts";
import { skillKeyMap, stateKeyMap, modeKeyMap } from "../data/translations.ts";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface CandidateProfile {
  education: string;
  field: string;
  skills: number[];
  sector: string;
  locationIdx: number;
  modeIdx: number;
}

export interface ProfileSummary {
  education: string;
  field: string;
  skills: string[];
  sector: string;
  location: string;
  mode: string;
}

export interface InternshipSummary {
  id: number;
  title: string;
  company: string;
  sector: string;
  skills: string[];
  education: string[];
  location: string;
  state: string;
  duration: string;
  stipend: string;
  mode: string;
  description: string;
}

export interface BreakdownScores {
  skills: number;
  field: number;
  sector: number;
  location: number;
  mode: number;
  experience?: number;
  growth?: number;
  education?: number;
}

export interface AIRecommendation {
  id: number | string;
  score: number;
  reasoning: string;
  breakdown: BreakdownScores;
}

export interface FrontendRecommendation {
  id: number | string;
  title: string;
  company: string;
  sector: string;
  location: string;
  state: string;
  duration: string;
  stipend: string;
  mode: string;
  skills: string[];
  education: string[];
  description: string;
  icon?: string;
  score: number;
  reasoning: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  application_link?: string;
  aiEnhanced?: boolean;
  isFallback?: boolean;
  breakdown: BreakdownScores;
}

// ─── Module-level state ─────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function getAIRecommendations(
  profile: CandidateProfile,
  maxResults: number = 5
): Promise<FrontendRecommendation[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...profile, maxResults }),
    });

    if (!res.ok) {
      throw new Error(`AI recommendation failed: ${res.statusText}`);
    }

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error("Invalid response format from AI backend");
    }

    const parsed: AIRecommendation[] = json.data;

    // Merge AI results with full internship data
    const recommendations: FrontendRecommendation[] = [];

    for (const rec of parsed) {
      const internship = (internships as Internship[]).find((i: Internship) => i.id === Number(rec.id) || i.id === rec.id);
      if (!internship) continue;

      recommendations.push({
        ...internship,
        application_link: internship.application_link,
        score: Math.max(0, Math.min(100, Math.round(rec.score))),
        reasoning: rec.reasoning || "",
        breakdown: {
          skills: Math.round(rec.breakdown?.skills || (rec.breakdown as any)?.skill_match || 0),
          field: Math.round(rec.breakdown?.field || (rec.breakdown as any)?.domain_match || 0),
          sector: Math.round(rec.breakdown?.sector || (rec.breakdown as any)?.interest_match || 0),
          location: Math.round(rec.breakdown?.location || (rec.breakdown as any)?.location_match || 0),
          mode: Math.round(rec.breakdown?.mode || (rec.breakdown as any)?.experience_fit || 50),
        },
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Error fetching AI recommendations:", error);
    return null;
  }
}

export function isAIAvailable(): boolean {
  // Now that it's backend-powered, we could check backend health, 
  // but for now we'll assume it's available if we can reach the backend.
  return true; 
}
