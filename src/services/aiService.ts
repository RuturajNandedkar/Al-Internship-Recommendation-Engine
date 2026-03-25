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
  aiEnhanced?: boolean;
  breakdown: BreakdownScores;
}

// ─── Module-level state ─────────────────────────────────────────────────────

let currentApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel | null {
  if (!currentApiKey || currentApiKey === "your_gemini_api_key_here") return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(currentApiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  return model;
}

export function setApiKey(key: string): void {
  currentApiKey = key;
  genAI = null;
  model = null;
}

export function getApiKey(): string {
  return currentApiKey;
}

function buildProfileSummary(profile: CandidateProfile): ProfileSummary {
  const { education, field, skills, sector, locationIdx, modeIdx } = profile;

  const englishSkills = Object.keys(skillKeyMap);
  const selectedSkills = skills
    .map((idx) => englishSkills[idx])
    .filter(Boolean) as string[];

  const location = stateKeyMap[locationIdx] || "Any Location";
  const mode = modeKeyMap[modeIdx] || "Any Mode";

  return {
    education,
    field,
    skills: selectedSkills,
    sector: sector === "all" ? "Open to all sectors" : sector,
    location,
    mode,
  };
}

function buildInternshipSummaries(): InternshipSummary[] {
  return (internships as Internship[]).map((i: Internship) => ({
    id: i.id,
    title: i.title,
    company: i.company,
    sector: i.sector,
    skills: i.skills,
    education: i.education,
    location: i.location,
    state: i.state,
    duration: i.duration,
    stipend: i.stipend,
    mode: i.mode,
    description: i.description,
  }));
}

export async function getAIRecommendations(
  profile: CandidateProfile,
  maxResults: number = 5
): Promise<FrontendRecommendation[] | null> {
  const ai = getModel();
  if (!ai) return null;

  const profileSummary = buildProfileSummary(profile);
  const internshipList = buildInternshipSummaries();

  const prompt = `You are an intelligent internship recommendation engine. Analyze the candidate's profile and rank the most suitable internships from the provided list.

CANDIDATE PROFILE:
- Education Level: ${profileSummary.education}
- Field of Study: ${profileSummary.field}
- Skills: ${profileSummary.skills.join(", ")}
- Preferred Sector: ${profileSummary.sector}
- Preferred Location: ${profileSummary.location}
- Work Mode Preference: ${profileSummary.mode}

AVAILABLE INTERNSHIPS:
${JSON.stringify(internshipList, null, 2)}

TASK: Select the top ${maxResults} most suitable internships for this candidate. For each selected internship, provide:
1. The internship ID
2. A match score from 0 to 100 (be realistic and differentiated — don't give similar scores)
3. A brief 1-2 sentence personalized reasoning explaining WHY this internship is a good fit
4. A breakdown of how well each factor matches (each 0-100):
   - skills: how well the candidate's skills match the internship requirements
   - field: how well their field of study aligns
   - sector: how well the sector matches their preference
   - location: how well the location matches
   - mode: how well the work mode matches

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks. Use this exact format:
[
  {
    "id": 1,
    "score": 85,
    "reasoning": "Your skills in Python and programming align perfectly with this software development role...",
    "breakdown": { "skills": 90, "field": 85, "sector": 80, "location": 70, "mode": 95 }
  }
]

Sort by score descending. Return exactly ${maxResults} results.`;

  const result = await ai.generateContent(prompt);
  const response = result.response;
  const text = response.text().trim();

  // Parse JSON — strip code fences if present
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const parsed: AIRecommendation[] = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) throw new Error("AI response is not an array");

  // Merge AI results with full internship data
  const recommendations: FrontendRecommendation[] = [];

  for (const rec of parsed) {
    const internship = (internships as Internship[]).find((i: Internship) => i.id === rec.id);
    if (!internship) continue;

    recommendations.push({
      ...internship,
      score: Math.max(0, Math.min(100, Math.round(rec.score))),
      reasoning: rec.reasoning || "",
      breakdown: {
        skills: Math.round(rec.breakdown?.skills || 0),
        field: Math.round(rec.breakdown?.field || 0),
        sector: Math.round(rec.breakdown?.sector || 0),
        location: Math.round(rec.breakdown?.location || 0),
        mode: Math.round(rec.breakdown?.mode || 0),
      },
    });
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

export function isAIAvailable(): boolean {
  return !!getModel();
}
