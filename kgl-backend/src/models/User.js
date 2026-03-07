/**
 * File purpose: User schema for manager/agent/director accounts.
 */
const mongoose = require("mongoose");
const { BRANCHES } = require("../config/constants");

// System users: manager, agent, and director (director is not branch-bound).
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 2 },
    fullName: { type: String, required: true, trim: true, minlength: 2 },
    role: { type: String, enum: ["manager", "agent", "director"], required: true },
    branch: {
      type: String,
      enum: BRANCHES,
      required: function requiredBranch() {
        return this.role !== "director";
      },
      default: null,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

