import { skillKeyMap, stateKeyMap, modeKeyMap, fieldSectorMap } from "../data/translations";

// ─── Configuration ──────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ─── Data Transformations ───────────────────────────────────────────────────

/**
 * Map education level to experience_level expected by backend.
 */
const EDUCATION_TO_EXPERIENCE = {
  "10th": "beginner",
  "12th": "beginner",
  diploma: "intermediate",
  bachelors: "intermediate",
  masters: "advanced",
  phd: "advanced",
};

/**
 * Map field of study to a preferred_domain string for the backend.
 */
function fieldToDomain(field) {
  const domainMap = {
    engineering: "Web Development",
    science: "Data Science",
    commerce: "Finance",
    arts: "Content Writing",
    medical: "Healthcare",
    law: "Legal",
    design: "UI/UX Design",
    agriculture: "Agriculture",
    education: "Education",
  };
  return domainMap[field] || "all";
}

/**
 * Pick a default icon based on the internship domain.
 */
function domainIcon(domain) {
  const icons = {
    AI: "🤖",
    "Machine Learning": "🧠",
    "Data Science": "📊",
    "Web Development": "🌐",
    "Mobile Development": "📱",
    "UI/UX Design": "🎨",
    Cybersecurity: "🔒",
    Cloud: "☁️",
    DevOps: "⚙️",
    Blockchain: "⛓️",
    IoT: "📡",
    "Game Development": "🎮",
    Finance: "💰",
    Healthcare: "🏥",
    Education: "📚",
    "Content Writing": "✍️",
    Legal: "⚖️",
    Agriculture: "🌾",
  };
  return icons[domain] || "💼";
}

/**
 * Convert the frontend form data into the shape the backend API expects.
 */
function transformFormToBackend(formData) {
  const { education, field, skills, sector, locationIdx } = formData;

  // Convert skill indices to skill name strings
  const englishSkills = Object.keys(skillKeyMap);
  const skillStrings = skills
    .map((idx) => skillKeyMap[englishSkills[idx]])
    .filter(Boolean);

  // Build interests from sector preference and field
  const interests = [];
  if (sector && sector !== "all") interests.push(sector);
  const relatedSectors = fieldSectorMap[field] || [];
  for (const s of relatedSectors) {
    if (!interests.includes(s)) interests.push(s);
  }

  // Map location index to string
  const location = stateKeyMap[locationIdx] || "";

  return {
    skills: skillStrings,
    interests,
    preferred_domain: fieldToDomain(field),
    experience_level: EDUCATION_TO_EXPERIENCE[education] || "beginner",
    location,
  };
}

/**
 * Convert a single backend internship result into the shape the
 * frontend RecommendationCard expects.
 */
function transformBackendResult(item, index) {
  const internship = item;
  const breakdown = item.breakdown || {};

  return {
    id: item._id || index + 1,
    title: internship.title,
    company: internship.company,
    sector: internship.domain || "General",
    location: internship.location,
    state: internship.location,
    duration: internship.duration,
    stipend: internship.stipend,
    mode: "On-site",
    skills: internship.required_skills || [],
    education: [],
    description: internship.description,
    icon: domainIcon(internship.domain),
    score: Math.round(internship.score || 0),
    reasoning: internship.reasoning || "",
    matchedSkills: internship.matchedSkills || [],
    missingSkills: internship.missingSkills || [],
    aiEnhanced: internship.aiEnhanced || false,
    breakdown: {
      skills: Math.round((breakdown.skill_match || 0)),
      field: Math.round((breakdown.domain_match || 0)),
      sector: Math.round((breakdown.interest_match || 0)),
      location: Math.round((breakdown.location_match || 0)),
      experience: Math.round((breakdown.experience_fit || 0)),
      growth: Math.round((breakdown.growth_potential || 0)),
      mode: 50,
    },
  };
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Send the candidate profile to the backend and receive recommendations.
 *
 * @param {Object} formData — raw form data from CandidateForm
 * @returns {Promise<Array>} recommendations shaped for RecommendationCard
 */
export async function getBackendRecommendations(formData) {
  const payload = transformFormToBackend(formData);

  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("ire_auth_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}/api/recommendations`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Backend error: ${res.status}`);
  }

  const json = await res.json();

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error("Unexpected response format from backend");
  }

  const results = json.data.map(transformBackendResult);

  // Attach AI usage flag from backend response
  results._aiUsed = !!json.aiUsed;

  return results;
}

/**
 * Quick health-check against the backend.
 * Returns true if the server is reachable.
 */
export async function isBackendAvailable() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
