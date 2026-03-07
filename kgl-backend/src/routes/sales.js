/**
 * File purpose: Defines sales API routes, including legacy compatibility endpoints.
 */
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const {
  createCashSale,
  createCreditSale,
  getRecentSales,
  getRecentCreditSales,
} = require("../controllers/salesController");

const router = express.Router();

// Sales can be recorded by manager or branch agents.
router.post("/cash", requireAuth, requireRole(["manager", "agent"]), asyncHandler(createCashSale));
router.post("/credit", requireAuth, requireRole(["manager", "agent"]), asyncHandler(createCreditSale));
router.get("/cash", requireAuth, requireRole(["manager", "agent", "director"]), asyncHandler(getRecentSales));
router.get("/credit", requireAuth, requireRole(["manager", "agent", "director"]), asyncHandler(getRecentCreditSales));

// Legacy compatibility
router.post("/add", requireAuth, requireRole(["manager", "agent"]), asyncHandler(async (req, res) => {
  const body = req.body || {};
  req.body = {
    productName: body.productName || body.produceName,
    produceType: body.produceType || body.type || "General",
    branch: body.branch,
    tonnageKg: body.tonnageKg ?? body.tonnage,
    buyerName: body.buyerName,
    salesAgentName: body.salesAgentName || body.agentName,
    soldAt: body.soldAt || body.date,
  };
  return createCashSale(req, res);
}));

router.get("/all", requireAuth, requireRole(["manager", "agent", "director"]), asyncHandler(getRecentSales));

module.exports = router;

