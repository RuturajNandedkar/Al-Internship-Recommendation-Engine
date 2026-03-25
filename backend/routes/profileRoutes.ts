import express from "express";
import {
  createProfile,
  getProfile,
  getAllProfiles,
} from "../controllers/profileController";
import {
  validateProfile,
  validateObjectId,
} from "../middleware/validateRequest";

const router = express.Router();

// POST /api/profiles — submit a new user profile
router.post("/", validateProfile as any, createProfile);

// GET /api/profiles — list all profiles
router.get("/", getAllProfiles);

// GET /api/profiles/:id — get a single profile
router.get("/:id", validateObjectId as any, getProfile);

export default router;
