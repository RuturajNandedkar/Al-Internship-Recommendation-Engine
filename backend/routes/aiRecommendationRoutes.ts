import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import {
  getAIRecommendation,
} from "../controllers/aiRecommendationController";

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
router.post("/", validateAIRecommendation, getAIRecommendation as any);

export default router;
