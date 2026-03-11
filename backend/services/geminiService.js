const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

let genAI = null;
let model = null;

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(key);
    model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });
  }
  return model;
}

function isGeminiAvailable() {
  return !!getModel();
}

/**
 * Use Gemini AI to re-rank and add personalized reasoning to internship
 * recommendations that were pre-filtered by the algorithmic engine.
 *
 * @param {Object}   profile        – the student's profile
 * @param {Object[]} internships    – top internships from the algorithmic engine
 * @returns {Promise<Object[]|null>} AI-enhanced internships or null on failure
 */
async function enhanceWithAI(profile, internships) {
  const ai = getModel();
  if (!ai) return null;

  const { skills = [], interests = [], preferred_domain, experience_level, location } = profile;

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
    } catch (firstErr) {
      // Retry once after delay on rate limit (429)
      if (firstErr.message && firstErr.message.includes("429")) {
        logger.info("Gemini rate limited, retrying in 10 seconds...");
        await new Promise((r) => setTimeout(r, 10000));
        result = await ai.generateContent(prompt);
      } else {
        throw firstErr;
      }
    }

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      logger.warn("Gemini returned non-array response");
      return null;
    }

    // Merge AI enhancements back into the original internship objects
    const enhanced = [];
    for (const aiItem of parsed) {
      const original = internships.find(
        (i) => String(i._id) === String(aiItem._id)
      );
      if (!original) continue;

      enhanced.push({
        ...original,
        score: Math.max(0, Math.min(100, Math.round(aiItem.score))),
        reasoning: aiItem.reasoning || original.reasoning,
        breakdown: {
          skill_match: Math.round(aiItem.breakdown?.skill_match || 0),
          domain_match: Math.round(aiItem.breakdown?.domain_match || 0),
          interest_match: Math.round(aiItem.breakdown?.interest_match || 0),
          location_match: Math.round(aiItem.breakdown?.location_match || 0),
          experience_fit: Math.round(aiItem.breakdown?.experience_fit || 0),
          growth_potential: Math.round(aiItem.breakdown?.growth_potential || 0),
        },
        matchedSkills: aiItem.matched_skills || original.matchedSkills || [],
        missingSkills: aiItem.skills_to_learn || original.missingSkills || [],
        aiEnhanced: true,
      });
    }

    enhanced.sort((a, b) => b.score - a.score);
    logger.info("Gemini AI enhanced recommendations", { count: enhanced.length });
    return enhanced.length > 0 ? enhanced : null;
  } catch (err) {
    logger.warn("Gemini AI enhancement failed", { error: err.message });
    return null;
  }
}

module.exports = { enhanceWithAI, isGeminiAvailable };
