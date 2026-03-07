/**
 * File purpose: Unit test for async handler error forwarding behavior.
 */
const assert = require("node:assert/strict");
const asyncHandler = require("../src/utils/asyncHandler");

module.exports = async function runAsyncHandlerTests() {
  const expected = new Error("controller failed");
  const wrapped = asyncHandler(async () => {
    throw expected;
  });

  let captured;
  await new Promise((resolve) => {
    wrapped({}, {}, (err) => {
      captured = err;
      resolve();
    });
  });

  assert.equal(captured, expected);
};

