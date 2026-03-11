const express = require("express");
const router = express.Router();
const { uploadResume, analyzeAndRecommend } = require("../controllers/resumeController");
const { protect } = require("../middleware/auth");

// POST /api/resume/upload — upload PDF resume and get recommendations (keyword-based)
router.post("/upload", protect, uploadResume);

// POST /api/resume/analyze — upload PDF resume, AI-extract skills, analyze, and recommend
router.post("/analyze", protect, analyzeAndRecommend);

module.exports = router;
