import Internship, { IInternship } from "../models/Internship";
import logger from "../utils/logger";
import redis from "../config/redis";
import crypto from "crypto";

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

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface UserProfile {
  skills: string[];
  interests: string[];
  preferred_domain: string;
  experience_level: string;
  location?: string;
}

export interface ScoringWeights {
  skill: number;
  domain: number;
  interest: number;
  location: number;
  experience: number;
  recency: number;
}

export interface ScoreBreakdown {
  skill_match: number;
  domain_match: number;
  interest_match: number;
  location_match: number;
  experience_fit: number;
  recency?: number;
  growth_potential?: number;
}

export interface RecommendationResult {
  _id: any;
  title?: string;
  company?: string;
  location?: string;
  domain?: string;
  required_skills?: string[];
  stipend?: string;
  duration?: string;
  application_link?: string;
  description?: string;
  createdAt?: Date;
  score: number;
  breakdown: ScoreBreakdown;
  confidence: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
  [key: string]: unknown;
}

export interface RecommendationMetadata {
  totalInternships: number;
  algorithmVersion: string;
  scoringFactors: number;
  weights: ScoringWeights;
  averageScore: number;
  topDomains: string[];
  timestamp: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const WEIGHTS: ScoringWeights = {
  skill: 0.40,
  domain: 0.20,
  interest: 0.15,
  location: 0.10,
  experience: 0.10,
  recency: 0.05,
};

const EXPERIENCE_BONUS: Record<string, number> = {
  beginner: 0.03,
  intermediate: 0.06,
  advanced: 0.10,
};

const RELATED_DOMAINS: Record<string, string[]> = {
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
const SKILL_SYNONYMS: Record<string, string> = {
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

function norm(str: string | undefined | null): string {
  return (str || "").toLowerCase().trim();
}

function tokenize(str: string): Set<string> {
  return new Set(
    norm(str)
      .split(/[\s,\-\/\.]+/)
      .filter((w) => w.length >= 2)
  );
}

function resolveAlias(skill: string): string {
  const n = norm(skill);
  return SKILL_SYNONYMS[n] || n;
}

// ─── TF-IDF–inspired term weighting ────────────────────────────────────────

interface IDFMap {
  [term: string]: number;
}

interface TFIDFVector {
  [term: string]: number;
}

/**
 * Build an inverse-document-frequency map across all internships.
 * Rare skills get higher weight — matching a niche skill is more signal.
 */
function buildIDF(internships: Array<{ required_skills?: string[] }>): IDFMap {
  const docCount = internships.length || 1;
  const freq: Record<string, number> = {};
  for (const intern of internships) {
    const seen = new Set<string>();
    for (const skill of intern.required_skills || []) {
      const key = resolveAlias(skill);
      if (!seen.has(key)) { freq[key] = (freq[key] || 0) + 1; seen.add(key); }
    }
  }
  const idf: IDFMap = {};
  for (const [term, df] of Object.entries(freq)) {
    idf[term] = Math.log(docCount / df) + 1; // smoothed IDF
  }
  return idf;
}

/**
 * Cosine similarity between two TF-IDF vectors.
 */
function cosineSim(vecA: TFIDFVector, vecB: TFIDFVector): number {
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

function jaccard(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) if (setB.has(item)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// ─── Sub-score functions ────────────────────────────────────────────────────

/**
 * Skill Match Score (0 – 1) using TF-IDF cosine similarity + coverage.
 */
function computeSkillScore(
  userSkills: string[],
  requiredSkills: string[],
  idf: IDFMap
): number {
  if (!userSkills || userSkills.length === 0) return 0;
  if (!requiredSkills || requiredSkills.length === 0) return 0;

  const userNorm = userSkills.map(resolveAlias);
  const reqNorm = requiredSkills.map(resolveAlias);

  // Pass 1 — TF-IDF cosine similarity
  const userVec: TFIDFVector = {};
  for (const s of userNorm) userVec[s] = (userVec[s] || 0) + (idf[s] || 1);
  const reqVec: TFIDFVector = {};
  for (const s of reqNorm) reqVec[s] = (reqVec[s] || 0) + (idf[s] || 1);
  const cosScore = cosineSim(userVec, reqVec);

  // Pass 2 — substring coverage
  let hits = 0;
  for (const req of reqNorm) {
    if (userNorm.some((us) => us.includes(req) || req.includes(us))) hits++;
  }
  const coverageScore = hits / reqNorm.length;

  // Pass 3 — token-level Jaccard
  const userTokens = new Set<string>();
  for (const s of userNorm) for (const t of tokenize(s)) userTokens.add(t);
  const reqTokens = new Set<string>();
  for (const s of reqNorm) for (const t of tokenize(s)) reqTokens.add(t);
  const jaccardScore = jaccard(userTokens, reqTokens);

  return 0.50 * cosScore + 0.30 * coverageScore + 0.20 * jaccardScore;
}

function computeDomainScore(
  preferredDomain: string | undefined,
  internshipDomain: string | undefined
): number {
  if (!preferredDomain || norm(preferredDomain) === "all") return 0.5;
  if (norm(preferredDomain) === norm(internshipDomain)) return 1.0;
  const related = RELATED_DOMAINS[preferredDomain] || [];
  if (related.some((d) => norm(d) === norm(internshipDomain))) return 0.6;
  return 0.0;
}

function computeInterestScore(
  interests: string[] | undefined,
  internship: { title?: string; description?: string; domain?: string; required_skills?: string[] }
): number {
  if (!interests || interests.length === 0) return 0.3;

  const interestTokens = new Set<string>();
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
 */
function computeLocationScore(
  userLocation: string | undefined,
  internshipLocation: string | undefined
): number {
  if (!userLocation) return 0.5;
  const uLoc = norm(userLocation);
  const iLoc = norm(internshipLocation || "");
  if (iLoc.includes("remote")) return 0.8;
  if (!iLoc) return 0.3;
  if (iLoc.includes(uLoc) || uLoc.includes(iLoc)) return 1.0;
  const uTokens = tokenize(uLoc);
  const iTokens = tokenize(iLoc);
  const overlap = jaccard(uTokens, iTokens);
  return overlap > 0 ? 0.4 + overlap * 0.6 : 0.2;
}

/**
 * Experience Match Score (0 – 1)
 */
function computeExperienceScore(
  experienceLevel: string | undefined,
  requiredSkillCount: number
): number {
  const level = norm(experienceLevel);
  const ranges: Record<string, [number, number]> = {
    beginner: [1, 3],
    intermediate: [3, 5],
    advanced: [4, 8],
  };
  const [min, max] = ranges[level] || [1, 5];
  if (requiredSkillCount >= min && requiredSkillCount <= max) return 1.0;
  if (requiredSkillCount < min) return 0.7;
  const overshoot = requiredSkillCount - max;
  return Math.max(0.2, 1.0 - overshoot * 0.15);
}

/**
 * Recency Score (0 – 1).
 */
function computeRecencyScore(internship: { createdAt?: Date | string }): number {
  if (!internship.createdAt) return 0.5;
  const daysSince = (Date.now() - new Date(internship.createdAt).getTime()) / 86400000;
  if (daysSince <= 7) return 1.0;
  if (daysSince <= 30) return 0.8;
  if (daysSince <= 90) return 0.5;
  return 0.3;
}

/**
 * Confidence score — how reliable is this recommendation?
 */
function computeConfidence(
  breakdown: ScoreBreakdown,
  profile: UserProfile
): number {
  let factors = 0;
  let filled = 0;
  if (profile.skills?.length > 0) { factors++; filled++; } else { factors++; }
  if (profile.preferred_domain && profile.preferred_domain !== "all") { factors++; filled++; } else { factors++; }
  if (profile.interests?.length > 0) { factors++; filled++; } else { factors++; }
  if (profile.location) { factors++; filled++; } else { factors++; }
  const completeness = filled / factors;
  const values = Object.values(breakdown);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const consistency = Math.max(0, 1 - variance / 2500);
  return Math.round((completeness * 0.6 + consistency * 0.4) * 100);
}

// ─── Main recommendation function ──────────────────────────────────────────

/**
 * Generate the top-N internship recommendations for a student profile.
 */
async function getRecommendations(
  profile: UserProfile,
  maxResults: number = 5
): Promise<RecommendationResult[]> {
  const {
    skills = [],
    interests = [],
    preferred_domain = "all",
    experience_level = "beginner",
    location = "",
  } = profile;

  // 1. Generate cache key based on user profile
  const profileHash = crypto
    .createHash("md5")
    .update(JSON.stringify({ skills, interests, preferred_domain, experience_level, location }))
    .digest("hex");
  const cacheKey = `recommendations:${profileHash}`;

  // 2. Try to get from cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info("Serving recommendations from cache", { profileHash });
      return JSON.parse(cached);
    }
  } catch (err: any) {
    logger.error("Redis cache get error", { error: err.message });
  }

  const internships = await Internship.find({}).lean();
  const idf = buildIDF(internships);

  const scored: RecommendationResult[] = internships.map((internship) => {
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

    const breakdown: ScoreBreakdown = {
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
    (a, b) =>
      b.score - a.score ||
      b.confidence - a.confidence ||
      b.breakdown.skill_match - a.breakdown.skill_match
  );

  const minResults = Math.min(3, scored.length);
  const top = scored.slice(0, Math.max(minResults, maxResults));
  const filtered = top.filter((r) => r.score >= 10);
  const results = filtered.length >= minResults ? filtered : top.slice(0, minResults);

  const metadata: RecommendationMetadata = {
    totalInternships: internships.length,
    algorithmVersion: "2.0",
    scoringFactors: Object.keys(WEIGHTS).length,
    weights: WEIGHTS,
    averageScore: Math.round(results.reduce((s, r) => s + r.score, 0) / results.length),
    topDomains: [...new Set(results.map((r) => r.domain).filter(Boolean) as string[])],
    timestamp: new Date().toISOString(),
  };
  logger.info("Recommendations generated", {
    profile: { skills: skills.length, domain: preferred_domain, level: experience_level },
    results: results.length,
    avgScore: metadata.averageScore,
  });

  // 3. Save to cache (30 minutes)
  try {
    await redis.set(cacheKey, JSON.stringify(results), "EX", 30 * 60);
  } catch (err: any) {
    logger.error("Redis cache set error", { error: err.message });
  }

  return results;
}

/**
 * Generate human-readable reasoning for a recommendation.
 */
function generateReasoning(
  internship: { domain?: string; company?: string; location?: string },
  breakdown: ScoreBreakdown,
  matched: string[],
  missing: string[]
): string {
  const parts: string[] = [];

  if (breakdown.skill_match >= 70) {
    parts.push(`Strong skill alignment — you match ${matched.length} of ${matched.length + missing.length} required skills (${matched.join(", ")})`);
  } else if (breakdown.skill_match >= 40) {
    parts.push(`You have ${matched.length} matching skills (${matched.join(", ")}). To strengthen your candidacy, consider learning ${missing.slice(0, 3).join(", ")}`);
  } else if (matched.length > 0) {
    parts.push(`You have some relevant skills (${matched.join(", ")}), and this role would help you develop ${missing.slice(0, 2).join(", ")}`);
  }

  if (breakdown.domain_match >= 80) {
    parts.push(`This ${internship.domain} role directly aligns with your preferred domain`);
  } else if (breakdown.domain_match >= 50) {
    parts.push(`This ${internship.domain} role is closely related to your area of interest`);
  }

  if (breakdown.location_match >= 80) {
    parts.push(`the location (${internship.location}) matches your preference`);
  }

  if (breakdown.experience_fit >= 80) {
    parts.push(`the role's complexity is well-suited for your experience level`);
  }

  if (missing.length > 0 && missing.length <= 3) {
    parts.push(`Great growth opportunity — you'd gain experience in ${missing.join(", ")}`);
  }

  if (parts.length === 0) {
    return `This ${internship.domain} role at ${internship.company} could broaden your skillset and introduce you to new technologies in the ${internship.domain} space.`;
  }

  return parts.join(". ") + ".";
}

export { getRecommendations, buildIDF, cosineSim, computeSkillScore };
