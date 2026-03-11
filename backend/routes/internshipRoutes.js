const express = require("express");
const router = express.Router();
const {
  getAllInternships,
  getInternship,
  saveRecommendation,
  getSavedRecommendations,
  deleteSavedRecommendation,
} = require("../controllers/internshipController");
const {
  validateObjectId,
  validateSaveRecommendation,
} = require("../middleware/validateRequest");

// GET /api/internships — list all internships
router.get("/", getAllInternships);

// POST /api/internships/save — bookmark/save a recommended internship
router.post("/save", validateSaveRecommendation, saveRecommendation);

// GET /api/internships/saved/:id — get all saved recommendations for a profile
router.get("/saved/:id", validateObjectId, getSavedRecommendations);

// DELETE /api/internships/saved/:id — remove a saved recommendation
router.delete("/saved/:id", validateObjectId, deleteSavedRecommendation);

// GET /api/internships/:id — get a single internship (keep after /save & /saved routes)
router.get("/:id", validateObjectId, getInternship);

module.exports = router;
