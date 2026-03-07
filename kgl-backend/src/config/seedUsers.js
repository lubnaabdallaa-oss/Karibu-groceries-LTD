/**
 * File purpose: Seeds default users for local setup and demos.
 */
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Default users to simplify first-run login and demo setup.
const defaultUsers = [
  { username: "kgl_admin", password: "groceries2026", role: "manager", branch: "maganjo", fullName: "KGL Manager" },
  { username: "agent_maganjo", password: "groceries2026", role: "agent", branch: "maganjo", fullName: "Maganjo Agent" },
  { username: "agent_matugga", password: "groceries2026", role: "agent", branch: "matugga", fullName: "Matugga Agent" },
  { username: "orban", password: "groceries2026", role: "director", branch: null, fullName: "Mr. Orban" },
  { username: "manager", password: "groceries2026", role: "manager", branch: "maganjo", fullName: "Manager User" },
  { username: "director", password: "groceries2026", role: "director", branch: null, fullName: "Director User" },
  { username: "salesagent", password: "groceries2026", role: "agent", branch: "matugga", fullName: "Sales Agent User" }
];

async function seedDefaultUsers() {
  // Upsert-like seed: update existing users by username (case-insensitive) or create new ones.
  for (const user of defaultUsers) {
    try {
      const normalizedUsername = String(user.username).trim().toLowerCase();
      const escapedUsername = normalizedUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existing = await User.findOne({
        username: { $regex: `^${escapedUsername}$`, $options: "i" },
      });
      const passwordHash = await bcrypt.hash(user.password, 10);

      if (existing) {
        // Keep the original username to avoid unique index collisions with legacy records.
        existing.role = user.role;
        existing.branch = user.branch;
        existing.fullName = user.fullName;
        existing.passwordHash = passwordHash;
        await existing.save();
        continue;
      }

      await User.create({
        username: normalizedUsername,
        passwordHash,
        role: user.role,
        branch: user.branch,
        fullName: user.fullName,
      });
    } catch (error) {
      // Seed failures should not crash app boot in dev mode.
      console.warn(`Seed warning for '${user.username}': ${error.message}`);
    }
  }
}

module.exports = { seedDefaultUsers };

