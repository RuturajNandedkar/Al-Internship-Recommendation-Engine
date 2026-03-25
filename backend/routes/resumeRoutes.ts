import express from "express";
import { uploadResume, analyzeAndRecommend } from "../controllers/resumeController";
import { protect } from "../middleware/auth";

const router = express.Router();

// POST /api/resume/upload — upload PDF resume and get recommendations (keyword-based)
router.post("/upload", protect as any, uploadResume);

// POST /api/resume/analyze — upload PDF resume, AI-extract skills, analyze, and recommend
router.post("/analyze", protect as any, analyzeAndRecommend);

export default router;
