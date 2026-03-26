import { Queue, Worker, Job } from "bullmq";
import redis from "../config/redis";
import logger from "../utils/logger";
import { extractProfileFromResume, getFullResumeAnalysis } from "../services/resumeService";
import { getRecommendations } from "../services/recommendationService";
import User from "../models/User";
import Profile from "../models/Profile";
import RecommendationHistory from "../models/RecommendationHistory";

const QUEUE_NAME = "resume-parsing";

// 1. Initialize Queue
export const resumeQueue = new Queue(QUEUE_NAME, {
  connection: redis,
});

// 2. Initialize Worker
export const resumeWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { userId, resumeText, fileName, type } = job.data;
    logger.info(`Processing resume job ${job.id}`, { userId, type });

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
      logger.error(`Error processing job ${job.id}`, { error: error.message });
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

resumeWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

resumeWorker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed`, { error: err.message });
});
