const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production");
}

/**
 * Middleware: require a valid JWT token.
 * Attaches req.user with the authenticated user document.
 */
const protect = async (req, _res, next) => {
  try {
    let token;

    // Accept token from Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw AppError.unauthorized("Not authenticated. Please log in.");
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET || "dev-secret-change-me");

    // Attach user (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw AppError.unauthorized("User no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(AppError.unauthorized("Invalid token."));
    }
    if (error.name === "TokenExpiredError") {
      return next(AppError.unauthorized("Token expired. Please log in again."));
    }
    next(error);
  }
};

/**
 * Middleware: optionally attach user if token is present, but don't block.
 * Useful for routes that work for both authenticated and anonymous users.
 */
const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET || "dev-secret-change-me");
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch {
    // Silently ignore — anonymous request
  }
  next();
};

/**
 * Middleware: restrict to specific roles.
 * Must be used after protect().
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AppError.forbidden("You do not have permission to perform this action."));
    }
    next();
  };
};

/**
 * Generate a signed JWT for a user.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET || "dev-secret-change-me", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = { protect, optionalAuth, authorize, generateToken };
