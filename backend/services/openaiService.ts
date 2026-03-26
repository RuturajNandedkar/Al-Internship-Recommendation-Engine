import OpenAI from "openai";
import redis from "../config/redis";
import crypto from "crypto";
import logger from "../utils/logger";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface AIProfile {
  skills: string[];
  interests: string[];
  experience: string;
}

export interface TopRole {
  title: string;
  description: string;
  match_score: number;
}

export interface SuggestedCompany {
  name: string;
  reason: string;
  roles_available: string[];
}

export interface SkillGap {
  skill: string;
  importance: "High" | "Medium" | "Low";
  reason: string;
}

export interface AIRecommendationResult {
  top_roles: TopRole[];
  suggested_companies: SuggestedCompany[];
  skill_gaps: SkillGap[];
}

export interface ExtractedResumeProfile {
  skills: string[];
  interests: string[];
  experience_level: string;
  preferred_domain: string;
  education: string;
  years_of_experience: number;
}

export interface SuitableRole {
  role: string;
  reason: string;
  match_percentage: number;
}

export interface MissingSkill {
  skill: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
}

export interface ResumeAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  resume_score: number;
  recommendations: string[];
  suitable_roles: SuitableRole[];
  missing_skills: MissingSkill[];
}

// ─── Module-level state ─────────────────────────────────────────────────────

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate AI-powered internship recommendations for a student profile.
 */
async function generateAIRecommendation(
  profile: AIProfile
): Promise<AIRecommendationResult> {
  if (!openai)
    throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env");

  const { skills = [], interests = [], experience = "Beginner" } = profile;

  // 1. Check Redis Cache
  const profileHash = crypto
    .createHash("md5")
    .update(JSON.stringify({ skills, interests, experience }))
    .digest("hex");
  const cacheKey = `ai:recommendations:${profileHash}`;

  try {
    if (redis.status === "ready") {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info("Serving AI recommendations from cache", { profileHash });
        return JSON.parse(cached);
      }
    }
  } catch (err: any) {
    logger.error("Redis AI cache get error", { error: err.message });
  }

  const prompt = `You are an expert career advisor specializing in tech internships.

Given the following student profile, provide structured internship recommendations.

STUDENT PROFILE:
- Skills: ${skills.join(", ")}
- Interests: ${interests.join(", ")}
- Experience Level: ${experience}

Respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "top_roles": [
    {
      "title": "Role title",
      "description": "Brief description of the role and why it fits the student",
      "match_score": 92
    }
  ],
  "suggested_companies": [
    {
      "name": "Company Name",
      "reason": "Why this company is a good fit",
      "roles_available": ["Role 1", "Role 2"]
    }
  ],
  "skill_gaps": [
    {
      "skill": "Skill name",
      "importance": "High | Medium | Low",
      "reason": "Why this skill matters for the student's goals"
    }
  ]
}

Requirements:
- Return exactly 5 top_roles, sorted by match_score descending (0-100 scale).
- Return exactly 5 suggested_companies relevant to the student's skills and interests.
- Return 3-5 skill_gaps the student should learn next, ranked by importance.
- Be specific and realistic. Tailor everything to the provided profile.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a career advisor AI. Always respond with valid JSON only, no markdown formatting.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  }, {
    timeout: 15000, // 15 second timeout
  });

  const text = completion.choices[0].message.content?.trim() || "";
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed: AIRecommendationResult = JSON.parse(cleaned);

  if (!parsed.top_roles || !parsed.suggested_companies || !parsed.skill_gaps) {
    throw new Error("AI response missing required fields");
  }

  // 2. Save to Redis Cache (1 hour)
  try {
    if (redis.status === "ready") {
      await redis.set(cacheKey, JSON.stringify(parsed), "EX", 3600);
      logger.info("AI recommendations cached", { profileHash });
    }
  } catch (err: any) {
    logger.error("Redis AI cache set error", { error: err.message });
  }

  return parsed;
}

/**
 * Extract skills, interests, experience level, and domain from resume text using AI.
 */
async function extractSkillsFromResume(
  resumeText: string
): Promise<ExtractedResumeProfile> {
  if (!openai)
    throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env");

  const prompt = `You are an expert technical recruiter. Analyze the following resume text and extract structured profile information.

RESUME TEXT:
${resumeText.substring(0, 4000)}

Respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "skills": ["skill1", "skill2"],
  "interests": ["interest1", "interest2"],
  "experience_level": "beginner | intermediate | advanced",
  "preferred_domain": "one of: AI, Web Development, Cybersecurity, Data Science, Cloud, Mobile Development, DevOps, Blockchain, IoT, Game Development, UI/UX Design, Machine Learning, Other",
  "education": "highest degree and field",
  "years_of_experience": 0
}

Rules:
- Extract ALL technical skills mentioned (programming languages, frameworks, tools, platforms).
- Identify interests based on projects, coursework, and stated objectives.
- Determine experience_level: "beginner" (0-1 years / student), "intermediate" (1-3 years), "advanced" (3+ years).
- Pick the single most relevant preferred_domain based on the resume's focus.
- Be thorough with skills — include both explicitly stated and implied skills.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a resume analysis AI. Always respond with valid JSON only, no markdown formatting.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const text = completion.choices[0].message.content?.trim() || "";
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed: ExtractedResumeProfile = JSON.parse(cleaned);

  if (!parsed.skills || !Array.isArray(parsed.skills)) {
    throw new Error("AI response missing skills array");
  }

  return parsed;
}

/**
 * Perform a comprehensive resume analysis — strengths, weaknesses, and internship fit.
 */
async function analyzeResume(
  resumeText: string,
  skills: string[] = []
): Promise<ResumeAnalysisResult> {
  if (!openai)
    throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env");

  const prompt = `You are a senior career counselor. Analyze the following resume and provide actionable feedback for an internship applicant.

RESUME TEXT:
${resumeText.substring(0, 4000)}

EXTRACTED SKILLS: ${skills.join(", ")}

Respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "summary": "2-3 sentence professional summary of the candidate",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["area for improvement 1", "area for improvement 2"],
  "resume_score": 75,
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ],
  "suitable_roles": [
    {
      "role": "Role Title",
      "reason": "Why this role suits the candidate",
      "match_percentage": 85
    }
  ],
  "missing_skills": [
    {
      "skill": "Skill Name",
      "priority": "High | Medium | Low",
      "reason": "Why the candidate should learn this"
    }
  ]
}

Rules:
- resume_score is 0-100 based on completeness, relevance, and presentation.
- Return 3-5 strengths, 2-3 weaknesses, 3-5 recommendations.
- Return 5 suitable_roles sorted by match_percentage descending.
- Return 3-5 missing_skills the candidate should acquire, sorted by priority.
- Be constructive and specific, not generic.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a career counselor AI. Always respond with valid JSON only, no markdown formatting.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  });

  const text = completion.choices[0].message.content?.trim() || "";
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed: ResumeAnalysisResult = JSON.parse(cleaned);

  if (!parsed.summary || !parsed.suitable_roles) {
    throw new Error("AI response missing required analysis fields");
  }

  return parsed;
}

export { generateAIRecommendation, extractSkillsFromResume, analyzeResume };
