/**
 * File purpose: Handles authentication logic, including login and JWT (JSON Web Token) generation.
 * This controller validates user credentials and issues a secure session token.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Escapes special characters in a string for use in a regular expression.
 * Used for case-insensitive username lookups.
 */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes user roles for consistency across the application.
 * Handles backward compatibility with legacy role names like "salesagent".
 */
function normalizeRole(role) {
  const raw = String(role || "").trim().toLowerCase();
  return raw === "salesagent" ? "agent" : raw;
}

/**
 * Handles the login request.
 * 1. Validates input.
 * 2. Finds user in the database (case-insensitive).
 * 3. Verifies the password using bcrypt.
 * 4. Generates a signed JWT for the session.
 */
exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  
  // Basic validation to ensure both fields are provided.
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Prepare username for case-insensitive search.
  const normalizedUsername = String(username).trim().toLowerCase();
  
  // Search for the user in the MongoDB collection.
  const user = await User.findOne({
    username: { $regex: `^${escapeRegex(normalizedUsername)}$`, $options: "i" },
  }).lean();
  
  // If user is not found, return an unauthorized error.
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Compare the provided password with the hashed password stored in the DB.
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  const normalizedRole = normalizeRole(user.role);

  /**
   * Create a JSON Web Token (JWT) to maintain the user's session.
   * The token includes the user's ID, role, and branch.
   */
  const token = jwt.sign(
    {
      id: String(user._id),
      username: user.username,
      role: normalizedRole,
      branch: user.branch,
      fullName: user.fullName,
    },
    // Use the secret key from environment variables or a fallback value.
    process.env.JWT_SECRET || "oogNGVc!3xy(KgcD",
    { expiresIn: "12h" } // Token expires after 12 hours.
  );

  // Return the token and user profile to the frontend.
  return res.json({
    token,
    user: {
      username: user.username,
      fullName: user.fullName,
      role: normalizedRole,
      branch: user.branch,
    },
  });
};

