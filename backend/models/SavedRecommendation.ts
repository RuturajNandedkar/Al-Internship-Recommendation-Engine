import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IScoreBreakdown {
  skills: number;
  field: number;
  sector: number;
  location: number;
  mode: number;
}

export interface ISavedRecommendation extends Document {
  userId?: Types.ObjectId;
  profileId?: Types.ObjectId;
  internshipId: Types.ObjectId;
  score: number;
  breakdown: IScoreBreakdown;
  reasoning: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const savedRecommendationSchema = new Schema<ISavedRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    internshipId: {
      type: Schema.Types.ObjectId,
      ref: "Internship",
      required: [true, "Internship ID is required"],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    breakdown: {
      skills: { type: Number, default: 0 },
      field: { type: Number, default: 0 },
      sector: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      mode: { type: Number, default: 0 },
    },
    reasoning: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate saves of the same internship for the same profile
savedRecommendationSchema.index(
  { profileId: 1, internshipId: 1 },
  { unique: true }
);

const SavedRecommendation: Model<ISavedRecommendation> =
  mongoose.model<ISavedRecommendation>(
    "SavedRecommendation",
    savedRecommendationSchema
  );

export default SavedRecommendation;
