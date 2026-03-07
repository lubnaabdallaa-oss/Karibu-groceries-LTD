/**
 * File purpose: Main entry point for the KGL Backend API.
 * This file sets up Express, middleware, database connection, and API routes.
 */
const express = require("express");
const cors = require("cors");
const path = require("path");

// Load environment variables from kgl-backend/.env for secure configuration.
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDb = require("./src/config/db");
const { seedDefaultUsers } = require("./src/config/seedUsers");

// Import route handlers for different modules.
const authRoutes = require("./src/routes/auth");
const procurementRoutes = require("./src/routes/procurements");
const salesRoutes = require("./src/routes/sales");
const inventoryRoutes = require("./src/routes/inventory");
const reportRoutes = require("./src/routes/reports");

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for frontend interaction.
app.use(cors());

// Parse incoming JSON payloads.
app.use(express.json());

// Middleware to fix accidental double-prefix frontend URLs that might occur during navigation.
app.use((req, res, next) => {
  const duplicatedPrefix = "/kgl-frontend/public/kgl-frontend/public/";
  if (req.path.startsWith(duplicatedPrefix)) {
    const fixedPath = req.path.replace("/kgl-frontend/public", "");
    return res.redirect(302, fixedPath);
  }
  return next();
});

// Define API route endpoints.
app.use("/auth", authRoutes);
app.use("/procurements", procurementRoutes);
app.use("/sales", salesRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/reports", reportRoutes);

// Configure static file hosting for frontend assets (CSS, Images, and HTML).
const frontendRoot = path.join(__dirname, "..", "kgl-frontend");
app.use("/css", express.static(path.join(frontendRoot, "css")));
app.use("/images", express.static(path.join(frontendRoot, "images")));
app.use("/public", express.static(path.join(frontendRoot, "public")));
app.use(express.static(path.join(frontendRoot, "public")));

// Legacy URL compatibility redirects to ensure old bookmarks still work.
app.get("/sales.html", (req, res) => res.redirect(302, "/salesagent-dashboard.html"));
app.get("/procurement.html", (req, res) => res.redirect(302, "/manager-dashboard.html"));
app.get("/director-dashboard.html", (req, res) => res.redirect(302, "/director.html"));

// Serve the login page by default for the root URL.
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendRoot, "public", "login.html"));
});

// Centralized error handling middleware to provide consistent JSON error responses.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

/**
 * Bootstraps the application: connects to DB, seeds data, and starts the server.
 */
async function start() {
  // Establish connection to MongoDB.
  await connectDb();
  
  // Seed initial users for development and demonstration.
  await seedDefaultUsers();
  
  const basePort = Number(process.env.PORT || 5000);
  const maxAttempts = 10;

  /**
   * Attempts to listen on a port, increments if the port is already in use.
   */
  const listenOnAvailablePort = (port, attemptsLeft) => {
    const server = app.listen(port, () => {
      console.log(`KGL API running on port ${port}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
        console.warn(`Port ${port} is in use. Retrying on ${port + 1}...`);
        listenOnAvailablePort(port + 1, attemptsLeft - 1);
        return;
      }
      throw err;
    });
  };

  listenOnAvailablePort(basePort, maxAttempts);
}

// Execute the startup sequence.
start().catch((err) => {
  console.error("Startup failed:", err.message);
  process.exit(1);
});

