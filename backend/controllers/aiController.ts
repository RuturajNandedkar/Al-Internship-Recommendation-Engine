import { Request, Response } from "express";
import { generatePureAIRecommendations } from "../services/geminiService";
import Internship from "../models/Internship";
import logger from "../utils/logger";

/**
 * Handle POST /api/ai/recommend
 * Accepts a user profile and returns AI-generated internship recommendations.
 */
export const getAIRecommendations = async (req: Request, res: Response) => {
  try {
    const profile = req.body;
    const maxResults = profile.maxResults || 5;

    // Fetch all internships from DB to provide to the AI for ranking
    // In a real production app with thousands of records, we would pre-filter/search here
    // but for this small-scale app, we can provide the full list to the AI.
    const allInternships = await Internship.find({}).lean();

    if (!allInternships || allInternships.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No internships found in database"
      });
    }

    const recommendations = await generatePureAIRecommendations(
      profile as any, 
      allInternships as any, 
      maxResults
    );

    if (!recommendations) {
      return res.status(500).json({
        success: false,
        message: "AI recommendation engine failed to generate results"
      });
    }

    return res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error: any) {
    logger.error("Error in AI recommendation controller", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Internal server error during AI recommendation"
    });
  }
};
