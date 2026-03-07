/**
 * File purpose: Wraps async Express handlers so errors are forwarded consistently.
 */
/**
 * Wrap async route handlers so rejected promises are forwarded to Express error middleware.
 */
module.exports = function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

