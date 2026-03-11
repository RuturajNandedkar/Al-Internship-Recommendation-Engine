const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getAIRecommendation,
} = require("../controllers/aiRecommendationController");

// Reuse the validation-error handler from existing middleware
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

const validateAIRecommendation = [
  body("skills")
    .isArray({ min: 1 })
    .withMessage("At least one skill must be provided"),
  body("skills.*")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each skill must be a non-empty string"),
  body("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array"),
  body("interests.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each interest must be a non-empty string"),
  body("experience")
    .notEmpty()
    .withMessage("Experience level is required")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Experience must be Beginner, Intermediate, or Advanced"),
  handleValidationErrors,
];

// POST /api/ai-recommendation
router.post("/", validateAIRecommendation, getAIRecommendation);

module.exports = router;
