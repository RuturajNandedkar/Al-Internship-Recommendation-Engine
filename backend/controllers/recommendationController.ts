import { Request, Response } from "express";
import { getRecommendations, RecommendationResult } from "../services/recommendationService";
import { enhanceWithAI, isGeminiAvailable } from "../services/geminiService";
import Profile from "../models/Profile";
import RecommendationHistory from "../models/RecommendationHistory";
import asyncHandler from "../middleware/asyncHandler";
import logger from "../utils/logger";
import AppError from "../utils/AppError";

/**
 * @desc    Get internship recommendations for a given profile
 * @route   POST /api/recommendations
 * @body    { skills, interests, preferred_domain, experience_level, location }
 * @access  Public (optionally authenticated for history tracking)
 */
export const recommend = asyncHandler(async (req: Request, res: Response) => {
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
      finalRecommendations = aiEnhanced as any;
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
      recommendations: finalRecommendations.slice(0, 10).map((r: any) => ({
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
export const recommendByProfileId = asyncHandler(async (req: Request, res: Response) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
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
