const Profile = require("../models/Profile");

/**
 * @desc    Submit a new user profile
 * @route   POST /api/profiles
 * @access  Public
 */
const createProfile = async (req, res, next) => {
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
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      const err = new Error("Profile not found");
      err.statusCode = 404;
      throw err;
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
const getAllProfiles = async (_req, res, next) => {
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

module.exports = { createProfile, getProfile, getAllProfiles };
