import { Request, Response } from "express";
import SavedRecommendation from "../models/SavedRecommendation";
import RecommendationHistory from "../models/RecommendationHistory";
import Internship from "../models/Internship";
import Profile from "../models/Profile";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";

/**
 * @desc    Get dashboard summary with analytics for authenticated user
 * @route   GET /api/dashboard
 * @access  Private
 */
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized("User not found");
  
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
  const allSkills = (recentHistory as any[]).flatMap((h) => h.profileSnapshot?.skills || []);
  const skillFrequency: Record<string, number> = {};
  for (const skill of allSkills) {
    skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
  }

  // Domain distribution from history
  const domainDistribution: Record<string, number> = {};
  for (const h of (recentHistory as any[])) {
    const domain = h.profileSnapshot?.preferred_domain || "General";
    domainDistribution[domain] = (domainDistribution[domain] || 0) + 1;
  }

  // Score trend over time (last 10 searches)
  const scoreTrend = (recentHistory as any[])
    .filter((h) => h.recommendations?.length > 0)
    .map((h) => ({
      date: h.createdAt,
      avgScore: Math.round(
        h.recommendations.reduce((s: number, r: any) => s + (r.score || 0), 0) / h.recommendations.length
      ),
      topScore: Math.max(...h.recommendations.map((r: any) => r.score || 0)),
      resultCount: h.recommendations.length,
    }))
    .reverse();

  // Profile completeness score
  const profileCompleteness = computeProfileCompleteness(profile);

  // Activity streak (days with at least one search)
  const activityDates = new Set(
    (recentHistory as any[]).map((h) => new Date(h.createdAt).toISOString().split("T")[0])
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
      recentSearches: (recentHistory as any[]).map((h) => ({
        id: h._id,
        date: h.createdAt,
        source: h.source,
        skills: h.profileSnapshot?.skills || [],
        domain: h.profileSnapshot?.preferred_domain || "all",
        resultCount: h.recommendations?.length || 0,
      })),
      savedInternships: (savedInternships as any[]).map((s) => ({
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

function computeProfileCompleteness(profile: any) {
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
export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized("User not found");
  
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
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
export const getSaved = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized("User not found");
  
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
export const saveInternship = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized("User not found");
  
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
export const removeSaved = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized("User not found");
  
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
