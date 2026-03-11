const mongoose = require("mongoose");

/**
 * RecommendationHistory — stores every recommendation request a user makes,
 * enabling the "recommendation history" feature on the dashboard.
 */
const recommendationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    profileSnapshot: {
      skills: [String],
      interests: [String],
      preferred_domain: String,
      experience_level: String,
      location: String,
    },
    recommendations: [
      {
        internshipId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Internship",
        },
        title: String,
        company: String,
        score: Number,
        reasoning: String,
      },
    ],
    source: {
      type: String,
      enum: ["backend", "ai", "local"],
      default: "backend",
    },
    // AI skill gap results (if requested alongside)
    skillGaps: [
      {
        skill: String,
        importance: { type: String, enum: ["High", "Medium", "Low"] },
        reason: String,
        resources: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecommendationHistory", recommendationHistorySchema);
