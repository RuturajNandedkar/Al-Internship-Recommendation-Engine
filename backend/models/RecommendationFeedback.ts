import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ─── Interface ─────────────────────────────────────────────────────────────

export interface IRecommendationFeedback extends Document {
  recommendationId: string;   // internship ID (string, not enforced as ObjectId)
  helpful: boolean;
  userId?: Types.ObjectId;    // optional – set when user is authenticated
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────────────────

const recommendationFeedbackSchema = new Schema<IRecommendationFeedback>(
  {
    recommendationId: {
      type: String,
      required: true,
      index: true,
    },
    helpful: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index – one feedback record per recommendation per user (optional)
recommendationFeedbackSchema.index(
  { recommendationId: 1, userId: 1 },
  { sparse: true }
);

const RecommendationFeedback: Model<IRecommendationFeedback> =
  mongoose.model<IRecommendationFeedback>(
    "RecommendationFeedback",
    recommendationFeedbackSchema
  );

export default RecommendationFeedback;
