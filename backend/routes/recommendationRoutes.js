const express = require("express");
const router = express.Router();
const {
  recommend,
  recommendByProfileId,
} = require("../controllers/recommendationController");
const {
  validateProfile,
  validateObjectId,
} = require("../middleware/validateRequest");
const { optionalAuth } = require("../middleware/auth");

// POST /api/recommendations — submit profile data and get recommendations
router.post("/", optionalAuth, validateProfile, recommend);

// GET /api/recommendations/:id — get recommendations for an existing profile
router.get("/:id", validateObjectId, recommendByProfileId);

module.exports = router;
