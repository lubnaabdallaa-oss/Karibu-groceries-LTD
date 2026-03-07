/**
 * File purpose: Defines authentication and authorization route protections.
 */
const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { login } = require("../controllers/authController");

const router = express.Router();

// Public route used by frontend login page to get JWT.
router.post("/login", asyncHandler(login));

module.exports = router;

