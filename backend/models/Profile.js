const mongoose = require("mongoose");

/**
 * Profile Schema — stores a student's profile for recommendation matching.
 */
const profileSchema = new mongoose.Schema(
  {
    // Student skills as an array of strings (e.g. ["Python", "React", "SQL"])
    skills: {
      type: [String],
      required: [true, "At least one skill is required"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one skill must be provided",
      },
    },

    // Student interests as an array of strings
    interests: {
      type: [String],
      default: [],
    },

    // Preferred internship domain (e.g. "AI", "Web Development", "Data Science")
    preferred_domain: {
      type: String,
      default: "all",
      trim: true,
    },

    // Experience level of the student
    experience_level: {
      type: String,
      required: [true, "Experience level is required"],
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "{VALUE} is not a valid experience level",
      },
    },

    // Preferred location (optional)
    location: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);
