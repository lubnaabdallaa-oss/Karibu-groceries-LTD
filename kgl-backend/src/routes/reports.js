/**
 * File purpose: Defines reporting routes for manager and director dashboards.
 */
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { getDirectorSummary, getBranchSummary } = require("../controllers/reportController");

const router = express.Router();

// Director-only aggregate across all branches.
router.get("/director-summary", requireAuth, requireRole("director"), asyncHandler(getDirectorSummary));
router.get("/branch-summary", requireAuth, requireRole(["manager", "agent"]), asyncHandler(getBranchSummary));

module.exports = router;

