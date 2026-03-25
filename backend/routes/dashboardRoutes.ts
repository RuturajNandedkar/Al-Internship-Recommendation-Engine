import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { protect } from "../middleware/auth";
import {
  getDashboard,
  getHistory,
  getSaved,
  saveInternship,
  removeSaved,
} from "../controllers/dashboardController";

const router = express.Router();

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e: any) => ({ field: e.path, message: e.msg })),
    });
    return;
  }
  next();
};

// All dashboard routes require authentication
router.use(protect as any);

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

export default router;
