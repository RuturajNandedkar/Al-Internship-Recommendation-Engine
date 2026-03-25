import { Request, Response, NextFunction } from "express";
import Profile from "../models/Profile";
import AppError from "../utils/AppError";

/**
 * @desc    Submit a new user profile
 * @route   POST /api/profiles
 * @access  Public
 */
export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skills, interests, preferred_domain, experience_level, location } = req.body;

    const profile = await Profile.create({
      skills,
      interests: interests || [],
      preferred_domain: preferred_domain || "all",
      experience_level,
      location: location || "",
    });

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a profile by ID
 * @route   GET /api/profiles/:id
 * @access  Public
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      throw AppError.notFound("Profile not found");
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all profiles (admin/debug)
 * @route   GET /api/profiles
 * @access  Public
 */
export const getAllProfiles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const profiles = await Profile.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};
