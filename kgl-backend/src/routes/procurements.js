/**
 * File purpose: Defines procurement API routes and role access rules.
 */
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { createProcurement, getProcurements } = require("../controllers/procurementController");

const router = express.Router();

// Only managers can record procurement entries.
router.post("/", requireAuth, requireRole("manager"), asyncHandler(createProcurement));
router.get("/", requireAuth, requireRole(["manager", "agent", "director"]), asyncHandler(getProcurements));

module.exports = router;

