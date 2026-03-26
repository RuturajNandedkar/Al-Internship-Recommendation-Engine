import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export type RecommendationSource = "backend" | "ai" | "local";
export type SkillImportance = "High" | "Medium" | "Low";

export interface IRecommendationItem {
  internshipId?: Types.ObjectId;
  title?: string;
  company?: string;
  score?: number;
  reasoning?: string;
}

export interface ISkillGap {
  skill?: string;
  importance?: SkillImportance;
  reason?: string;
  resources?: string[];
}

export interface IProfileSnapshot {
  skills?: string[];
  interests?: string[];
  preferred_domain?: string;
  experience_level?: string;
  location?: string;
}

export interface IRecommendationHistory extends Document {
  userId: Types.ObjectId;
  profileSnapshot: IProfileSnapshot;
  recommendations: IRecommendationItem[];
  source: RecommendationSource;
  skillGaps: ISkillGap[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const recommendationHistorySchema = new Schema<IRecommendationHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
          type: Schema.Types.ObjectId,
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
      enum: ["backend", "ai", "local"] as RecommendationSource[],
      default: "backend",
    },
    skillGaps: [
      {
        skill: String,
        importance: {
          type: String,
          enum: ["High", "Medium", "Low"] as SkillImportance[],
        },
        reason: String,
        resources: [String],
      },
    ],
  },
  { timestamps: true }
);

// Compound index for user history retrieval (most recent first)
recommendationHistorySchema.index({ userId: 1, createdAt: -1 });

const RecommendationHistory: Model<IRecommendationHistory> =
  mongoose.model<IRecommendationHistory>(
    "RecommendationHistory",
    recommendationHistorySchema
  );

export default RecommendationHistory;
