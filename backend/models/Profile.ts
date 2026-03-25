import mongoose, { Schema, Document, Model } from "mongoose";

// ─── ExperienceLevel union ────────────────────────────────────────────────────

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IProfile extends Document {
  skills: string[];
  interests: string[];
  preferred_domain: string;
  experience_level: ExperienceLevel;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const profileSchema = new Schema<IProfile>(
  {
    skills: {
      type: [String],
      required: [true, "At least one skill is required"],
      validate: {
        validator: (arr: string[]): boolean => arr.length > 0,
        message: "At least one skill must be provided",
      },
    },
    interests: {
      type: [String],
      default: [],
    },
    preferred_domain: {
      type: String,
      default: "all",
      trim: true,
    },
    experience_level: {
      type: String,
      required: [true, "Experience level is required"],
      enum: {
        values: ["beginner", "intermediate", "advanced"] as ExperienceLevel[],
        message: "{VALUE} is not a valid experience level",
      },
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const Profile: Model<IProfile> = mongoose.model<IProfile>(
  "Profile",
  profileSchema
);

export default Profile;
