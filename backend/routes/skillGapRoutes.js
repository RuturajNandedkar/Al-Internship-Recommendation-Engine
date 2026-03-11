const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { getSkillGapAnalysis } = require("../controllers/skillGapController");
const { optionalAuth } = require("../middleware/auth");

const { validationResult } = require("express-validator");
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// POST /api/skill-gap — works for both authenticated and anonymous users
router.post(
  "/",
  optionalAuth,
  [
    body("skills").isArray({ min: 1 }).withMessage("At least one skill required"),
    body("skills.*").isString().trim().notEmpty(),
    body("preferred_domain").optional().isString().trim(),
    body("experience_level")
      .optional()
      .isIn(["beginner", "intermediate", "advanced"]),
    handleValidationErrors,
  ],
  getSkillGapAnalysis
);

module.exports = router;
