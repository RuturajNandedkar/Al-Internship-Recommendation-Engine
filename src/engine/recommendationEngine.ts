import internships from "../data/internships.ts";
import { skillKeyMap, stateKeyMap, modeKeyMap, fieldSectorMap, educationHierarchy } from "../data/translations.ts";
import type { CandidateProfile, BreakdownScores } from "../services/aiService";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface RawInternship {
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
  icon?: string;
  [key: string]: unknown;
}

export interface ScoredInternship extends RawInternship {
  score: number;
  breakdown: BreakdownScores;
}

export interface EngineWeights {
  skills: number;
  field: number;
  sector: number;
  location: number;
  mode: number;
}

// ─── Configuration ──────────────────────────────────────────────────────────

const WEIGHTS: EngineWeights = {
  skills: 0.35,
  field: 0.25,
  sector: 0.20,
  location: 0.12,
  mode: 0.08,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeString(str: string | undefined): string {
  return (str || "").toLowerCase().trim();
}

function computeSkillScore(userSkillIndices: number[] | undefined, internshipSkills: string[] | undefined): number {
  if (!userSkillIndices || userSkillIndices.length === 0) return 0;
  if (!internshipSkills) return 0;

  const englishSkills = Object.keys(skillKeyMap);
  const userSkillKeys = userSkillIndices.map(
    (idx) => skillKeyMap[englishSkills[idx] as keyof typeof skillKeyMap]
  );
  const internshipNormalized = internshipSkills.map(normalizeString);

  let matchCount = 0;
  for (const skill of userSkillKeys) {
    if (!skill) continue;
    const normalized = normalizeString(skill);
    for (const iSkill of internshipNormalized) {
      if (iSkill.includes(normalized) || normalized.includes(iSkill)) {
        matchCount++;
        break;
      }
    }
  }

  return userSkillKeys.length > 0 ? matchCount / userSkillKeys.length : 0;
}

function computeFieldScore(userField: string | undefined, internship: RawInternship): number {
  if (!userField) return 0.3; // neutral if not specified

  const relatedSectors = fieldSectorMap[userField as keyof typeof fieldSectorMap] || [];
  if (relatedSectors.includes(internship.sector)) return 1.0;

  // partial match for closely related fields
  const fieldKeywords: Record<string, string[]> = {
    science: ["science", "research", "biology", "chemistry", "lab"],
    commerce: ["finance", "banking", "accounting", "commerce", "economics"],
    arts: ["writing", "communication", "social", "teaching", "education"],
    engineering: ["engineering", "programming", "software", "technical", "civil", "mechanical", "electrical"],
    medical: ["medical", "healthcare", "nursing", "pharmacy", "patient"],
    law: ["law", "legal", "constitution", "judiciary"],
    design: ["design", "creative", "graphic", "UI/UX", "art"],
    agriculture: ["agriculture", "farming", "crop", "botany"],
    education: ["teaching", "education", "training", "pedagogy"],
  };

  const keywords = fieldKeywords[userField] || [];
  const internshipSkills = internship.skills || [];
  const skillMatch = internshipSkills.some((s) =>
    keywords.some((k) => normalizeString(s).includes(k))
  );

  return skillMatch ? 0.6 : 0.1;
}

function computeSectorScore(userSector: string | undefined, internshipSector: string | undefined): number {
  if (!userSector || userSector === "all") return 0.5; // neutral
  return userSector === internshipSector ? 1.0 : 0.0;
}

function computeLocationScore(userLocationIdx: number | undefined, internship: RawInternship): number {
  if (userLocationIdx === undefined || userLocationIdx === 0) return 0.5; // "Any Location"

  const userState = stateKeyMap[userLocationIdx];
  if (!userState || userState === "Any Location") return 0.5;

  if (internship.state === "Pan India") return 0.8;
  if (internship.state === userState) return 1.0;

  return 0.15;
}

function computeModeScore(userModeIdx: number | undefined, internship: RawInternship): number {
  if (userModeIdx === undefined || userModeIdx === 0) return 0.5; // "Any Mode"

  const userMode = modeKeyMap[userModeIdx];
  if (!userMode || userMode === "Any Mode") return 0.5;

  return internship.mode === userMode ? 1.0 : 0.2;
}

function computeEducationFit(userEducation: string | undefined, internship: RawInternship): number {
  if (!userEducation) return 0.5;

  const level = educationHierarchy[userEducation as keyof typeof educationHierarchy] || 4;
  const internshipEd = internship.education || [];

  const hasAnyGraduate = internshipEd.some(
    (e) => normalizeString(e) === "any graduate"
  );
  if (hasAnyGraduate && level >= 4) return 1.0;

  const has12thPass = internshipEd.some(
    (e) => normalizeString(e) === "12th pass"
  );
  if (has12thPass && level >= 2) return 0.8;

  if (level >= 4) return 0.7; // most internships accept graduates
  return 0.4;
}

/**
 * Fallback recommendation engine using weighted multi-factor scoring.
 * Used when Gemini AI API or backend is unavailable.
 */
export function getRecommendations(
  profile: CandidateProfile,
  maxResults: number = 5
): ScoredInternship[] {
  const { education, field, skills, sector, locationIdx, modeIdx } = profile;

  // Assuming imported `internships` array acts as our database
  const scored: ScoredInternship[] = internships.map((internshipShape) => {
    // Typecast from raw JSON shape
    const internship = internshipShape as RawInternship;

    const skillScore = computeSkillScore(skills, internship.skills);
    const fieldScore = computeFieldScore(field, internship);
    const sectorScore = computeSectorScore(sector, internship.sector);
    const locationScore = computeLocationScore(locationIdx, internship);
    const modeScore = computeModeScore(modeIdx, internship);
    const educationFit = computeEducationFit(education, internship);

    // Weighted score with education as a multiplier
    const rawScore =
      WEIGHTS.skills * skillScore +
      WEIGHTS.field * fieldScore +
      WEIGHTS.sector * sectorScore +
      WEIGHTS.location * locationScore +
      WEIGHTS.mode * modeScore;

    const finalScore = rawScore * (0.5 + 0.5 * educationFit);

    return {
      ...internship,
      score: Math.round(finalScore * 100),
      breakdown: {
        skills: Math.round(skillScore * 100),
        field: Math.round(fieldScore * 100),
        sector: Math.round(sectorScore * 100),
        location: Math.round(locationScore * 100),
        mode: Math.round(modeScore * 100),
        education: Math.round(educationFit * 100),
      },
    };
  });

  // Sort by score descending and return top results
  scored.sort((a, b) => b.score - a.score);

  // Return 3-5 results (at least 3 if available, up to maxResults)
  const minResults = Math.min(3, scored.length);
  const results = scored.slice(0, Math.max(minResults, maxResults));

  // Filter out very low scores (below 15%) unless we'd have fewer than 3
  const filtered = results.filter((r) => r.score >= 15);
  return filtered.length >= minResults ? filtered : results.slice(0, minResults);
}
