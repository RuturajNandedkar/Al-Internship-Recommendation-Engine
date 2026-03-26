import express from "express";
import {
  recommend,
  recommendByProfileId,
} from "../controllers/recommendationController";
import { submitFeedback } from "../controllers/feedbackController";
import {
  validateProfile,
  validateObjectId,
} from "../middleware/validateRequest";
import { optionalAuth } from "../middleware/auth";

const router = express.Router();

// POST /api/recommendations — submit profile data and get recommendations
router.post("/", optionalAuth as any, validateProfile as any, recommend);

// GET /api/recommendations/:id — get recommendations for an existing profile
router.get("/:id", validateObjectId as any, recommendByProfileId);

// POST /api/recommendations/:id/feedback — thumbs up/down for a recommendation
router.post(
  "/:id/feedback",
  optionalAuth as any,
  submitFeedback
);

export default router;
