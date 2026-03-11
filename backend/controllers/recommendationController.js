const { getRecommendations } = require("../services/recommendationService");
const Profile = require("../models/Profile");
const RecommendationHistory = require("../models/RecommendationHistory");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * @desc    Get internship recommendations for a given profile
 * @route   POST /api/recommendations
 * @body    { skills, interests, preferred_domain, experience_level, location }
 * @access  Public (optionally authenticated for history tracking)
 */
const recommend = asyncHandler(async (req, res) => {
  const { skills, interests, preferred_domain, experience_level, location } = req.body;

  // Save profile to DB for analytics/history
  const profile = await Profile.create({
    skills,
    interests: interests || [],
    preferred_domain: preferred_domain || "all",
    experience_level,
    location: location || "",
  });

  // Generate recommendations using the scoring engine
  const recommendations = await getRecommendations({
    skills,
    interests: interests || [],
    preferred_domain: preferred_domain || "all",
    experience_level,
  });

  // Track in recommendation history if user is authenticated
  if (req.user) {
    await RecommendationHistory.create({
      userId: req.user._id,
      profileSnapshot: {
        skills,
        interests: interests || [],
        preferred_domain: preferred_domain || "all",
        experience_level,
        location: location || "",
      },
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

  res.status(200).json({
    success: true,
    profileId: profile._id,
    count: recommendations.length,
    data: recommendations,
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
