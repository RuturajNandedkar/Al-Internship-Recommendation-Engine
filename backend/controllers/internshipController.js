const Internship = require("../models/Internship");
const SavedRecommendation = require("../models/SavedRecommendation");

/**
 * @desc    Get all internships
 * @route   GET /api/internships
 * @access  Public
 */
const getAllInternships = async (_req, res, next) => {
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
const getInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      const err = new Error("Internship not found");
      err.statusCode = 404;
      throw err;
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
const saveRecommendation = async (req, res, next) => {
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
  } catch (error) {
    // Handle duplicate save gracefully
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This internship is already saved for this profile",
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all saved recommendations for a profile
 * @route   GET /api/internships/saved/:profileId
 * @access  Public
 */
const getSavedRecommendations = async (req, res, next) => {
  try {
    const saved = await SavedRecommendation.find({
      profileId: req.params.id,
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
const deleteSavedRecommendation = async (req, res, next) => {
  try {
    const saved = await SavedRecommendation.findByIdAndDelete(req.params.id);

    if (!saved) {
      const err = new Error("Saved recommendation not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Saved recommendation removed",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInternships,
  getInternship,
  saveRecommendation,
  getSavedRecommendations,
  deleteSavedRecommendation,
};
