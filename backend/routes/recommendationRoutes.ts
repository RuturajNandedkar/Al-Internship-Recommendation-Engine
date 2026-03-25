import express from "express";
import {
  recommend,
  recommendByProfileId,
} from "../controllers/recommendationController";
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

export default router;
