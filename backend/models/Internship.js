const mongoose = require("mongoose");

/**
 * Internship Schema — represents a single internship opportunity
 * in the AI Internship Recommendation Engine.
 */
const internshipSchema = new mongoose.Schema(
  {
    // Job title for the internship position
    title: {
      type: String,
      required: [true, "Internship title is required"],
      trim: true,
    },

    // Company or organisation offering the internship
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    // Physical or remote location of the internship
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // Primary domain / field (AI, Web Development, Cybersecurity, etc.)
    domain: {
      type: String,
      required: [true, "Domain is required"],
      trim: true,
      enum: {
        values: [
          "AI",
          "Web Development",
          "Cybersecurity",
          "Data Science",
          "Cloud",
          "Mobile Development",
          "DevOps",
          "Blockchain",
          "IoT",
          "Game Development",
          "UI/UX Design",
          "Machine Learning",
          "Other",
        ],
        message: "{VALUE} is not a supported domain",
      },
    },

    // Technical / soft skills the intern should possess
    required_skills: {
      type: [String],
      required: [true, "At least one required skill must be specified"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "required_skills must contain at least one skill",
      },
    },

    // Monthly stipend offered (e.g. "₹15,000/month" or "Unpaid")
    stipend: {
      type: String,
      required: [true, "Stipend information is required"],
      trim: true,
    },

    // Duration of the internship (e.g. "3 months")
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },

    // URL where students can apply
    application_link: {
      type: String,
      required: [true, "Application link is required"],
      trim: true,
    },

    // Detailed description of the internship role
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search across title, company, domain & description
internshipSchema.index({ title: "text", company: "text", domain: "text", description: "text" });

module.exports = mongoose.model("Internship", internshipSchema);
