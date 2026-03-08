/**
 * File purpose: Director-only user management operations.
 */
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { BRANCHES } = require("../config/constants");
const { normalizeName, throwIf } = require("../config/validators");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeRole(role) {
  const raw = String(role || "").trim().toLowerCase();
  return raw === "salesagent" ? "agent" : raw;
}

function buildSafeUser(userDoc) {
  return {
    id: String(userDoc._id),
    username: userDoc.username,
    fullName: userDoc.fullName,
    role: userDoc.role,
    branch: userDoc.branch,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

exports.listUsers = async (req, res) => {
  const rows = await User.find({}).sort({ createdAt: -1 }).lean();
  res.json(rows.map(buildSafeUser));
};

exports.createUser = async (req, res) => {
  const payload = req.body || {};
  const username = String(payload.username || "").trim().toLowerCase();
  const fullName = normalizeName(payload.fullName);
  const role = normalizeRole(payload.role);
  const branchRaw = String(payload.branch || "").trim().toLowerCase();
  const password = String(payload.password || "");

  throwIf(!username, "Username is required");
  throwIf(!fullName, "Full name is required");
  throwIf(!["manager", "agent", "director"].includes(role), "Invalid role");
  throwIf(password.length < 6, "Password must be at least 6 characters");

  const branch = role === "director" ? null : branchRaw;
  if (role !== "director") {
    throwIf(!branch, "Branch is required for manager and agent");
    throwIf(!BRANCHES.includes(branch), "Invalid branch");
  }

  const existing = await User.findOne({
    username: { $regex: `^${escapeRegex(username)}$`, $options: "i" },
  }).lean();
  throwIf(Boolean(existing), "Username already exists", 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await User.create({
    username,
    fullName,
    role,
    branch,
    passwordHash,
  });

  return res.status(201).json({
    message: "User created",
    user: buildSafeUser(created),
  });
};

exports.updateUser = async (req, res) => {
  const userId = String(req.params.id || "").trim();
  throwIf(!userId, "User id is required");

  const user = await User.findById(userId);
  throwIf(!user, "User not found", 404);

  const payload = req.body || {};
  if (payload.fullName !== undefined) {
    user.fullName = normalizeName(payload.fullName);
    throwIf(!user.fullName, "Full name cannot be empty");
  }

  if (payload.role !== undefined) {
    const role = normalizeRole(payload.role);
    throwIf(!["manager", "agent", "director"].includes(role), "Invalid role");
    user.role = role;
  }

  if (payload.branch !== undefined || payload.role !== undefined) {
    const incomingBranch = payload.branch === undefined
      ? user.branch
      : String(payload.branch || "").trim().toLowerCase();

    if (user.role === "director") {
      user.branch = null;
    } else {
      throwIf(!incomingBranch, "Branch is required for manager and agent");
      throwIf(!BRANCHES.includes(incomingBranch), "Invalid branch");
      user.branch = incomingBranch;
    }
  }

  if (payload.password !== undefined) {
    const password = String(payload.password || "");
    throwIf(password.length < 6, "Password must be at least 6 characters");
    user.passwordHash = await bcrypt.hash(password, 10);
  }

  await user.save();

  return res.json({
    message: "User updated",
    user: buildSafeUser(user),
  });
};

exports.deleteUser = async (req, res) => {
  const userId = String(req.params.id || "").trim();
  throwIf(!userId, "User id is required");

  throwIf(String(req.user.id) === userId, "You cannot delete your own account", 400);

  const deleted = await User.findByIdAndDelete(userId).lean();
  throwIf(!deleted, "User not found", 404);

  return res.json({ message: "User deleted" });
};
