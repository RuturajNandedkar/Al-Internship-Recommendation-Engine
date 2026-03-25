import { Request, Response, NextFunction } from "express";
import Internship from "../models/Internship";
import SavedRecommendation from "../models/SavedRecommendation";
import AppError from "../utils/AppError";

/**
 * @desc    Get all internships
 * @route   GET /api/internships
 * @access  Public
 */
export const getAllInternships = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const internships = await Internship.find({}).sort({ internshipId: 1 });

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single internship by MongoDB _id
 * @route   GET /api/internships/:id
 * @access  Public
 */
export const getInternship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      throw AppError.notFound("Internship not found");
    }

    res.status(200).json({
      success: true,
      data: internship,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save a recommended internship for a user
 * @route   POST /api/internships/save
 * @body    { profileId, internshipId, score, breakdown, reasoning }
 * @access  Public
 */
export const saveRecommendation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { profileId, internshipId, score, breakdown, reasoning } = req.body;

    const saved = await SavedRecommendation.create({
      profileId,
      internshipId,
      score,
      breakdown: breakdown || {},
      reasoning: reasoning || "",
    });

    res.status(201).json({
      success: true,
      message: "Recommendation saved successfully",
      data: saved,
    });
  } catch (error: any) {
    // Handle duplicate save gracefully
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: "This internship is already saved for this profile",
      });
      return;
    }
    next(error);
  }
};

/**
 * @desc    Get all saved recommendations for a profile
 * @route   GET /api/internships/saved/:profileId
 * @access  Public
 */
export const getSavedRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saved = await SavedRecommendation.find({
      profileId: req.params.profileId,
    })
      .populate("internshipId")
      .sort({ score: -1 });

    res.status(200).json({
      success: true,
      count: saved.length,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a saved recommendation
 * @route   DELETE /api/internships/saved/:id
 * @access  Public
 */
export const deleteSavedRecommendation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saved = await SavedRecommendation.findByIdAndDelete(req.params.id);

    if (!saved) {
      throw AppError.notFound("Saved recommendation not found");
    }

    res.status(200).json({
      success: true,
      message: "Saved recommendation removed",
    });
  } catch (error) {
    next(error);
  }
};
