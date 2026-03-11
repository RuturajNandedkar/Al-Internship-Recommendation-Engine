const { getRecommendations } = require("../services/recommendationService");
const { enhanceWithAI, isGeminiAvailable } = require("../services/geminiService");
const Profile = require("../models/Profile");
const RecommendationHistory = require("../models/RecommendationHistory");
const asyncHandler = require("../middleware/asyncHandler");
const logger = require("../utils/logger");

/**
 * @desc    Get internship recommendations for a given profile
 * @route   POST /api/recommendations
 * @body    { skills, interests, preferred_domain, experience_level, location }
 * @access  Public (optionally authenticated for history tracking)
 */
const recommend = asyncHandler(async (req, res) => {
  const { skills, interests, preferred_domain, experience_level, location } = req.body;

  const profileData = {
    skills,
    interests: interests || [],
    preferred_domain: preferred_domain || "all",
    experience_level,
    location: location || "",
  };

  // Save profile to DB for analytics/history
  const profile = await Profile.create(profileData);

  // Step 1: Generate recommendations using the algorithmic scoring engine
  const recommendations = await getRecommendations(profileData);

  // Step 2: Enhance with Gemini AI if available
  let finalRecommendations = recommendations;
  let aiUsed = false;

  if (isGeminiAvailable()) {
    const aiEnhanced = await enhanceWithAI(profileData, recommendations);
    if (aiEnhanced && aiEnhanced.length > 0) {
      finalRecommendations = aiEnhanced;
      aiUsed = true;
      logger.info("Recommendations enhanced with Gemini AI");
    } else {
      logger.info("Gemini AI enhancement returned no results, using algorithmic scoring");
    }
  }

  // Track in recommendation history if user is authenticated
  if (req.user) {
    await RecommendationHistory.create({
      userId: req.user._id,
      profileSnapshot: profileData,
      recommendations: finalRecommendations.slice(0, 10).map((r) => ({
        internshipId: r._id,
        title: r.title,
        company: r.company,
        score: r.score,
        reasoning: r.reasoning || "",
      })),
      source: aiUsed ? "ai-gemini" : "backend",
    });
  }

  res.status(200).json({
    success: true,
    profileId: profile._id,
    count: finalRecommendations.length,
    aiUsed,
    data: finalRecommendations,
  });
});

/**
 * @desc    Get recommendations for an existing profile by ID
 * @route   GET /api/recommendations/:id
 * @access  Public
 */
const recommendByProfileId = asyncHandler(async (req, res) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    const AppError = require("../utils/AppError");
    throw AppError.notFound("Profile not found");
  }

  const recommendations = await getRecommendations({
    skills: profile.skills,
    interests: profile.interests,
    preferred_domain: profile.preferred_domain,
    experience_level: profile.experience_level,
  });

  res.status(200).json({
    success: true,
    profileId: profile._id,
    count: recommendations.length,
    data: recommendations,
  });
});

module.exports = { recommend, recommendByProfileId };
