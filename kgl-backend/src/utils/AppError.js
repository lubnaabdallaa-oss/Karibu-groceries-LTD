/**
 * File purpose: Custom error type carrying HTTP status and message details.
 */
/**
 * Small HTTP-aware error type used across controllers/services.
 */
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

module.exports = AppError;

