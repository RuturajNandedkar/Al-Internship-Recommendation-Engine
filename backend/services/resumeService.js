const logger = require("../utils/logger");
const { extractSkillsFromResume, analyzeResume } = require("./openaiService");

// ─── Comprehensive skill database organized by category ─────────────────────
const SKILL_DATABASE = {
  languages: [
    "python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl", "lua",
    "dart", "elixir", "haskell", "clojure", "groovy", "objective-c", "assembly",
    "vba", "cobol", "fortran", "shell", "bash", "powershell", "sql",
  ],
  frontend: [
    "react", "angular", "vue", "svelte", "next.js", "nuxt.js", "gatsby",
    "html", "css", "sass", "less", "tailwind", "bootstrap", "material ui",
    "chakra ui", "styled-components", "webpack", "vite", "rollup", "parcel",
    "redux", "mobx", "zustand", "recoil", "pinia", "vuex",
    "jquery", "backbone.js", "ember.js", "alpine.js", "htmx",
    "storybook", "web components", "pwa", "service workers",
  ],
  backend: [
    "node.js", "express", "fastify", "nestjs", "django", "flask", "fastapi",
    "spring", "spring boot", "rails", "laravel", "asp.net", "gin", "fiber",
    "koa", "hapi", "adonis.js", "strapi", "graphql", "rest api", "grpc",
    "microservices", "websockets", "socket.io", "rabbitmq", "kafka", "celery",
    "oauth", "jwt", "passport.js",
  ],
  database: [
    "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra",
    "dynamodb", "firebase", "supabase", "couchdb", "neo4j", "influxdb",
    "sqlite", "mariadb", "oracle", "sql server", "prisma", "mongoose",
    "sequelize", "typeorm", "knex", "drizzle",
  ],
  cloud: [
    "aws", "azure", "gcp", "heroku", "vercel", "netlify", "digitalocean",
    "cloudflare", "docker", "kubernetes", "terraform", "ansible", "pulumi",
    "jenkins", "github actions", "gitlab ci", "circleci", "travis ci",
    "nginx", "apache", "caddy", "serverless", "lambda", "cloud functions",
    "ecs", "eks", "fargate", "ec2", "s3", "cloudfront", "route 53",
  ],
  ai_ml: [
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "scikit-learn", "keras", "huggingface",
    "transformers", "bert", "gpt", "llm", "langchain", "openai api",
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
    "opencv", "yolo", "stable diffusion", "reinforcement learning",
    "xgboost", "lightgbm", "catboost", "mlflow", "kubeflow",
    "sagemaker", "vertex ai", "onnx", "tensorrt",
    "data analysis", "data science", "data engineering", "data visualization",
    "feature engineering", "model deployment", "a/b testing",
    "recommendation systems", "time series", "anomaly detection",
  ],
  mobile: [
    "react native", "flutter", "swift", "swiftui", "kotlin", "jetpack compose",
    "android sdk", "ios", "xamarin", "ionic", "capacitor", "expo",
    "core data", "realm", "mvvm", "mvp",
  ],
  devops: [
    "devops", "ci/cd", "infrastructure as code", "monitoring",
    "prometheus", "grafana", "datadog", "new relic", "splunk", "elk stack",
    "logstash", "kibana", "vagrant", "packer", "consul", "vault",
    "argocd", "helm", "istio", "service mesh", "sre",
  ],
  security: [
    "cybersecurity", "penetration testing", "network security", "ethical hacking",
    "owasp", "burp suite", "metasploit", "wireshark", "nmap", "kali linux",
    "siem", "soc", "incident response", "threat modeling", "encryption",
    "ssl/tls", "iam", "zero trust", "compliance", "gdpr", "hipaa",
    "vulnerability assessment", "cloud security", "devsecops",
  ],
  blockchain: [
    "blockchain", "ethereum", "solidity", "smart contracts", "web3.js",
    "ethers.js", "hardhat", "truffle", "defi", "nft", "ipfs",
    "hyperledger", "polkadot", "solana", "rust (blockchain)",
  ],
  design: [
    "figma", "sketch", "adobe xd", "photoshop", "illustrator",
    "ui/ux", "wireframing", "prototyping", "design systems",
    "user research", "usability testing", "information architecture",
    "interaction design", "visual design", "responsive design",
  ],
  tools: [
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "slack", "notion", "trello", "asana", "linear",
    "postman", "insomnia", "swagger", "openapi",
    "vs code", "intellij", "vim", "emacs",
    "agile", "scrum", "kanban", "tdd", "bdd", "pair programming",
  ],
  iot_embedded: [
    "iot", "embedded systems", "arduino", "raspberry pi", "esp32",
    "mqtt", "modbus", "zigbee", "ble", "lora", "sensor integration",
    "rtos", "embedded c", "fpga", "verilog", "vhdl",
  ],
  gaming: [
    "unity", "unreal engine", "godot", "game physics", "3d math",
    "opengl", "vulkan", "directx", "shader programming", "blender",
  ],
};

// Flatten for quick lookup
const ALL_SKILLS = Object.values(SKILL_DATABASE).flat();

// Section headers that indicate different resume sections
const SECTION_PATTERNS = {
  education: /\b(education|academic|qualification|degree|university|college|school)\b/i,
  experience: /\b(experience|employment|work history|professional|career)\b/i,
  skills: /\b(skills|technical skills|technologies|proficiencies|competencies|tech stack)\b/i,
  projects: /\b(projects|portfolio|personal projects|academic projects)\b/i,
  certifications: /\b(certification|certificate|licensed|accredited|credential)\b/i,
  summary: /\b(summary|objective|about me|profile|introduction)\b/i,
};

/**
 * Detect sections in resume text and return structured content.
 */
function detectSections(text) {
  const lines = text.split("\n");
  const sections = {};
  let currentSection = "header";
  sections[currentSection] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matched = false;
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(trimmed) && trimmed.length < 60) {
        currentSection = section;
        sections[currentSection] = sections[currentSection] || [];
        matched = true;
        break;
      }
    }
    if (!matched) {
      sections[currentSection] = sections[currentSection] || [];
      sections[currentSection].push(trimmed);
    }
  }
  return sections;
}

/**
 * Extract contact info (email, phone, LinkedIn, GitHub) from resume text.
 */
function extractContactInfo(text) {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    linkedin: linkedinMatch ? linkedinMatch[0] : null,
    github: githubMatch ? githubMatch[0] : null,
  };
}

/**
 * Extract education details from resume text.
 */
function extractEducation(text) {
  const degrees = [];
  const degreePatterns = [
    /\b(B\.?Tech|B\.?E\.?|Bachelor(?:'s)?)\s*(?:in|of)?\s*([\w\s&]+?)(?:\n|,|\.|$)/gi,
    /\b(M\.?Tech|M\.?S\.?|Master(?:'s)?)\s*(?:in|of)?\s*([\w\s&]+?)(?:\n|,|\.|$)/gi,
    /\b(Ph\.?D\.?|Doctorate)\s*(?:in|of)?\s*([\w\s&]+?)(?:\n|,|\.|$)/gi,
    /\b(MBA|BCA|MCA|BBA|BSc|MSc)\b/gi,
  ];
  for (const pattern of degreePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      degrees.push(match[0].trim());
    }
  }
  return degrees;
}

/**
 * Extract years of experience from resume text.
 */
function extractYearsOfExperience(text) {
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of)?\s*experience/i,
    /experience\s*(?:of)?\s*(\d+)\+?\s*years?/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1], 10);
  }
  // Count date ranges in experience section
  const dateRanges = text.match(/(?:20\d{2}|19\d{2})\s*[-–]\s*(?:20\d{2}|present|current)/gi) || [];
  if (dateRanges.length > 0) {
    let totalYears = 0;
    for (const range of dateRanges) {
      const years = range.match(/(\d{4})/g);
      if (years && years.length >= 2) {
        totalYears += parseInt(years[1], 10) - parseInt(years[0], 10);
      } else if (range.toLowerCase().includes("present")) {
        const start = years ? parseInt(years[0], 10) : 0;
        totalYears += new Date().getFullYear() - start;
      }
    }
    return totalYears;
  }
  return 0;
}

/**
 * Extract skills from resume text using keyword matching and NLP-like patterns.
 */
function extractProfileFromResume(text) {
  if (!text || typeof text !== "string") {
    return { skills: [], interests: [], experience_level: "beginner", sections: {} };
  }

  const lowerText = text.toLowerCase();
  const sections = detectSections(text);
  const contactInfo = extractContactInfo(text);
  const education = extractEducation(text);
  const yearsExp = extractYearsOfExperience(text);

  // Extract matching skills with section-aware weighting
  const skillScores = {};
  const skillSection = (sections.skills || []).join(" ").toLowerCase();
  const projectSection = (sections.projects || []).join(" ").toLowerCase();

  for (const skill of ALL_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(lowerText)) {
      let weight = 1;
      if (pattern.test(skillSection)) weight += 2;  // Skills section = high confidence
      if (pattern.test(projectSection)) weight += 1; // Projects section = medium confidence
      skillScores[skill] = weight;
    }
  }

  // Sort by weight descending, return skill names
  const foundSkills = Object.entries(skillScores)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);

  // Determine experience level
  let experience_level = "beginner";
  if (yearsExp >= 3) experience_level = "advanced";
  else if (yearsExp >= 1) experience_level = "intermediate";

  const advancedKeywords = ["senior", "lead", "architect", "principal", "expert", "5+ years", "6+ years", "7+ years", "staff engineer"];
  const intermediateKeywords = ["mid-level", "2+ years", "3+ years", "4+ years", "intermediate", "professional experience", "software engineer"];
  if (advancedKeywords.some((kw) => lowerText.includes(kw))) experience_level = "advanced";
  else if (intermediateKeywords.some((kw) => lowerText.includes(kw))) experience_level = "intermediate";

  // Extract interests from section headers and keywords
  const interestKeywords = [
    "artificial intelligence", "machine learning", "web development",
    "mobile development", "data science", "cybersecurity", "cloud computing",
    "blockchain", "iot", "game development", "devops", "ui/ux design",
    "full stack", "frontend", "backend", "data engineering", "nlp",
    "computer vision", "robotics", "fintech", "edtech", "healthtech",
  ];
  const interests = interestKeywords.filter((interest) => lowerText.includes(interest));

  // Determine preferred domain with confidence scoring
  const domainSignals = {
    "Machine Learning": ["machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "ml"],
    "AI": ["artificial intelligence", "nlp", "computer vision", "transformers", "llm"],
    "Web Development": ["react", "angular", "vue", "html", "css", "frontend", "full stack", "node.js", "express"],
    "Mobile Development": ["flutter", "react native", "swift", "android", "ios", "mobile"],
    "Data Science": ["data science", "data analysis", "pandas", "visualization", "statistics", "jupyter"],
    "Cybersecurity": ["cybersecurity", "penetration testing", "security", "ethical hacking", "siem"],
    "Cloud": ["aws", "azure", "gcp", "cloud computing", "serverless", "infrastructure"],
    "DevOps": ["devops", "docker", "kubernetes", "ci/cd", "terraform", "jenkins"],
    "Blockchain": ["blockchain", "solidity", "ethereum", "smart contracts", "web3"],
    "IoT": ["iot", "embedded", "arduino", "raspberry pi", "mqtt", "sensor"],
    "UI/UX Design": ["figma", "ui/ux", "wireframing", "user research", "prototyping"],
    "Game Development": ["unity", "unreal", "game", "opengl", "shader"],
    "Data Engineering": ["data engineering", "apache spark", "airflow", "etl", "hadoop", "kafka"],
  };

  let preferred_domain = "all";
  let maxSignals = 0;
  for (const [domain, signals] of Object.entries(domainSignals)) {
    const count = signals.filter((s) => lowerText.includes(s)).length;
    if (count > maxSignals) { maxSignals = count; preferred_domain = domain; }
  }
  if (maxSignals < 2) preferred_domain = "all";

  // Detect skill categories for analytics
  const skillCategories = {};
  for (const [category, categorySkills] of Object.entries(SKILL_DATABASE)) {
    const matched = foundSkills.filter((s) => categorySkills.includes(s));
    if (matched.length > 0) skillCategories[category] = matched;
  }

  logger.info("Resume parsed (enhanced v2)", {
    skillsFound: foundSkills.length,
    experience: experience_level,
    yearsExp,
    domain: preferred_domain,
    categories: Object.keys(skillCategories).length,
    hasContact: !!contactInfo.email,
  });

  return {
    skills: foundSkills.length > 0 ? foundSkills : ["General"],
    interests,
    experience_level,
    preferred_domain,
    yearsOfExperience: yearsExp,
    education,
    contactInfo,
    sections: Object.keys(sections),
    skillCategories,
    resumeCompleteness: computeResumeCompleteness(sections, contactInfo, foundSkills, education),
  };
}

/**
 * Score how complete/polished the resume appears.
 */
function computeResumeCompleteness(sections, contact, skills, education) {
  let score = 0;
  if (sections.education?.length > 0 || education.length > 0) score += 15;
  if (sections.experience?.length > 0) score += 25;
  if (sections.skills?.length > 0) score += 15;
  if (sections.projects?.length > 0) score += 15;
  if (contact.email) score += 10;
  if (contact.github || contact.linkedin) score += 10;
  if (skills.length >= 5) score += 10;
  return Math.min(100, score);
}

module.exports = { extractProfileFromResume, extractProfileWithAI, getFullResumeAnalysis };

/**
 * Extract profile using OpenAI, with keyword-based fallback.
 * Merges AI-extracted skills with keyword-matched skills for better coverage.
 */
async function extractProfileWithAI(resumeText) {
  // Always run keyword extraction as a baseline
  const keywordProfile = extractProfileFromResume(resumeText);

  try {
    const aiProfile = await extractSkillsFromResume(resumeText);

    // Merge skills — union of AI and keyword-based, deduplicated (case-insensitive)
    const seen = new Set();
    const mergedSkills = [];
    for (const s of [...(aiProfile.skills || []), ...keywordProfile.skills]) {
      const key = s.toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        mergedSkills.push(s);
      }
    }

    // Merge interests
    const seenInterests = new Set();
    const mergedInterests = [];
    for (const i of [...(aiProfile.interests || []), ...keywordProfile.interests]) {
      const key = i.toLowerCase().trim();
      if (key && !seenInterests.has(key)) {
        seenInterests.add(key);
        mergedInterests.push(i);
      }
    }

    const profile = {
      skills: mergedSkills.length > 0 ? mergedSkills : ["General"],
      interests: mergedInterests,
      experience_level: aiProfile.experience_level || keywordProfile.experience_level,
      preferred_domain: aiProfile.preferred_domain || keywordProfile.preferred_domain,
      education: aiProfile.education || "",
      years_of_experience: aiProfile.years_of_experience || 0,
    };

    logger.info("Resume parsed with AI", {
      skillsFound: profile.skills.length,
      experience: profile.experience_level,
      domain: profile.preferred_domain,
    });

    return profile;
  } catch (error) {
    logger.warn("AI extraction failed, falling back to keyword extraction", {
      error: error.message,
    });
    return keywordProfile;
  }
}

/**
 * Full resume analysis: AI skill extraction + resume analysis + internship matching.
 *
 * @param {string} resumeText - raw text from PDF
 * @returns {Promise<Object>} { extractedProfile, analysis }
 */
async function getFullResumeAnalysis(resumeText) {
  const extractedProfile = await extractProfileWithAI(resumeText);

  let analysis;
  try {
    analysis = await analyzeResume(resumeText, extractedProfile.skills);
  } catch (error) {
    logger.warn("Resume analysis failed", { error: error.message });
    analysis = null;
  }

  return { extractedProfile, analysis };
}
