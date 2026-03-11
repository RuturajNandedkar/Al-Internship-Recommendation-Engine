const { body, param, validationResult } = require("express-validator");

/**
 * Middleware that checks express-validator results.
 * Returns 400 with error details if validation fails.
 */
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

/**
 * Validation rules for profile creation.
 */
const validateProfile = [
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
  body("preferred_domain")
    .optional()
    .isString()
    .trim(),
  body("experience_level")
    .notEmpty()
    .withMessage("Experience level is required")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Experience level must be beginner, intermediate, or advanced"),
  body("location")
    .optional()
    .isString()
    .trim(),
  handleValidationErrors,
];

/**
 * Validation rules for saving a recommendation.
 */
const validateSaveRecommendation = [
  body("profileId")
    .notEmpty()
    .withMessage("Profile ID is required")
    .isMongoId()
    .withMessage("Invalid profile ID format"),
  body("internshipId")
    .notEmpty()
    .withMessage("Internship ID is required")
    .isMongoId()
    .withMessage("Invalid internship ID format"),
  body("score")
    .isInt({ min: 0, max: 100 })
    .withMessage("Score must be between 0 and 100"),
  body("breakdown")
    .optional()
    .isObject()
    .withMessage("Breakdown must be an object"),
  body("reasoning")
    .optional()
    .isString(),
  handleValidationErrors,
];

/**
 * Validate MongoDB ObjectId param.
 */
const validateObjectId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid ID format"),
  handleValidationErrors,
];

module.exports = {
  validateProfile,
  validateSaveRecommendation,
  validateObjectId,
};
