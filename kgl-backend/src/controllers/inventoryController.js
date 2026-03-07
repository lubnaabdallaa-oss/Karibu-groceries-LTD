/**
 * File purpose: Returns inventory data with low-stock indicators.
 */
const Inventory = require("../models/Inventory");
const { LOW_STOCK_THRESHOLD_KG } = require("../config/constants");

exports.getInventory = async (req, res) => {
  // Returns inventory rows with computed low-stock flags for UI badges.
  // Agents can only view stock for their own branch.
  const filter = {};
  if (req.user.role === "agent") {
    filter.branch = req.user.branch;
  }
  if (req.query.branch) {
    filter.branch = String(req.query.branch).toLowerCase();
  }

  const rows = await Inventory.find(filter).sort({ branch: 1, productName: 1 }).lean();
  // Add computed low-stock alert without mutating DB documents.
  const withAlerts = rows.map((row) => ({
    ...row,
    lowStock: row.availableKg <= LOW_STOCK_THRESHOLD_KG,
  }));

  res.json(withAlerts);
};

