/**
 * File purpose: Unit tests for validator and normalization utilities.
 */
const assert = require("node:assert/strict");
const { normalizeName, validatePhone, validateNin, throwIf } = require("../src/config/validators");

module.exports = function runValidatorTests() {
  assert.equal(normalizeName("  Grain   Maize  "), "Grain Maize");
  assert.equal(validatePhone("0701234567"), true);
  assert.equal(validatePhone("+256701234567"), true);
  assert.equal(validatePhone("071234567"), false);
  assert.equal(validatePhone("1234567890"), false);
  assert.equal(validateNin("CMA1B2C3D4E56"), true);
  assert.equal(validateNin("cf123456789ab"), true);

  try {
    throwIf(true, "Bad Request", 422);
    assert.fail("Expected throwIf to throw");
  } catch (error) {
    assert.equal(error.name, "AppError");
    assert.equal(error.status, 422);
    assert.equal(error.message, "Bad Request");
  }
};

