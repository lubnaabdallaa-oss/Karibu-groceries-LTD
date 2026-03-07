/**
 * File purpose: Contains reusable input normalization and validation helpers.
 */
const AppError = require("../utils/AppError");

// Standardize human names/labels before validation/storage.
function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

// Throw structured errors that can be mapped to HTTP responses.
function throwIf(condition, message, status = 400) {
  if (condition) {
    throw new AppError(message, status);
  }
}

// Uganda phone formats accepted by the business rules.
function validatePhone(value) {
  return /^(?:\+256|0)7\d{8}$/.test(String(value || "").trim());
}

function validateNin(value) {
  const normalized = String(value || "").trim().toUpperCase();
  // Accepts common Uganda NIN lengths used in practice: prefix + 11/12 alphanumeric chars.
  return /^(CM|CF)[A-Z0-9]{11,12}$/.test(normalized);
}

module.exports = { normalizeName, throwIf, validatePhone, validateNin };

