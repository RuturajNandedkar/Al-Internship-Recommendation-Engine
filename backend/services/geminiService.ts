import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import logger from "../utils/logger";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface AIBreakdown {
  skill_match: number;
  domain_match: number;
  interest_match: number;
  location_match: number;
  experience_fit: number;
  growth_potential?: number;
  recency?: number;
}

export interface AIEnhancedResult {
  _id: string;
  score: number;
  reasoning: string;
  breakdown: Partial<AIBreakdown>;
  matched_skills?: string[];
  skills_to_learn?: string[];
}

export interface EnhancedInternship {
  score: number;
  reasoning: string;
  breakdown: AIBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  aiEnhanced: boolean;
  confidence: number;
  [key: string]: unknown;
}

export interface InternshipProfile {
  skills?: string[];
  interests?: string[];
  preferred_domain?: string;
  experience_level?: string;
  location?: string;
}

export interface InternshipInput {
  _id?: any;
  title?: string;
  company?: string;
  domain?: string;
  location?: string;
  duration?: string;
  stipend?: string;
  required_skills?: string[];
  description?: string;
  score?: number;
  reasoning?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  [key: string]: unknown;
}

// ─── Module-level state ─────────────────────────────────────────────────────

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(key);
    model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    });
  }
  return model;
}

function isGeminiAvailable(): boolean {
  return !!getModel();
}

/**
 * Use Gemini AI to re-rank and add personalized reasoning to internship
 * recommendations that were pre-filtered by the algorithmic engine.
 */
async function enhanceWithAI(
  profile: InternshipProfile,
  internships: InternshipInput[]
): Promise<EnhancedInternship[] | null> {
  const ai = getModel();
  if (!ai) return null;

  const {
    skills = [],
    interests = [],
    preferred_domain,
    experience_level,
    location,
  } = profile;

  const internshipSummaries = internships.map((i) => ({
    _id: i._id,
    title: i.title,
    company: i.company,
    domain: i.domain,
    location: i.location,
    duration: i.duration,
    stipend: i.stipend,
    required_skills: i.required_skills,
    description: i.description,
    algorithmicScore: i.score,
  }));

  const prompt = `You are an expert career advisor and internship recommendation AI. A student is looking for internships. An algorithmic engine has pre-selected some candidates from the database. Your job is to analyze the match deeply and provide truly personalized AI recommendations.

STUDENT PROFILE:
- Skills: ${skills.join(", ")}
- Interests: ${interests.join(", ")}
- Preferred Domain: ${preferred_domain || "Open to all"}
- Experience Level: ${experience_level || "beginner"}
- Preferred Location: ${location || "Any"}

CANDIDATE INTERNSHIPS (pre-filtered from database):
${JSON.stringify(internshipSummaries, null, 2)}

TASK: Re-rank these internships using your AI judgment. For each internship provide:
1. The _id (exactly as given)
2. An AI-refined match score (0-100) — be realistic, differentiated, and justify it
3. A personalized 2-3 sentence reasoning explaining WHY this specific internship fits THIS student — mention their specific skills, career growth, and learning opportunity
4. A breakdown of match factors (each 0-100):
   - skill_match: how well skills align (consider transferable skills too)
   - domain_match: domain/field alignment
   - interest_match: alignment with stated interests
   - location_match: location fit
   - experience_fit: complexity vs experience level fit
   - growth_potential: how much the student can learn and grow
5. A list of matched_skills (skills the student already has)
6. A list of skills_to_learn (skills they would need to develop)

IMPORTANT: Return ONLY valid JSON array, no markdown, no code blocks:
[
  {
    "_id": "...",
    "score": 85,
    "reasoning": "...",
    "breakdown": { "skill_match": 80, "domain_match": 90, "interest_match": 75, "location_match": 60, "experience_fit": 85, "growth_potential": 90 },
    "matched_skills": ["Python", "SQL"],
    "skills_to_learn": ["Docker", "AWS"]
  }
]

Sort by score descending. Return ALL internships provided.`;

  try {
    let result;
    try {
      result = await ai.generateContent(prompt);
    } catch (firstErr: unknown) {
      const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      if (errMsg.includes("429")) {
        logger.info("Gemini rate limited, retrying in 10 seconds...");
        await new Promise((r) => setTimeout(r, 10000));
        result = await ai.generateContent(prompt);
      } else {
        throw firstErr;
      }
    }

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const parsed: AIEnhancedResult[] = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      logger.warn("Gemini returned non-array response");
      return null;
    }

    // Merge AI enhancements back into the original internship objects
    const enhanced: EnhancedInternship[] = [];
    for (const aiItem of parsed) {
      const original = internships.find(
        (i) => String(i._id) === String(aiItem._id)
      );
      if (!original) continue;

      enhanced.push({
        ...original,
        score: Math.max(0, Math.min(100, Math.round(aiItem.score))),
        reasoning: aiItem.reasoning || original.reasoning || "",
        breakdown: {
          skill_match: Math.round(aiItem.breakdown?.skill_match || 0),
          domain_match: Math.round(aiItem.breakdown?.domain_match || 0),
          interest_match: Math.round(aiItem.breakdown?.interest_match || 0),
          location_match: Math.round(aiItem.breakdown?.location_match || 0),
          experience_fit: Math.round(aiItem.breakdown?.experience_fit || 0),
          growth_potential: Math.round(aiItem.breakdown?.growth_potential || 0),
        },
        matchedSkills: aiItem.matched_skills || (original.matchedSkills as string[]) || [],
        missingSkills: aiItem.skills_to_learn || (original.missingSkills as string[]) || [],
        aiEnhanced: true,
        confidence: (original.confidence as number) || 80,
      } as EnhancedInternship);
    }

    enhanced.sort((a, b) => b.score - a.score);
    logger.info("Gemini AI enhanced recommendations", { count: enhanced.length });
    return enhanced.length > 0 ? enhanced : null;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.warn("Gemini AI enhancement failed", { error: errMsg });
    return null;
  }
}

/**
 * Generate a complete set of AI recommendations from scratch using the full internship list.
 * This mirrors the logic previously found in the frontend aiService.ts.
 */
async function generatePureAIRecommendations(
  profile: InternshipProfile,
  internshipList: InternshipInput[],
  maxResults: number = 5
): Promise<EnhancedInternship[] | null> {
  const ai = getModel();
  if (!ai) return null;

  const {
    skills = [],
    interests = [],
    preferred_domain,
    experience_level,
    location,
  } = profile;

  const prompt = `You are an intelligent internship recommendation engine. Analyze the candidate's profile and rank the most suitable internships from the provided list.

CANDIDATE PROFILE:
- Skills: ${skills.join(", ")}
- Interests: ${interests.join(", ")}
- Preferred Domain: ${preferred_domain || "Open to all"}
- Experience Level: ${experience_level || "beginner"}
- Preferred Location: ${location || "Any"}

AVAILABLE INTERNSHIPS:
${JSON.stringify(internshipList, null, 2)}

TASK: Select the top ${maxResults} most suitable internships for this candidate. For each selected internship, provide:
1. The internship ID (exactly as given in the _id field)
2. A match score from 0 to 100 (be realistic and differentiated — don't give similar scores)
3. A brief 1-2 sentence personalized reasoning explaining WHY this internship is a good fit
4. A breakdown of match factors (each 0-100):
   - skill_match: how well the candidate's skills match the internship requirements
   - domain_match: how well their domain/field aligns
   - interest_match: how well the interest matches
   - location_match: how well the location matches
   - experience_fit: how well the experience level fits
   - growth_potential: how much the student can learn and grow

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks. Use this exact format:
[
  {
    "_id": "...",
    "score": 85,
    "reasoning": "...",
    "breakdown": { "skill_match": 90, "domain_match": 85, "interest_match": 80, "location_match": 70, "experience_fit": 95, "growth_potential": 90 }
  }
]

Sort by score descending. Return exactly ${maxResults} results.`;

  try {
    const result = await ai.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const parsed: AIEnhancedResult[] = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      logger.warn("Gemini returned non-array response in pure AI mode");
      return null;
    }

    const recommendations: EnhancedInternship[] = [];

    for (const rec of parsed) {
      const internship = internshipList.find(
        (i: InternshipInput) => String(i._id) === String(rec._id)
      );
      if (!internship) continue;

      recommendations.push({
        ...internship,
        score: Math.max(0, Math.min(100, Math.round(rec.score))),
        reasoning: rec.reasoning || "",
        breakdown: {
          skill_match: Math.round(rec.breakdown?.skill_match || 0),
          domain_match: Math.round(rec.breakdown?.domain_match || 0),
          interest_match: Math.round(rec.breakdown?.interest_match || 0),
          location_match: Math.round(rec.breakdown?.location_match || 0),
          experience_fit: Math.round(rec.breakdown?.experience_fit || 0),
          growth_potential: Math.round(rec.breakdown?.growth_potential || 0),
        },
        matchedSkills: rec.matched_skills || [],
        missingSkills: rec.skills_to_learn || [],
        aiEnhanced: true,
        confidence: 90,
      } as EnhancedInternship);
    }

    return recommendations.sort((a, b) => b.score - a.score);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error("Gemini pure AI recommendation failed", { error: errMsg });
    return null;
  }
}

export { enhanceWithAI, isGeminiAvailable, generatePureAIRecommendations };
