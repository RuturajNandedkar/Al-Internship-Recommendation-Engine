import { Request, Response, NextFunction } from "express";
import RecommendationFeedback from "../models/RecommendationFeedback";
import AppError from "../utils/AppError";

/**
 * POST /api/recommendations/:id/feedback
 * Body: { helpful: boolean }
 *
 * Stores thumbs-up / thumbs-down feedback for a recommendation.
 * Auth is optional — userId is attached when present.
 */
export const submitFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    if (typeof helpful !== "boolean") {
      return next(
        AppError.badRequest('Request body must include "helpful" as a boolean.')
      );
    }

    const feedback = await RecommendationFeedback.create({
      recommendationId: id,
      helpful,
      userId: req.user?._id ?? undefined,
    });

    res.status(201).json({
      success: true,
      message: "Feedback recorded. Thank you!",
      data: {
        id: feedback._id,
        recommendationId: feedback.recommendationId,
        helpful: feedback.helpful,
      },
    });
  } catch (error) {
    next(error);
  }
};
