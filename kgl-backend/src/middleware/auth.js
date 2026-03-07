/**
 * File purpose: Defines authentication and authorization route protections.
 */
const jwt = require("jsonwebtoken");

// Verifies bearer token and attaches authenticated user payload to req.user.
function requireAuth(req, res, next) {
  const env = globalThis.process?.env || {};
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET || "oogNGVc!3xy(KgcD");
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role gate middleware; accepts a single role or a list of roles.
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
