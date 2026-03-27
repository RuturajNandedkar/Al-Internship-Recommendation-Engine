import { Request, Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import User from "../models/User";
import Profile from "../models/Profile";
import { extractProfileFromResume, getFullResumeAnalysis } from "../services/resumeService";
import { getRecommendations } from "../services/recommendationService";
import RecommendationHistory from "../models/RecommendationHistory";
import { AuthRequest } from "../middleware/auth";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { resumeQueue, isQueueActive, processResumeJobLogic } from "../queues/resumeQueue";
import { Job } from "bullmq";

// Multer config — store in memory, accept PDF only, max 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new AppError("Only PDF files are accepted.", 400) as any, false);
    }
  },
}).single("resume");

/**
 * @desc    Upload resume and get recommendations based on extracted profile
 * @route   POST /api/resume/upload
 * @access  Private
 */
export const uploadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Wrap multer in a promise
  await new Promise<void>((resolve, reject) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return reject(AppError.badRequest("File size cannot exceed 5MB."));
        }
        return reject(AppError.badRequest(err.message));
      }
      if (err) return reject(err);
      resolve();
    });
  });

  if (!req.file) {
    throw AppError.badRequest("Please upload a PDF resume.");
  }

  // Parse PDF
  let pdfData;
  try {
    pdfData = await pdfParse(req.file.buffer);
  } catch {
    throw AppError.badRequest("Could not parse the PDF. Please ensure it is a valid PDF file.");
  }

  const resumeText = pdfData.text;
  if (!resumeText || resumeText.trim().length < 50) {
    throw AppError.badRequest("Resume appears to be empty or too short. Please upload a text-based PDF.");
  }

  // Enqueue parsing job or process synchronously if Redis is missing
  if (isQueueActive && resumeQueue) {
    const job = await resumeQueue.add("parse-resume", {
      userId: req.user?._id,
      resumeText,
      fileName: req.file.originalname,
      type: "keyword", // standard extraction
    });

    logger.info("Resume enqueued for parsing", {
      user: req.user?._id,
      jobId: job.id,
    });

    return res.status(202).json({
      success: true,
      message: "Resume upload successful. Processing in background.",
      data: {
        jobId: job.id,
      },
    });
  }

  // Synchronous Fallback
  logger.info("Redis unavailable, processing resume synchronously", {
    user: req.user?._id,
  });
  const result = await processResumeJobLogic({
    userId: req.user?._id,
    resumeText,
    fileName: req.file.originalname,
    type: "keyword",
  });

  return res.status(200).json({
    success: true,
    message: "Resume upload and processing successful.",
    data: {
      result,
    },
  });
});

/**
 * Helper: run multer upload and parse PDF buffer into text.
 * Returns { resumeText, fileName }.
 */
async function parsePdfFromRequest(req: AuthRequest, res: Response) {
  await new Promise<void>((resolve, reject) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return reject(AppError.badRequest("File size cannot exceed 5MB."));
        }
        return reject(AppError.badRequest(err.message));
      }
      if (err) return reject(err);
      resolve();
    });
  });

  if (!req.file) {
    throw AppError.badRequest("Please upload a PDF resume.");
  }

  let pdfData;
  try {
    pdfData = await pdfParse(req.file.buffer);
  } catch {
    throw AppError.badRequest(
      "Could not parse the PDF. Please ensure it is a valid PDF file."
    );
  }

  const resumeText = pdfData.text;
  if (!resumeText || resumeText.trim().length < 50) {
    throw AppError.badRequest(
      "Resume appears to be empty or too short. Please upload a text-based PDF."
    );
  }

  return { resumeText, fileName: req.file.originalname };
}

/**
 * @desc    Upload resume, extract skills with AI, analyze, and suggest internships
 * @route   POST /api/resume/analyze
 * @access  Private
 */
export const analyzeAndRecommend = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { resumeText, fileName } = await parsePdfFromRequest(req, res);

  // Enqueue AI parsing job or process synchronously
  if (isQueueActive && resumeQueue) {
    const job = await resumeQueue.add("parse-resume-ai", {
      userId: req.user?._id,
      resumeText,
      fileName,
      type: "ai", // AI-powered extraction
    });

    logger.info("Resume enqueued for AI analysis", {
      user: req.user?._id,
      jobId: job.id,
    });

    return res.status(202).json({
      success: true,
      message: "AI Resume analysis started. Processing in background.",
      data: {
        jobId: job.id,
      },
    });
  }

  // Synchronous Fallback
  logger.info("Redis unavailable, analyzing resume synchronously", {
    user: req.user?._id,
  });
  const result = await processResumeJobLogic({
    userId: req.user?._id,
    resumeText,
    fileName,
    type: "ai",
  });

  return res.status(200).json({
    success: true,
    message: "AI Resume analysis and processing successful.",
    data: {
      result,
    },
  });
});

/**
 * @desc    Get status of a resume parsing job
 * @route   GET /api/resume/status/:jobId
 * @access  Private
 */
export const getJobStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;

  if (!isQueueActive || !resumeQueue) {
    throw AppError.badRequest("Background processing is disabled (Redis unavailable).");
  }

  const job = await Job.fromId(resumeQueue, jobId as string);

  if (!job) {
    throw AppError.notFound("Job not found or has expired.");
  }

  const status = await job.getState();
  const result = (job as any).returnvalue;
  const progress = job.progress;

  res.status(200).json({
    success: true,
    data: {
      id: job.id,
      status,
      progress,
      result,
    },
  });
});
