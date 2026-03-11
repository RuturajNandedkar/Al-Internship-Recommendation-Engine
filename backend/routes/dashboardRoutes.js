const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { protect } = require("../middleware/auth");
const {
  getDashboard,
  getHistory,
  getSaved,
  saveInternship,
  removeSaved,
} = require("../controllers/dashboardController");

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

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard — summary stats
router.get("/", getDashboard);

// GET /api/dashboard/history — paginated recommendation history
router.get("/history", getHistory);

// GET /api/dashboard/saved — all saved internships
router.get("/saved", getSaved);

// POST /api/dashboard/save — save an internship
router.post(
  "/save",
  [
    body("internshipId").isMongoId().withMessage("Valid internship ID required"),
    body("score").optional().isInt({ min: 0, max: 100 }),
    handleValidationErrors,
  ],
  saveInternship
);

// DELETE /api/dashboard/saved/:id — remove saved
router.delete(
  "/saved/:id",
  [param("id").isMongoId().withMessage("Invalid ID"), handleValidationErrors],
  removeSaved
);

module.exports = router;
