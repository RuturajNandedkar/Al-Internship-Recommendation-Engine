import { Request, Response } from "express";
import User from "../models/User";
import Profile from "../models/Profile";
import { generateToken } from "../middleware/auth";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError.conflict("An account with this email already exists.");
  }

  // Create user
  const user = await User.create({ name, email, password });

  // Create a linked blank profile
  const profile = await Profile.create({
    skills: ["General"],
    interests: [],
    preferred_domain: "all",
    experience_level: "beginner",
    location: "",
  });
  
  user.profile = profile._id as any;
  await user.save();

  const token = generateToken((user._id as any).toString());

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profile._id,
      },
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user with password field included
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await (user as any).comparePassword(password))) {
    throw AppError.unauthorized("Invalid email or password.");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken((user._id as any).toString());

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized("User not found in request");
  }
  const user = await User.findById(req.user._id).populate("profile");

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!req.user) {
    throw AppError.unauthorized("User not found in request");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw AppError.notFound("User not found");
  
  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated",
    data: user,
  });
});
