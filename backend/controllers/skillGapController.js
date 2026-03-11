const { analyzeSkillGaps } = require("../services/skillGapService");
const RecommendationHistory = require("../models/RecommendationHistory");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * @desc    Get AI-powered skill gap analysis
 * @route   POST /api/skill-gap
 * @access  Private
 */
const getSkillGapAnalysis = asyncHandler(async (req, res) => {
  const { skills, interests, experience_level, preferred_domain } = req.body;

  if (!skills || skills.length === 0) {
    throw AppError.badRequest("At least one skill is required for analysis.");
  }

  const analysis = await analyzeSkillGaps({
    skills,
    interests: interests || [],
    experience_level: experience_level || "beginner",
    preferred_domain: preferred_domain || "all",
  });

  // Store skill gaps in user's latest history entry (if authenticated)
  if (req.user) {
    const latestHistory = await RecommendationHistory.findOne({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (latestHistory) {
      latestHistory.skillGaps = analysis.skill_gaps || [];
      await latestHistory.save();
    }
  }

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

module.exports = { getSkillGapAnalysis };
