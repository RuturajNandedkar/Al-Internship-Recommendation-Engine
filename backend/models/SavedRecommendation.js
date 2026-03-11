const mongoose = require("mongoose");

/**
 * SavedRecommendation Schema — stores internships a user bookmarks/saves.
 * Links a profile to specific internship recommendations with their scores.
 */
const savedRecommendationSchema = new mongoose.Schema(
  {
    // Reference to the authenticated user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // Reference to the user's profile
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },

    // Reference to the internship
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: [true, "Internship ID is required"],
    },

    // Match score (0–100) from the recommendation engine
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Score breakdown by category
    breakdown: {
      skills: { type: Number, default: 0 },
      field: { type: Number, default: 0 },
      sector: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      mode: { type: Number, default: 0 },
    },

    // AI-generated reasoning (if available)
    reasoning: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saves of the same internship for the same profile
savedRecommendationSchema.index(
  { profileId: 1, internshipId: 1 },
  { unique: true }
);

module.exports = mongoose.model("SavedRecommendation", savedRecommendationSchema);
