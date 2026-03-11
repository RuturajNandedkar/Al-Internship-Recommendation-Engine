const OpenAI = require("openai");
const logger = require("../utils/logger");

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// ─── Domain skill requirements for offline fallback ─────────────────────────
const DOMAIN_REQUIREMENTS = {
  AI: {
    core: ["Python", "TensorFlow", "PyTorch", "Linear Algebra", "Statistics"],
    intermediate: ["NLP", "Computer Vision", "Deep Learning", "Scikit-learn"],
    advanced: ["Transformers", "MLOps", "Model Deployment", "Research Papers"],
  },
  "Web Development": {
    core: ["HTML", "CSS", "JavaScript", "Git", "REST APIs"],
    intermediate: ["React", "Node.js", "SQL", "TypeScript", "Testing"],
    advanced: ["System Design", "GraphQL", "CI/CD", "Docker", "Performance Optimization"],
  },
  "Data Science": {
    core: ["Python", "SQL", "Statistics", "Pandas", "Data Visualization"],
    intermediate: ["Machine Learning", "Scikit-learn", "Jupyter", "Feature Engineering"],
    advanced: ["Deep Learning", "A/B Testing", "Big Data", "Apache Spark"],
  },
  Cybersecurity: {
    core: ["Linux", "Networking", "TCP/IP", "Encryption", "Security Fundamentals"],
    intermediate: ["Penetration Testing", "SIEM", "Wireshark", "OWASP"],
    advanced: ["Threat Modeling", "Incident Response", "Cloud Security", "Reverse Engineering"],
  },
  Cloud: {
    core: ["Linux", "Networking", "One Cloud Provider (AWS/Azure/GCP)", "Docker", "Git"],
    intermediate: ["Kubernetes", "Terraform", "CI/CD", "IAM", "Monitoring"],
    advanced: ["Multi-cloud", "Service Mesh", "Cost Optimization", "Disaster Recovery"],
  },
  DevOps: {
    core: ["Linux", "Git", "Docker", "Shell Scripting", "CI/CD Basics"],
    intermediate: ["Kubernetes", "Terraform", "Monitoring", "Jenkins/GitHub Actions"],
    advanced: ["GitOps", "Service Mesh", "SRE Practices", "Chaos Engineering"],
  },
  "Mobile Development": {
    core: ["One Language (Swift/Kotlin/Dart)", "UI Components", "REST APIs", "Git"],
    intermediate: ["State Management", "Local Storage", "Testing", "Push Notifications"],
    advanced: ["Performance Optimization", "CI/CD", "App Store Deployment", "Native Modules"],
  },
  Blockchain: {
    core: ["JavaScript", "Cryptography Basics", "Ethereum", "Solidity"],
    intermediate: ["Smart Contracts", "Web3.js", "Hardhat", "DeFi Concepts"],
    advanced: ["Security Auditing", "Layer 2", "Cross-chain", "Tokenomics"],
  },
  "Machine Learning": {
    core: ["Python", "Linear Algebra", "Statistics", "Pandas", "NumPy"],
    intermediate: ["Scikit-learn", "TensorFlow/PyTorch", "Feature Engineering", "Model Evaluation"],
    advanced: ["MLOps", "Model Serving", "AutoML", "Distributed Training"],
  },
};

/**
 * Generate a detailed skill gap analysis for a student.
 * Uses AI when available, with rule-based fallback.
 */
async function analyzeSkillGaps(profile) {
  const {
    skills = [],
    interests = [],
    experience_level = "beginner",
    preferred_domain = "all",
  } = profile;

  try {
    return await generateAISkillGapAnalysis(profile);
  } catch (error) {
    logger.warn("AI skill gap analysis failed, using rule-based fallback", {
      error: error.message,
    });
    return generateRuleBasedAnalysis(skills, interests, experience_level, preferred_domain);
  }
}

/**
 * AI-powered skill gap analysis via OpenAI.
 */
async function generateAISkillGapAnalysis(profile) {
  const { skills = [], interests = [], experience_level = "beginner", preferred_domain = "all" } = profile;

  const prompt = `You are an expert career coach and technical skills analyst.

STUDENT PROFILE:
- Current Skills: ${skills.join(", ") || "None specified"}
- Interests: ${interests.join(", ") || "General"}
- Experience Level: ${experience_level}
- Target Domain: ${preferred_domain}

Perform a thorough SKILL GAP ANALYSIS. Respond with ONLY valid JSON (no markdown, no code fences):
{
  "summary": "2-3 sentence overall assessment of the student's readiness",
  "readiness_score": 65,
  "current_strengths": [
    {
      "skill": "Skill name",
      "level": "Beginner|Intermediate|Advanced",
      "relevance": "High|Medium|Low",
      "note": "How this skill helps in their target domain"
    }
  ],
  "skill_gaps": [
    {
      "skill": "Missing skill name",
      "importance": "Critical|High|Medium|Low",
      "category": "Technical|Soft|Domain|Tool",
      "reason": "Why this skill is critical for their goals",
      "estimated_time": "2-4 weeks",
      "resources": [
        { "name": "Resource name", "url": "https://...", "type": "Course|Tutorial|Docs|Video", "free": true }
      ]
    }
  ],
  "learning_path": [
    {
      "phase": 1,
      "title": "Foundation Phase",
      "duration": "2-3 weeks",
      "skills_to_learn": ["Skill 1", "Skill 2"],
      "milestones": ["Build a basic project", "Complete course X"],
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "recommended_projects": [
    {
      "title": "Project name",
      "description": "Brief description",
      "skills_practiced": ["Skill 1", "Skill 2"],
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimated_hours": 20,
      "github_worthy": true
    }
  ],
  "industry_insights": {
    "trending_skills": ["Skill trending up in this domain"],
    "job_market_demand": "High|Medium|Low",
    "salary_range_entry": "$XX,000 - $XX,000",
    "top_hiring_companies": ["Company 1", "Company 2"]
  }
}

Requirements:
- readiness_score: 0-100 how ready they are for internships in their target domain
- current_strengths: analyze each provided skill (max 8)
- skill_gaps: identify 4-8 critical missing skills, ranked by importance (use Critical/High/Medium/Low)
- learning_path: 3-4 phases from current level to internship-ready
- recommended_projects: 3-5 portfolio projects with estimated hours
- industry_insights: current domain trends and market data
- Be specific, realistic, and actionable
- Include free resources whenever possible`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a career skills analyst AI. Respond with valid JSON only." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  const text = completion.choices[0].message.content.trim();
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!parsed.skill_gaps || !parsed.learning_path) {
    throw new Error("AI response missing required skill gap fields");
  }

  logger.info("AI skill gap analysis generated", {
    skills: skills.length,
    domain: preferred_domain,
    gaps: parsed.skill_gaps.length,
    readiness: parsed.readiness_score,
  });

  return parsed;
}

/**
 * Rule-based skill gap analysis fallback (no AI required).
 */
function generateRuleBasedAnalysis(skills, interests, experienceLevel, domain) {
  const userSkills = new Set(skills.map((s) => s.toLowerCase()));
  const requirements = DOMAIN_REQUIREMENTS[domain] || DOMAIN_REQUIREMENTS["Web Development"];

  const allRequired = [...requirements.core, ...requirements.intermediate, ...requirements.advanced];
  const matched = allRequired.filter((s) => userSkills.has(s.toLowerCase()));
  const missing = allRequired.filter((s) => !userSkills.has(s.toLowerCase()));

  const readinessScore = Math.round((matched.length / allRequired.length) * 100);

  const currentStrengths = matched.map((skill) => ({
    skill,
    level: experienceLevel === "advanced" ? "Advanced" : experienceLevel === "intermediate" ? "Intermediate" : "Beginner",
    relevance: requirements.core.includes(skill) ? "High" : "Medium",
    note: `Relevant ${requirements.core.includes(skill) ? "core" : "supplementary"} skill for ${domain}`,
  }));

  const skillGaps = missing.map((skill, idx) => {
    const isCritical = requirements.core.includes(skill);
    return {
      skill,
      importance: isCritical ? "Critical" : requirements.intermediate.includes(skill) ? "High" : "Medium",
      category: "Technical",
      reason: `${isCritical ? "Core" : "Important"} requirement for ${domain} roles`,
      estimated_time: isCritical ? "1-2 weeks" : "2-4 weeks",
      resources: [{ name: `Learn ${skill} - freeCodeCamp/YouTube`, type: "Course", free: true }],
    };
  });

  const learningPath = [
    {
      phase: 1, title: "Foundation", duration: "2-3 weeks",
      skills_to_learn: requirements.core.filter((s) => !userSkills.has(s.toLowerCase())).slice(0, 3),
      milestones: ["Complete core skill tutorials", "Build a basic practice project"],
    },
    {
      phase: 2, title: "Intermediate Skills", duration: "3-4 weeks",
      skills_to_learn: requirements.intermediate.filter((s) => !userSkills.has(s.toLowerCase())).slice(0, 3),
      milestones: ["Build an intermediate project", "Contribute to open source"],
    },
    {
      phase: 3, title: "Portfolio Building", duration: "2-3 weeks",
      skills_to_learn: requirements.advanced.filter((s) => !userSkills.has(s.toLowerCase())).slice(0, 2),
      milestones: ["Deploy a full project", "Prepare for interviews"],
    },
  ];

  return {
    summary: `Based on your ${skills.length} current skills, you have ${readinessScore}% readiness for ${domain} internships. Focus on ${missing.slice(0, 3).join(", ")} to strengthen your profile.`,
    readiness_score: readinessScore,
    current_strengths: currentStrengths,
    skill_gaps: skillGaps,
    learning_path: learningPath,
    recommended_projects: [
      { title: `${domain} Starter Project`, description: `Build a foundational ${domain} project`, skills_practiced: requirements.core.slice(0, 3), difficulty: "Beginner", estimated_hours: 15, github_worthy: true },
      { title: `${domain} Portfolio Project`, description: `A showcase project for your portfolio`, skills_practiced: requirements.intermediate.slice(0, 3), difficulty: "Intermediate", estimated_hours: 30, github_worthy: true },
    ],
    industry_insights: {
      trending_skills: requirements.intermediate.slice(0, 3),
      job_market_demand: "High",
    },
    source: "rule-based",
  };
}

module.exports = { analyzeSkillGaps, generateRuleBasedAnalysis };
