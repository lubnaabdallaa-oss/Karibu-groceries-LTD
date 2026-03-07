/**
 * File purpose: Utility helpers for consistent JSON success/error responses.
 */
/**
 * Shared response helpers to keep controller responses consistent.
 */
function success(res, status, payload) {
  return res.status(status).json(payload);
}

function fail(res, status, message, extra = {}) {
  return res.status(status).json({ error: message, ...extra });
}

module.exports = { success, fail };

