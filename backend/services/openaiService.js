const OpenAI = require("openai");

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate AI-powered internship recommendations for a student profile.
 *
 * @param {Object}   profile
 * @param {string[]} profile.skills      – e.g. ["Python", "Machine Learning", "AWS"]
 * @param {string[]} profile.interests   – e.g. ["AI", "Data Science"]
 * @param {string}   profile.experience  – "Beginner" | "Intermediate" | "Advanced"
 * @returns {Promise<Object>} structured recommendation payload
 */
async function generateAIRecommendation(profile) {
  if (!openai) throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env");
  const { skills = [], interests = [], experience = "Beginner" } = profile;

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
  });

  const text = completion.choices[0].message.content.trim();

  // Strip code fences if the model wraps the response
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  // Validate expected structure
  if (!parsed.top_roles || !parsed.suggested_companies || !parsed.skill_gaps) {
    throw new Error("AI response missing required fields");
  }

  return parsed;
}

/**
 * Extract skills, interests, experience level, and domain from resume text using AI.
 *
 * @param {string} resumeText – raw text extracted from a PDF resume
 * @returns {Promise<Object>} extracted profile data
 */
async function extractSkillsFromResume(resumeText) {
  if (!openai) throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env");
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

  const text = completion.choices[0].message.content.trim();
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed.skills || !Array.isArray(parsed.skills)) {
    throw new Error("AI response missing skills array");
  }

  return parsed;
}

/**
 * Perform a comprehensive resume analysis — strengths, weaknesses, and internship fit.
 *
 * @param {string}   resumeText  – raw text extracted from a PDF resume
 * @param {string[]} skills      – skills already extracted
 * @returns {Promise<Object>} analysis payload
 */
async function analyzeResume(resumeText, skills = []) {
  if (!openai) throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env");
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

  const text = completion.choices[0].message.content.trim();
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed.summary || !parsed.suitable_roles) {
    throw new Error("AI response missing required analysis fields");
  }

  return parsed;
}

module.exports = { generateAIRecommendation, extractSkillsFromResume, analyzeResume };
