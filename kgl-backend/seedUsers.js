/* global __dirname */
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const SEED_USER = {
  fullName: "Mr. Orban",
  email: "orban@2kgl.com",
  password: "orban123!",
  username: "orban",
  role: "director",
  branch: null,
};

async function seedUsers() {
  try {
    const email = String(SEED_USER.email).trim().toLowerCase();
    const normalizedRole = String(SEED_USER.role).trim().toLowerCase();
    const hasEmailField = Boolean(User.schema.path("email"));
    const username =
      (SEED_USER.username && String(SEED_USER.username).trim().toLowerCase()) ||
      email.split("@")[0];

    const existingUser = hasEmailField
      ? await User.findOne({ email })
      : await User.findOne({ username });

    if (existingUser) {
      const identifier = hasEmailField ? email : username;
      console.log(`Seed user already exists: ${identifier}`);
      return;
    }

    const passwordHash = await bcrypt.hash(SEED_USER.password, 10);
    const payload = {
      fullName: String(SEED_USER.fullName).trim(),
      role: normalizedRole,
      passwordHash,
      username,
      branch: normalizedRole === "director" ? null : SEED_USER.branch,
    };

    if (hasEmailField) {
      payload.email = email;
    }

    await User.create(payload);

    const createdIdentifier = hasEmailField ? email : username;
    console.log(`Seed user created successfully: ${createdIdentifier}`);
  } catch (error) {
    console.error("Seed users failed:", error.message);
    throw error;
  }
}

module.exports = seedUsers;
