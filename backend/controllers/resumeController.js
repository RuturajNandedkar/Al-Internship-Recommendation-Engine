const multer = require("multer");
const pdfParse = require("pdf-parse");
const User = require("../models/User");
const Profile = require("../models/Profile");
const { extractProfileFromResume, getFullResumeAnalysis } = require("../services/resumeService");
const { getRecommendations } = require("../services/recommendationService");
const RecommendationHistory = require("../models/RecommendationHistory");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

// Multer config — store in memory, accept PDF only, max 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new AppError("Only PDF files are accepted.", 400), false);
    }
  },
}).single("resume");

/**
 * @desc    Upload resume and get recommendations based on extracted profile
 * @route   POST /api/resume/upload
 * @access  Private
 */
const uploadResume = asyncHandler(async (req, res) => {
  // Wrap multer in a promise
  await new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return reject(AppError.badRequest("File size cannot exceed 5MB."));
        }
        return reject(AppError.badRequest(err.message));
      }
      if (err) return reject(err);
      resolve();
    });
  });

  if (!req.file) {
    throw AppError.badRequest("Please upload a PDF resume.");
  }

  // Parse PDF
  let pdfData;
  try {
    pdfData = await pdfParse(req.file.buffer);
  } catch {
    throw AppError.badRequest("Could not parse the PDF. Please ensure it is a valid PDF file.");
  }

  const resumeText = pdfData.text;
  if (!resumeText || resumeText.trim().length < 50) {
    throw AppError.badRequest("Resume appears to be empty or too short. Please upload a text-based PDF.");
  }

  // Extract profile from resume text
  const extractedProfile = extractProfileFromResume(resumeText);

  // Update user's profile in DB
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      resumeText: resumeText.substring(0, 10000), // store first 10k chars
      resumeFileName: req.file.originalname,
    });

    if (req.user.profile) {
      await Profile.findByIdAndUpdate(req.user.profile, {
        skills: extractedProfile.skills,
        interests: extractedProfile.interests,
        preferred_domain: extractedProfile.preferred_domain,
        experience_level: extractedProfile.experience_level,
      });
    }
  }

  // Generate recommendations from extracted profile
  const recommendations = await getRecommendations({
    skills: extractedProfile.skills,
    interests: extractedProfile.interests,
    preferred_domain: extractedProfile.preferred_domain,
    experience_level: extractedProfile.experience_level,
  });

  // Save to history if authenticated
  if (req.user) {
    await RecommendationHistory.create({
      userId: req.user._id,
      profileSnapshot: extractedProfile,
      recommendations: recommendations.slice(0, 10).map((r) => ({
        internshipId: r._id,
        title: r.title,
        company: r.company,
        score: r.score,
        reasoning: r.reasoning || "",
      })),
      source: "backend",
    });
  }

  logger.info("Resume processed", {
    user: req.user?._id,
    filename: req.file.originalname,
    skillsExtracted: extractedProfile.skills.length,
  });

  res.status(200).json({
    success: true,
    data: {
      extractedProfile,
      recommendations,
      fileName: req.file.originalname,
    },
  });
});

/**
 * Helper: run multer upload and parse PDF buffer into text.
 * Returns { resumeText, fileName }.
 */
async function parsePdfFromRequest(req, res) {
  await new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return reject(AppError.badRequest("File size cannot exceed 5MB."));
        }
        return reject(AppError.badRequest(err.message));
      }
      if (err) return reject(err);
      resolve();
    });
  });

  if (!req.file) {
    throw AppError.badRequest("Please upload a PDF resume.");
  }

  let pdfData;
  try {
    pdfData = await pdfParse(req.file.buffer);
  } catch {
    throw AppError.badRequest(
      "Could not parse the PDF. Please ensure it is a valid PDF file."
    );
  }

  const resumeText = pdfData.text;
  if (!resumeText || resumeText.trim().length < 50) {
    throw AppError.badRequest(
      "Resume appears to be empty or too short. Please upload a text-based PDF."
    );
  }

  return { resumeText, fileName: req.file.originalname };
}

/**
 * @desc    Upload resume, extract skills with AI, analyze, and suggest internships
 * @route   POST /api/resume/analyze
 * @access  Private
 */
const analyzeAndRecommend = asyncHandler(async (req, res) => {
  const { resumeText, fileName } = await parsePdfFromRequest(req, res);

  // AI-powered extraction + analysis
  const { extractedProfile, analysis } = await getFullResumeAnalysis(resumeText);

  // Persist resume text and update profile
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      resumeText: resumeText.substring(0, 10000),
      resumeFileName: fileName,
    });

    if (req.user.profile) {
      await Profile.findByIdAndUpdate(req.user.profile, {
        skills: extractedProfile.skills,
        interests: extractedProfile.interests,
        preferred_domain: extractedProfile.preferred_domain,
        experience_level: extractedProfile.experience_level,
      });
    }
  }

  // Generate internship recommendations from the extracted profile
  const recommendations = await getRecommendations({
    skills: extractedProfile.skills,
    interests: extractedProfile.interests,
    preferred_domain: extractedProfile.preferred_domain,
    experience_level: extractedProfile.experience_level,
  });

  // Save to history
  if (req.user) {
    await RecommendationHistory.create({
      userId: req.user._id,
      profileSnapshot: extractedProfile,
      recommendations: recommendations.slice(0, 10).map((r) => ({
        internshipId: r._id,
        title: r.title,
        company: r.company,
        score: r.score,
        reasoning: r.reasoning || "",
      })),
      source: "ai-resume",
    });
  }

  logger.info("Resume analyzed with AI", {
    user: req.user?._id,
    filename: fileName,
    skillsExtracted: extractedProfile.skills.length,
    resumeScore: analysis?.resume_score,
  });

  res.status(200).json({
    success: true,
    data: {
      extractedProfile,
      analysis,
      recommendations,
      fileName,
    },
  });
});

module.exports = { uploadResume, analyzeAndRecommend };
