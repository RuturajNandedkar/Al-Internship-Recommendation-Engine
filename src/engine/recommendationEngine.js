import internships from "../data/internships";
import { skillKeyMap, stateKeyMap, modeKeyMap, fieldSectorMap, educationHierarchy } from "../data/translations";

/**
 * Fallback recommendation engine using weighted multi-factor scoring.
 * Used when Gemini AI API is unavailable.
 * Factors: skills match, education/field alignment, sector preference,
 * location preference, and work mode preference.
 */

const WEIGHTS = {
  skills: 0.35,
  field: 0.25,
  sector: 0.20,
  location: 0.12,
  mode: 0.08,
};

function normalizeString(str) {
  return str.toLowerCase().trim();
}

function computeSkillScore(userSkillIndices, internshipSkills) {
  if (!userSkillIndices || userSkillIndices.length === 0) return 0;

  const englishSkills = Object.keys(skillKeyMap);
  const userSkillKeys = userSkillIndices.map((idx) => skillKeyMap[englishSkills[idx]]);
  const internshipNormalized = internshipSkills.map(normalizeString);

  let matchCount = 0;
  for (const skill of userSkillKeys) {
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

function computeFieldScore(userField, internship) {
  if (!userField) return 0.3; // neutral if not specified

  const relatedSectors = fieldSectorMap[userField] || [];
  if (relatedSectors.includes(internship.sector)) return 1.0;

  // partial match for closely related fields
  const fieldKeywords = {
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
  const skillMatch = internship.skills.some((s) =>
    keywords.some((k) => normalizeString(s).includes(k))
  );

  return skillMatch ? 0.6 : 0.1;
}

function computeSectorScore(userSector, internshipSector) {
  if (!userSector || userSector === "all") return 0.5; // neutral
  return userSector === internshipSector ? 1.0 : 0.0;
}

function computeLocationScore(userLocationIdx, internship) {
  if (!userLocationIdx || userLocationIdx === 0) return 0.5; // "Any Location"

  const userState = stateKeyMap[userLocationIdx];
  if (!userState || userState === "Any Location") return 0.5;

  if (internship.state === "Pan India") return 0.8;
  if (internship.state === userState) return 1.0;

  return 0.15;
}

function computeModeScore(userModeIdx, internship) {
  if (!userModeIdx || userModeIdx === 0) return 0.5; // "Any Mode"

  const userMode = modeKeyMap[userModeIdx];
  if (!userMode || userMode === "Any Mode") return 0.5;

  return internship.mode === userMode ? 1.0 : 0.2;
}

function computeEducationFit(userEducation, internship) {
  const level = educationHierarchy[userEducation] || 4;
  const hasAnyGraduate = internship.education.some(
    (e) => normalizeString(e) === "any graduate"
  );
  if (hasAnyGraduate && level >= 4) return 1.0;

  const has12thPass = internship.education.some(
    (e) => normalizeString(e) === "12th pass"
  );
  if (has12thPass && level >= 2) return 0.8;

  if (level >= 4) return 0.7; // most internships accept graduates
  return 0.4;
}

export function getRecommendations(profile, maxResults = 5) {
  const { education, field, skills, sector, locationIdx, modeIdx } = profile;

  const scored = internships.map((internship) => {
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
