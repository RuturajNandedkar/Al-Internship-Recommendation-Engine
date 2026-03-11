const express = require("express");
const router = express.Router();
const {
  createProfile,
  getProfile,
  getAllProfiles,
} = require("../controllers/profileController");
const {
  validateProfile,
  validateObjectId,
} = require("../middleware/validateRequest");

// POST /api/profiles — submit a new user profile
router.post("/", validateProfile, createProfile);

// GET /api/profiles — list all profiles
router.get("/", getAllProfiles);

// GET /api/profiles/:id — get a single profile
router.get("/:id", validateObjectId, getProfile);

module.exports = router;
