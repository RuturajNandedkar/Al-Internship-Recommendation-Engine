import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import AppError from "../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production");
}

interface JwtPayload {
  id: string;
}

/**
 * Middleware: require a valid JWT token.
 * Attaches req.user with the authenticated user document.
 */
export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Accept token from Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw AppError.unauthorized("Not authenticated. Please log in.");
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET || "dev-secret-change-me") as JwtPayload;

    // Attach user (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw AppError.unauthorized("User no longer exists.");
    }

    req.user = user as IUser;
    next();
  } catch (error: any) {
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
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET || "dev-secret-change-me") as JwtPayload;
      req.user = (await User.findById(decoded.id).select("-password")) as IUser;
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
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AppError.forbidden("You do not have permission to perform this action."));
    }
    next();
  };
};

/**
 * Generate a signed JWT for a user.
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, (JWT_SECRET || "dev-secret-change-me") as jwt.Secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });
};
