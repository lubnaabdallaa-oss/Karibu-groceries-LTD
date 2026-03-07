/**
 * File purpose: Defines inventory read routes for authorized users.
 */
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { getInventory } = require("../controllers/inventoryController");

const router = express.Router();

// All authenticated roles can view inventory, agents are limited to their branch in controller logic.
router.get("/", requireAuth, requireRole(["manager", "agent", "director"]), asyncHandler(getInventory));

module.exports = router;

