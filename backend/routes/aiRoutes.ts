import express from "express";
import { getAIRecommendations } from "../controllers/aiController";

const router = express.Router();

// POST /api/ai/recommend
router.post("/recommend", getAIRecommendations);

export default router;
