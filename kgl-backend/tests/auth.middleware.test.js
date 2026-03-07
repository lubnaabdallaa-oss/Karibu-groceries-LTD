/**
 * File purpose: Unit tests for JWT authentication and role middleware.
 */
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { requireAuth, requireRole } = require("../src/middleware/auth");

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

module.exports = function runAuthMiddlewareTests() {
  const token = jwt.sign(
    { username: "manager", role: "manager", branch: "maganjo" },
    "replace-this-secret"
  );

  const reqAuthOk = { headers: { authorization: `Bearer ${token}` } };
  const resAuthOk = createMockRes();
  let nextCalled = false;

  requireAuth(reqAuthOk, resAuthOk, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(reqAuthOk.user.username, "manager");

  const reqMissingToken = { headers: {} };
  const resMissingToken = createMockRes();
  requireAuth(reqMissingToken, resMissingToken, () => {});
  assert.equal(resMissingToken.statusCode, 401);
  assert.equal(resMissingToken.body.error, "Authentication required");

  const reqRole = { user: { role: "agent" } };
  const resRole = createMockRes();
  let roleNextCalled = false;
  requireRole(["director"])(reqRole, resRole, () => {
    roleNextCalled = true;
  });

  assert.equal(roleNextCalled, false);
  assert.equal(resRole.statusCode, 403);
  assert.equal(resRole.body.error, "Forbidden");
};

