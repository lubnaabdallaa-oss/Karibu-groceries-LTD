/**
 * File purpose: Lightweight test runner for backend unit test groups.
 */
/* eslint-disable no-console */
const runValidatorTests = require("./validators.test");
const runAsyncHandlerTests = require("./asyncHandler.test");
const runAuthMiddlewareTests = require("./auth.middleware.test");

async function run() {
  const tests = [
    { name: "validators", fn: runValidatorTests },
    { name: "asyncHandler", fn: runAsyncHandlerTests },
    { name: "auth middleware", fn: runAuthMiddlewareTests },
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      await test.fn();
      passed += 1;
      console.log(`PASS: ${test.name}`);
    } catch (error) {
      console.error(`FAIL: ${test.name}`);
      console.error(error.stack || error.message);
      process.exitCode = 1;
    }
  }

  if (process.exitCode) {
    console.error(`\n${passed}/${tests.length} test groups passed.`);
    process.exit(1);
  }

  console.log(`\n${passed}/${tests.length} test groups passed.`);
}

run();

