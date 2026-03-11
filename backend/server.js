const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Route imports
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const aiRecommendationRoutes = require("./routes/aiRecommendationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

// ─── Initialize Express ─────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ─────────────────────────────────────────────────────
connectDB();

// ─── Global Middleware ──────────────────────────────────────────────────────

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
  })
);

// Prevent parameter pollution
app.disable("x-powered-by");

// CORS — allow requests from the frontend origin
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Request logging via Winston
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: logger.stream,
      skip: (_req, res) => res.statusCode < 400,
    })
  );
  app.use(morgan("dev")); // console output in dev
}

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ──────────────────────────────────────────────────────────

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
  },
});

// Strict limit for AI endpoints (expensive)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "AI rate limit reached. Please try again later.",
  },
});

app.use("/api/", apiLimiter);

// ─── API Routes ─────────────────────────────────────────────────────────────

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/ai-recommendation", aiLimiter, aiRecommendationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/skill-gap", aiLimiter, skillGapRoutes);
app.use("/api/resume", aiLimiter, resumeRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
  let dbStatus = "disconnected";
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) dbStatus = "connected";
  } catch { /* ignore */ }

  res.status(200).json({
    success: true,
    message: "Server is running",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.round(process.uptime()),
    database: dbStatus,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heap: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── API Documentation Endpoint ─────────────────────────────────────────────

app.get("/api/docs", (_req, res) => {
  res.status(200).json({
    name: "AI Internship Recommendation Engine API",
    version: "2.0.0",
    description: "AI-powered internship matching with resume parsing, skill gap analysis, and personalized recommendations",
    baseUrl: "/api",
    authentication: "JWT Bearer token (include in Authorization header)",
    rateLimits: {
      general: "100 requests / 15 min",
      auth: "20 requests / 15 min",
      ai: "10 requests / 15 min",
    },
    endpoints: {
      auth: {
        "POST /api/auth/signup": { description: "Register a new user", body: "{ name, email, password }", auth: false },
        "POST /api/auth/login": { description: "Login and get JWT token", body: "{ email, password }", auth: false },
        "GET /api/auth/me": { description: "Get current user profile", auth: true },
        "PUT /api/auth/me": { description: "Update user profile", body: "{ name, email }", auth: true },
      },
      profiles: {
        "POST /api/profiles": { description: "Create a candidate profile", body: "{ skills[], interests[], preferred_domain, experience_level, location }", auth: false },
        "GET /api/profiles": { description: "List all profiles", auth: false },
        "GET /api/profiles/:id": { description: "Get profile by ID", auth: false },
      },
      recommendations: {
        "POST /api/recommendations": { description: "Generate internship recommendations from profile", body: "{ skills[], interests[], preferred_domain, experience_level, location }", auth: false },
        "GET /api/recommendations/:id": { description: "Get recommendations by profile ID", auth: false },
      },
      internships: {
        "GET /api/internships": { description: "List all internships (filterable)", query: "?domain=AI&search=python", auth: false },
        "GET /api/internships/:id": { description: "Get internship by ID", auth: false },
        "POST /api/internships/save": { description: "Save/bookmark an internship", body: "{ profileId, internshipId, score }", auth: false },
        "GET /api/internships/saved/:profileId": { description: "Get saved internships for profile", auth: false },
        "DELETE /api/internships/saved/:id": { description: "Remove saved internship", auth: false },
      },
      ai: {
        "POST /api/ai-recommendation": { description: "AI-powered recommendations via OpenAI", body: "{ skills[], interests[], experience }", auth: false, rateLimit: "10/15min" },
      },
      dashboard: {
        "GET /api/dashboard": { description: "Dashboard summary with analytics", auth: true },
        "GET /api/dashboard/history": { description: "Paginated recommendation history", query: "?page=1&limit=10", auth: true },
        "GET /api/dashboard/saved": { description: "All saved internships", auth: true },
        "POST /api/dashboard/save": { description: "Save internship from dashboard", body: "{ internshipId, score, breakdown, reasoning }", auth: true },
        "DELETE /api/dashboard/saved/:id": { description: "Remove saved internship", auth: true },
      },
      skillGap: {
        "POST /api/skill-gap": { description: "AI skill gap analysis with learning path", body: "{ skills[], interests[], experience_level, preferred_domain }", auth: false, rateLimit: "10/15min" },
      },
      resume: {
        "POST /api/resume/upload": { description: "Upload PDF resume for parsing and recommendations", body: "multipart/form-data (file: .pdf)", auth: true, rateLimit: "10/15min" },
        "POST /api/resume/analyze": { description: "AI-powered resume analysis", body: "multipart/form-data (file: .pdf)", auth: true, rateLimit: "10/15min" },
      },
      utility: {
        "GET /api/health": { description: "Server health check", auth: false },
        "GET /api/docs": { description: "This API documentation", auth: false },
      },
    },
    scoring: {
      algorithm: "TF-IDF Cosine Similarity + Multi-Factor Weighted Scoring",
      version: "2.0",
      factors: {
        skill_match: "40% — TF-IDF cosine similarity + substring coverage + Jaccard",
        domain_match: "20% — Exact, related, or no match",
        interest_match: "15% — Token-level Jaccard similarity",
        location_match: "10% — City, region, and remote matching",
        experience_fit: "10% — Role complexity vs experience level",
        recency: "5% — Newer postings scored higher",
      },
    },
    aiCapabilities: {
      recommendation: "OpenAI GPT-3.5 + Google Gemini 2.0 (client-side)",
      resumeParsing: "PDF extraction + AI skill detection + section analysis",
      skillGap: "Domain-specific gap analysis with learning paths",
      fallback: "Rule-based scoring when AI is unavailable",
    },
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
