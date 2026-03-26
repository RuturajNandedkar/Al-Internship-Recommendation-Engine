import express from "express";
import { uploadResume, analyzeAndRecommend, getJobStatus } from "../controllers/resumeController";
import { protect } from "../middleware/auth";

const router = express.Router();

// POST /api/resume/upload — upload PDF resume and get recommendations (keyword-based)
router.post("/upload", protect as any, uploadResume);

// POST /api/resume/analyze — upload PDF resume, AI-extract skills, analyze, and recommend
router.post("/analyze", protect as any, analyzeAndRecommend);

// GET /api/resume/status/:jobId — poll for resume processing status
router.get("/status/:jobId", protect as any, getJobStatus);

export default router;
