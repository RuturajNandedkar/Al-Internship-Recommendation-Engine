import express from "express";
import {
  getAllInternships,
  getInternship,
  saveRecommendation,
  getSavedRecommendations,
  deleteSavedRecommendation,
} from "../controllers/internshipController";
import {
  validateObjectId,
  validateSaveRecommendation,
} from "../middleware/validateRequest";

const router = express.Router();

// GET /api/internships — list all internships
router.get("/", getAllInternships);

// POST /api/internships/save — bookmark/save a recommended internship
router.post("/save", validateSaveRecommendation, saveRecommendation);

// GET /api/internships/saved/:id — get all saved recommendations for a profile
router.get("/saved/:id", validateObjectId as any, getSavedRecommendations);

// DELETE /api/internships/saved/:id — remove a saved recommendation
router.delete("/saved/:id", validateObjectId as any, deleteSavedRecommendation);

// GET /api/internships/:id — get a single internship (keep after /save & /saved routes)
router.get("/:id", validateObjectId as any, getInternship);

export default router;
