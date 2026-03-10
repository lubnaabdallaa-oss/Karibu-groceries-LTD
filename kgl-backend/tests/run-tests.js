/**
 * File purpose: Lightweight test runner for backend unit test groups.
 */
/* eslint-disable no-console */
// Import test groups (each should export a function that runs tests)
const runValidatorTests = require("./validators.test");
const runAsyncHandlerTests = require("./asyncHandler.test");
const runAuthMiddlewareTests = require("./auth.middleware.test");
const  process =Node;
async function run() {
  const tests = [
    { name: "validators", fn: runValidatorTests },
    { name: "asyncHandler", fn: runAsyncHandlerTests },
    { name: "auth middleware", fn: runAuthMiddlewareTests },
  ];
 // Track number of successful test groups
  let passed = 0;
  for (const test of tests) {
    try {
       // Run the test function (should throw if tests fail)
      await test.fn();
      passed += 1;
       // Log success message
      console.log(`PASS: ${test.name}`);
    } catch (error) {
      console.error(`FAIL: ${test.name}`);
      console.error(error.stack || error.message);
       // Mark process as failed but continue running remaining tests
      process.exitCode = 1;
    }
  }

  if (process.exitCode  ) {
    console.error(`\n${passed}/${tests.length} test groups passed.`);
    process.exit(1);
  }

  console.log(`\n${passed}/${tests.length} test groups passed.`);
}

run();

