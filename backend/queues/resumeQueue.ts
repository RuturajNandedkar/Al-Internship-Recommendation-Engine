import { redisClient, REDIS_ENABLED } from "../config/redis";
import logger from "../utils/logger";
import { extractProfileFromResume, getFullResumeAnalysis } from "../services/resumeService";
import { getRecommendations } from "../services/recommendationService";
import User from "../models/User";
import Profile from "../models/Profile";
import RecommendationHistory from "../models/RecommendationHistory";

const QUEUE_NAME = "resume-parsing";

/**
 * Core resume processing logic - shared between background worker and synchronous fallback.
 */
export const processResumeJobLogic = async (data: any) => {
  const { userId, resumeText, fileName, type } = data;
  logger.info(`Processing resume job`, { userId, type });

  try {
    let extractedProfile;
    let analysis = null;

    if (type === "ai") {
      const result = await getFullResumeAnalysis(resumeText);
      extractedProfile = result.extractedProfile;
      analysis = result.analysis;
    } else {
      extractedProfile = extractProfileFromResume(resumeText);
    }

    // Update User and Profile in DB
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.resumeText = resumeText.substring(0, 10000);
        user.resumeFileName = fileName;
        await user.save();

        if (user.profile) {
          await Profile.findByIdAndUpdate(user.profile, {
            skills: extractedProfile.skills,
            interests: extractedProfile.interests,
            preferred_domain: extractedProfile.preferred_domain,
            experience_level: extractedProfile.experience_level,
          });
        }
      }
    }

    // Generate recommendations
    const recommendations = await getRecommendations({
      skills: extractedProfile.skills,
      interests: extractedProfile.interests,
      preferred_domain: extractedProfile.preferred_domain,
      experience_level: extractedProfile.experience_level,
    });

    // Save to history
    if (userId) {
      await RecommendationHistory.create({
        userId,
        profileSnapshot: extractedProfile,
        recommendations: recommendations.slice(0, 10).map((r: any) => ({
          internshipId: r._id,
          title: r.title,
          company: r.company,
          score: r.score,
          reasoning: r.reasoning || "",
        })),
        source: type === "ai" ? "ai-resume" : "backend",
      });
    }

    return {
      success: true,
      extractedProfile,
      analysis,
      recommendations,
      fileName,
    };
  } catch (error: any) {
    logger.error(`Error processing resume job`, { error: error.message });
    throw error;
  }
};

// 1. Initialize Queue (Only if Redis is enabled)
export const isQueueActive = REDIS_ENABLED;
let resumeQueueRef: any = null;

if (REDIS_ENABLED) {
  try {
    const { Queue } = require("bullmq");
    resumeQueueRef = new Queue(QUEUE_NAME, { connection: redisClient! });
  } catch (error: any) {
    logger.error("Failed to initialize BullMQ Queue", { error: error.message });
  }
}

export const resumeQueue = resumeQueueRef;

// 2. Initialize Worker (Only if Redis is enabled)
let resumeWorkerRef: any = null;

if (REDIS_ENABLED) {
  try {
    const { Worker } = require("bullmq");
    resumeWorkerRef = new Worker(
      QUEUE_NAME,
      async (job: any) => {
        return processResumeJobLogic(job.data);
      },
      {
        connection: redisClient!,
        concurrency: 5,
      }
    );

    resumeWorkerRef.on("completed", (job: any) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    resumeWorkerRef.on("failed", (job: any, err: Error) => {
      logger.error(`Job ${job?.id} failed`, { error: err.message });
    });
  } catch (error: any) {
    logger.error("Failed to initialize BullMQ Worker", { error: error.message });
  }
}

export const resumeWorker = resumeWorkerRef;
