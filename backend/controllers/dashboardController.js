const SavedRecommendation = require("../models/SavedRecommendation");
const RecommendationHistory = require("../models/RecommendationHistory");
const Internship = require("../models/Internship");
const Profile = require("../models/Profile");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * @desc    Get dashboard summary with analytics for authenticated user
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const profileId = req.user.profile;

  const [savedCount, historyCount, recentHistory, savedInternships, profile, totalInternships] =
    await Promise.all([
      SavedRecommendation.countDocuments({ userId }),
      RecommendationHistory.countDocuments({ userId }),
      RecommendationHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      SavedRecommendation.find({ userId })
        .populate("internshipId")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      profileId ? Profile.findById(profileId).lean() : null,
      Internship.countDocuments(),
    ]);

  // Skill frequency analysis
  const allSkills = recentHistory.flatMap((h) => h.profileSnapshot?.skills || []);
  const skillFrequency = {};
  for (const skill of allSkills) {
    skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
  }

  // Domain distribution from history
  const domainDistribution = {};
  for (const h of recentHistory) {
    const domain = h.profileSnapshot?.preferred_domain || "General";
    domainDistribution[domain] = (domainDistribution[domain] || 0) + 1;
  }

  // Score trend over time (last 10 searches)
  const scoreTrend = recentHistory
    .filter((h) => h.recommendations?.length > 0)
    .map((h) => ({
      date: h.createdAt,
      avgScore: Math.round(
        h.recommendations.reduce((s, r) => s + (r.score || 0), 0) / h.recommendations.length
      ),
      topScore: Math.max(...h.recommendations.map((r) => r.score || 0)),
      resultCount: h.recommendations.length,
    }))
    .reverse();

  // Profile completeness score
  const profileCompleteness = computeProfileCompleteness(profile);

  // Activity streak (days with at least one search)
  const activityDates = new Set(
    recentHistory.map((h) => new Date(h.createdAt).toISOString().split("T")[0])
  );

  res.status(200).json({
    success: true,
    data: {
      stats: {
        savedInternships: savedCount,
        totalSearches: historyCount,
        totalInternships,
        profileComplete: profileCompleteness >= 80,
        profileCompleteness,
        activeDays: activityDates.size,
      },
      analytics: {
        domainDistribution: Object.entries(domainDistribution)
          .sort((a, b) => b[1] - a[1])
          .map(([domain, count]) => ({ domain, count, percentage: Math.round((count / recentHistory.length) * 100) })),
        scoreTrend,
        averageMatchScore: scoreTrend.length > 0
          ? Math.round(scoreTrend.reduce((s, t) => s + t.avgScore, 0) / scoreTrend.length)
          : 0,
      },
      recentSearches: recentHistory.map((h) => ({
        id: h._id,
        date: h.createdAt,
        source: h.source,
        skills: h.profileSnapshot?.skills || [],
        domain: h.profileSnapshot?.preferred_domain || "all",
        resultCount: h.recommendations?.length || 0,
      })),
      savedInternships: savedInternships.map((s) => ({
        id: s._id,
        internship: s.internshipId,
        score: s.score,
        savedAt: s.createdAt,
      })),
      topSkills: Object.entries(skillFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count })),
    },
  });
});

function computeProfileCompleteness(profile) {
  if (!profile) return 0;
  let score = 0;
  if (profile.skills?.length > 0) score += 30;
  if (profile.skills?.length >= 3) score += 10;
  if (profile.interests?.length > 0) score += 15;
  if (profile.preferred_domain && profile.preferred_domain !== "all") score += 15;
  if (profile.experience_level) score += 15;
  if (profile.location) score += 15;
  return Math.min(100, score);
}

/**
 * @desc    Get full recommendation history for user
 * @route   GET /api/dashboard/history
 * @access  Private
 */
const getHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    RecommendationHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    RecommendationHistory.countDocuments({ userId: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    data: history,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get all saved internships for user
 * @route   GET /api/dashboard/saved
 * @access  Private
 */
const getSaved = asyncHandler(async (req, res) => {
  const saved = await SavedRecommendation.find({ userId: req.user._id })
    .populate("internshipId")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: saved.length,
    data: saved,
  });
});

/**
 * @desc    Save an internship for user
 * @route   POST /api/dashboard/save
 * @access  Private
 */
const saveInternship = asyncHandler(async (req, res) => {
  const { internshipId, score, breakdown, reasoning } = req.body;

  const saved = await SavedRecommendation.create({
    userId: req.user._id,
    profileId: req.user.profile,
    internshipId,
    score: score || 0,
    breakdown: breakdown || {},
    reasoning: reasoning || "",
  });

  res.status(201).json({
    success: true,
    message: "Internship saved",
    data: saved,
  });
});

/**
 * @desc    Remove a saved internship
 * @route   DELETE /api/dashboard/saved/:id
 * @access  Private
 */
const removeSaved = asyncHandler(async (req, res) => {
  const saved = await SavedRecommendation.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!saved) {
    throw AppError.notFound("Saved internship not found.");
  }

  res.status(200).json({
    success: true,
    message: "Saved internship removed",
  });
});

module.exports = { getDashboard, getHistory, getSaved, saveInternship, removeSaved };
