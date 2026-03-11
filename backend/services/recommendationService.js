const Internship = require("../models/Internship");
const logger = require("../utils/logger");

// ─────────────────────────────────────────────────────────────────────────────
// AI-Based Internship Recommendation Engine  v2.0
//
// Multi-factor scoring with TF-IDF–inspired term weighting, cosine similarity,
// location matching, experience calibration, and confidence scoring.
//
// Scoring formula (per internship):
//   score = (W1 × skill_match) + (W2 × domain_match) + (W3 × interest_match)
//         + (W4 × location_match) + experience_bonus + recency_bonus
//
// Each sub-score ∈ [0, 1].  Final score is scaled to 0 – 100.
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHTS = {
  skill: 0.40,
  domain: 0.20,
  interest: 0.15,
  location: 0.10,
  experience: 0.10,
  recency: 0.05,
};

const EXPERIENCE_BONUS = { beginner: 0.03, intermediate: 0.06, advanced: 0.10 };

const RELATED_DOMAINS = {
  AI: ["Machine Learning", "Data Science", "NLP"],
  "Machine Learning": ["AI", "Data Science", "NLP"],
  "Data Science": ["AI", "Machine Learning", "Data Engineering"],
  "Data Engineering": ["Data Science", "Cloud", "DevOps"],
  NLP: ["AI", "Machine Learning"],
  "Web Development": ["UI/UX Design", "Mobile Development", "Full Stack"],
  "Full Stack": ["Web Development", "Mobile Development"],
  "Mobile Development": ["Web Development", "UI/UX Design"],
  "UI/UX Design": ["Web Development", "Mobile Development", "Product Design"],
  "Product Design": ["UI/UX Design"],
  Cybersecurity: ["Cloud", "DevOps", "Network Security"],
  "Network Security": ["Cybersecurity"],
  Cloud: ["DevOps", "Cybersecurity", "Data Engineering"],
  DevOps: ["Cloud", "Cybersecurity", "SRE"],
  SRE: ["DevOps", "Cloud"],
  Blockchain: ["Web Development", "Fintech"],
  Fintech: ["Blockchain", "Web Development"],
  IoT: ["Cloud", "AI", "Embedded Systems"],
  "Embedded Systems": ["IoT"],
  "Game Development": ["Mobile Development", "3D Graphics"],
  "3D Graphics": ["Game Development"],
};

// Skill synonyms for fuzzy matching
const SKILL_SYNONYMS = {
  js: "javascript", ts: "typescript", py: "python",
  "node": "node.js", "react.js": "react", "vue.js": "vue",
  "angular.js": "angular", "express.js": "express",
  ml: "machine learning", dl: "deep learning",
  "artificial intelligence": "ai", k8s: "kubernetes",
  postgres: "postgresql", mongo: "mongodb",
  "amazon web services": "aws", "google cloud": "gcp",
  "ci/cd": "cicd", "ci cd": "cicd",
};

// ─── Helper utilities ───────────────────────────────────────────────────────

function norm(str) {
  return (str || "").toLowerCase().trim();
}

function tokenize(str) {
  return new Set(
    norm(str)
      .split(/[\s,\-\/\.]+/)
      .filter((w) => w.length >= 2)
  );
}

function resolveAlias(skill) {
  const n = norm(skill);
  return SKILL_SYNONYMS[n] || n;
}

// ─── TF-IDF–inspired term weighting ────────────────────────────────────────

/**
 * Build an inverse-document-frequency map across all internships.
 * Rare skills get higher weight — matching a niche skill is more signal.
 */
function buildIDF(internships) {
  const docCount = internships.length || 1;
  const freq = {};
  for (const intern of internships) {
    const seen = new Set();
    for (const skill of intern.required_skills || []) {
      const key = resolveAlias(skill);
      if (!seen.has(key)) { freq[key] = (freq[key] || 0) + 1; seen.add(key); }
    }
  }
  const idf = {};
  for (const [term, df] of Object.entries(freq)) {
    idf[term] = Math.log(docCount / df) + 1; // smoothed IDF
  }
  return idf;
}

/**
 * Cosine similarity between two TF-IDF vectors.
 */
function cosineSim(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  for (const k of keys) {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? dot / denom : 0;
}

function jaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) if (setB.has(item)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// ─── Sub-score functions ────────────────────────────────────────────────────

/**
 * Skill Match Score (0 – 1) using TF-IDF cosine similarity + coverage.
 *
 * Three-pass matching:
 *  1. TF-IDF cosine similarity — rare skill matches valued higher
 *  2. Substring coverage — fraction of required skills the student covers
 *  3. Token-level Jaccard — catches partial overlaps ("Node.js" ↔ "Node")
 *
 * Final = 50% cosine + 30% coverage + 20% Jaccard
 */
function computeSkillScore(userSkills, requiredSkills, idf) {
  if (!userSkills || userSkills.length === 0) return 0;
  if (!requiredSkills || requiredSkills.length === 0) return 0;

  const userNorm = userSkills.map(resolveAlias);
  const reqNorm = requiredSkills.map(resolveAlias);

  // Pass 1 — TF-IDF cosine similarity
  const userVec = {};
  for (const s of userNorm) userVec[s] = (userVec[s] || 0) + (idf[s] || 1);
  const reqVec = {};
  for (const s of reqNorm) reqVec[s] = (reqVec[s] || 0) + (idf[s] || 1);
  const cosScore = cosineSim(userVec, reqVec);

  // Pass 2 — substring coverage
  let hits = 0;
  for (const req of reqNorm) {
    if (userNorm.some((us) => us.includes(req) || req.includes(us))) hits++;
  }
  const coverageScore = hits / reqNorm.length;

  // Pass 3 — token-level Jaccard
  const userTokens = new Set();
  for (const s of userNorm) for (const t of tokenize(s)) userTokens.add(t);
  const reqTokens = new Set();
  for (const s of reqNorm) for (const t of tokenize(s)) reqTokens.add(t);
  const jaccardScore = jaccard(userTokens, reqTokens);

  return 0.50 * cosScore + 0.30 * coverageScore + 0.20 * jaccardScore;
}

function computeDomainScore(preferredDomain, internshipDomain) {
  if (!preferredDomain || norm(preferredDomain) === "all") return 0.5;
  if (norm(preferredDomain) === norm(internshipDomain)) return 1.0;
  const related = RELATED_DOMAINS[preferredDomain] || [];
  if (related.some((d) => norm(d) === norm(internshipDomain))) return 0.6;
  return 0.0;
}

function computeInterestScore(interests, internship) {
  if (!interests || interests.length === 0) return 0.3;

  const interestTokens = new Set();
  for (const i of interests) for (const t of tokenize(i)) interestTokens.add(t);

  const internshipText = [
    internship.title,
    internship.description,
    internship.domain,
    ...(internship.required_skills || []),
  ].join(" ");
  const internshipTokens = tokenize(internshipText);

  return jaccard(interestTokens, internshipTokens);
}

/**
 * Location Match Score (0 – 1)
 * Exact city → 1.0 | Same region → 0.6 | Remote → 0.8 | No pref → 0.5
 */
function computeLocationScore(userLocation, internshipLocation) {
  if (!userLocation) return 0.5;
  const uLoc = norm(userLocation);
  const iLoc = norm(internshipLocation || "");
  if (iLoc.includes("remote")) return 0.8;
  if (!iLoc) return 0.3;
  if (iLoc.includes(uLoc) || uLoc.includes(iLoc)) return 1.0;
  // Same country/region partial match
  const uTokens = tokenize(uLoc);
  const iTokens = tokenize(iLoc);
  const overlap = jaccard(uTokens, iTokens);
  return overlap > 0 ? 0.4 + overlap * 0.6 : 0.2;
}

/**
 * Experience Match Score (0 – 1)
 * Maps experience level to role complexity (skill count as proxy).
 */
function computeExperienceScore(experienceLevel, requiredSkillCount) {
  const level = norm(experienceLevel);
  // Ideal skill count ranges per level
  const ranges = { beginner: [1, 3], intermediate: [3, 5], advanced: [4, 8] };
  const [min, max] = ranges[level] || [1, 5];
  if (requiredSkillCount >= min && requiredSkillCount <= max) return 1.0;
  if (requiredSkillCount < min) return 0.7;
  // Overqualified — slight penalty
  const overshoot = requiredSkillCount - max;
  return Math.max(0.2, 1.0 - overshoot * 0.15);
}

/**
 * Recency Score (0 – 1) based on when internship was posted.
 * Newer postings get higher scores. Falls back to 0.5 if no date is present.
 */
function computeRecencyScore(internship) {
  if (!internship.createdAt) return 0.5;
  const daysSince = (Date.now() - new Date(internship.createdAt).getTime()) / 86400000;
  if (daysSince <= 7) return 1.0;
  if (daysSince <= 30) return 0.8;
  if (daysSince <= 90) return 0.5;
  return 0.3;
}

/**
 * Confidence score — how reliable is this recommendation?
 * Based on data completeness and score variance.
 */
function computeConfidence(breakdown, profile) {
  let factors = 0;
  let filled = 0;
  if (profile.skills?.length > 0) { factors++; filled++; } else { factors++; }
  if (profile.preferred_domain && profile.preferred_domain !== "all") { factors++; filled++; } else { factors++; }
  if (profile.interests?.length > 0) { factors++; filled++; } else { factors++; }
  if (profile.location) { factors++; filled++; } else { factors++; }
  const completeness = filled / factors;
  // Higher variance in breakdown = less confident
  const values = Object.values(breakdown);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const consistency = Math.max(0, 1 - variance / 2500);
  return Math.round((completeness * 0.6 + consistency * 0.4) * 100);
}

// ─── Main recommendation function ──────────────────────────────────────────

/**
 * Generate the top-N internship recommendations for a student profile.
 *
 * @param {Object}   profile
 * @param {string[]} profile.skills            – student's technical/soft skills
 * @param {string[]} profile.interests         – free-text interests
 * @param {string}   profile.preferred_domain  – e.g. "AI", "Web Development", "all"
 * @param {string}   profile.experience_level  – "beginner" | "intermediate" | "advanced"
 * @param {string}   [profile.location]        – preferred location
 * @param {number}   [maxResults=5]            – how many results to return
 * @returns {Promise<Object>} { recommendations, metadata }
 */
async function getRecommendations(profile, maxResults = 5) {
  const {
    skills = [],
    interests = [],
    preferred_domain = "all",
    experience_level = "beginner",
    location = "",
  } = profile;

  const internships = await Internship.find({}).lean();
  const idf = buildIDF(internships);

  const scored = internships.map((internship) => {
    const skillScore = computeSkillScore(skills, internship.required_skills, idf);
    const domainScore = computeDomainScore(preferred_domain, internship.domain);
    const interestScore = computeInterestScore(interests, internship);
    const locationScore = computeLocationScore(location, internship.location);
    const experienceScore = computeExperienceScore(
      experience_level,
      (internship.required_skills || []).length
    );
    const recencyScore = computeRecencyScore(internship);

    const rawScore = Math.min(
      1.0,
      WEIGHTS.skill * skillScore +
      WEIGHTS.domain * domainScore +
      WEIGHTS.interest * interestScore +
      WEIGHTS.location * locationScore +
      WEIGHTS.experience * experienceScore +
      WEIGHTS.recency * recencyScore
    );

    const breakdown = {
      skill_match: Math.round(skillScore * 100),
      domain_match: Math.round(domainScore * 100),
      interest_match: Math.round(interestScore * 100),
      location_match: Math.round(locationScore * 100),
      experience_fit: Math.round(experienceScore * 100),
      recency: Math.round(recencyScore * 100),
    };

    // Identify which user skills matched and which are gaps
    const userNorm = skills.map(resolveAlias);
    const reqNorm = (internship.required_skills || []).map(resolveAlias);
    const matchedSkills = reqNorm.filter((r) =>
      userNorm.some((u) => u.includes(r) || r.includes(u))
    );
    const missingSkills = reqNorm.filter((r) =>
      !userNorm.some((u) => u.includes(r) || r.includes(u))
    );

    return {
      ...internship,
      score: Math.round(rawScore * 100),
      breakdown,
      confidence: computeConfidence(breakdown, profile),
      matchedSkills,
      missingSkills,
      reasoning: generateReasoning(internship, breakdown, matchedSkills, missingSkills),
    };
  });

  scored.sort(
    (a, b) => b.score - a.score || b.confidence - a.confidence || b.breakdown.skill_match - a.breakdown.skill_match
  );

  const minResults = Math.min(3, scored.length);
  const top = scored.slice(0, Math.max(minResults, maxResults));
  const filtered = top.filter((r) => r.score >= 10);
  const results = filtered.length >= minResults ? filtered : top.slice(0, minResults);

  const metadata = {
    totalInternships: internships.length,
    algorithmVersion: "2.0",
    scoringFactors: Object.keys(WEIGHTS).length,
    weights: WEIGHTS,
    averageScore: Math.round(results.reduce((s, r) => s + r.score, 0) / results.length),
    topDomains: [...new Set(results.map((r) => r.domain))],
    timestamp: new Date().toISOString(),
  };

  logger.info("Recommendations generated", {
    profile: { skills: skills.length, domain: preferred_domain, level: experience_level },
    results: results.length,
    avgScore: metadata.averageScore,
  });

  return results;
}

/**
 * Generate human-readable reasoning for a recommendation.
 */
function generateReasoning(internship, breakdown, matched, missing) {
  const parts = [];

  // Skills analysis
  if (breakdown.skill_match >= 70) {
    parts.push(`Strong skill alignment — you match ${matched.length} of ${matched.length + missing.length} required skills (${matched.join(", ")})`);
  } else if (breakdown.skill_match >= 40) {
    parts.push(`You have ${matched.length} matching skills (${matched.join(", ")}). To strengthen your candidacy, consider learning ${missing.slice(0, 3).join(", ")}`);
  } else if (matched.length > 0) {
    parts.push(`You have some relevant skills (${matched.join(", ")}), and this role would help you develop ${missing.slice(0, 2).join(", ")}`);
  }

  // Domain analysis
  if (breakdown.domain_match >= 80) {
    parts.push(`This ${internship.domain} role directly aligns with your preferred domain`);
  } else if (breakdown.domain_match >= 50) {
    parts.push(`This ${internship.domain} role is closely related to your area of interest`);
  }

  // Location
  if (breakdown.location_match >= 80) {
    parts.push(`the location (${internship.location}) matches your preference`);
  }

  // Experience fit
  if (breakdown.experience_fit >= 80) {
    parts.push(`the role's complexity is well-suited for your experience level`);
  }

  // Growth opportunity
  if (missing.length > 0 && missing.length <= 3) {
    parts.push(`Great growth opportunity — you'd gain experience in ${missing.join(", ")}`);
  }

  if (parts.length === 0) {
    return `This ${internship.domain} role at ${internship.company} could broaden your skillset and introduce you to new technologies in the ${internship.domain} space.`;
  }

  return parts.join(". ") + ".";
}

module.exports = { getRecommendations, buildIDF, cosineSim, computeSkillScore };
