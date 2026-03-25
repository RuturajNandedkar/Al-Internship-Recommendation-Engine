/**
 * Custom application error class with HTTP status codes.
 * Use instead of raw Error for operational errors.
 */
class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string = "Bad request"): AppError {
    return new AppError(msg, 400);
  }

  static unauthorized(msg: string = "Unauthorized"): AppError {
    return new AppError(msg, 401);
  }

  static forbidden(msg: string = "Forbidden"): AppError {
    return new AppError(msg, 403);
  }

  static notFound(msg: string = "Resource not found"): AppError {
    return new AppError(msg, 404);
  }

  static conflict(msg: string = "Conflict"): AppError {
    return new AppError(msg, 409);
  }

  static tooMany(msg: string = "Too many requests"): AppError {
    return new AppError(msg, 429);
  }
}

export default AppError;
