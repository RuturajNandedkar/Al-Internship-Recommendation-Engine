import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { getSkillGapAnalysis } from "../controllers/skillGapController";
import { optionalAuth } from "../middleware/auth";

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

// POST /api/skill-gap — works for both authenticated and anonymous users
router.post(
  "/",
  optionalAuth as any,
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

export default router;
