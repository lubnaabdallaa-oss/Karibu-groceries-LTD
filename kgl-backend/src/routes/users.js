/**
 * File purpose: Director-only user management routes.
 */
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userManagementController");

const router = express.Router();

router.use(requireAuth, requireRole("director"));

router.get("/", asyncHandler(listUsers));
router.post("/", asyncHandler(createUser));
router.patch("/:id", asyncHandler(updateUser));
router.delete("/:id", asyncHandler(deleteUser));

module.exports = router;
