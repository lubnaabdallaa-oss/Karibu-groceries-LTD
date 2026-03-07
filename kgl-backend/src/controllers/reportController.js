/**
 * File purpose: Builds manager and director aggregate reporting responses.
 */
const CreditSale = require("../models/CreditSale");
const Procurement = require("../models/Procurement");
const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");

// Director-level totals across all branches and products.
exports.getDirectorSummary = async (req, res) => {
  // Aggregates global KPIs and grouped sales metrics for director dashboards.
  const [salesTotals, creditTotals, stockTotals, byBranchSales, byProductSales] = await Promise.all([
    Sale.aggregate([{ $group: { _id: null, totalRevenueUgx: { $sum: "$amountPaidUgx" }, totalSoldKg: { $sum: "$tonnageKg" }, saleCount: { $sum: 1 } } }]),
    CreditSale.aggregate([{ $group: { _id: null, totalCreditUgx: { $sum: "$amountDueUgx" }, creditKg: { $sum: "$tonnageKg" }, creditCount: { $sum: 1 } } }]),
    Inventory.aggregate([{ $group: { _id: null, totalInStockKg: { $sum: "$availableKg" } } }]),
    Sale.aggregate([{ $group: { _id: "$branch", revenueUgx: { $sum: "$amountPaidUgx" }, soldKg: { $sum: "$tonnageKg" } } }, { $sort: { _id: 1 } }]),
    Sale.aggregate([{ $group: { _id: "$productName", revenueUgx: { $sum: "$amountPaidUgx" }, soldKg: { $sum: "$tonnageKg" } } }, { $sort: { _id: 1 } }]),
  ]);

  res.json({
    totals: {
      revenueUgx: salesTotals[0]?.totalRevenueUgx || 0,
      soldKg: salesTotals[0]?.totalSoldKg || 0,
      saleCount: salesTotals[0]?.saleCount || 0,
      creditOutstandingUgx: creditTotals[0]?.totalCreditUgx || 0,
      creditKg: creditTotals[0]?.creditKg || 0,
      creditCount: creditTotals[0]?.creditCount || 0,
      inStockKg: stockTotals[0]?.totalInStockKg || 0,
    },
    salesByBranch: byBranchSales,
    salesByProduct: byProductSales,
  });
};

exports.getBranchSummary = async (req, res) => {
  // Aggregates branch KPIs for manager/agent dashboards.
  // Agents are forced to their own branch; managers can choose via query.
  const branch = req.user.role === "agent"
    ? req.user.branch
    : String(req.query.branch || "").toLowerCase();

  const saleFilter = branch ? { branch } : {};
  const [sales, credits, procurement, stock] = await Promise.all([
    Sale.aggregate([{ $match: saleFilter }, { $group: { _id: null, revenueUgx: { $sum: "$amountPaidUgx" }, soldKg: { $sum: "$tonnageKg" } } }]),
    CreditSale.aggregate([{ $match: saleFilter }, { $group: { _id: null, dueUgx: { $sum: "$amountDueUgx" }, creditKg: { $sum: "$tonnageKg" } } }]),
    Procurement.aggregate([{ $match: saleFilter }, { $group: { _id: null, procuredKg: { $sum: "$tonnageKg" }, procurementCostUgx: { $sum: "$costUgx" } } }]),
    Inventory.aggregate([{ $match: saleFilter }, { $group: { _id: null, availableKg: { $sum: "$availableKg" } } }]),
  ]);

  res.json({
    branch: branch || "all",
    revenueUgx: sales[0]?.revenueUgx || 0,
    soldKg: sales[0]?.soldKg || 0,
    creditDueUgx: credits[0]?.dueUgx || 0,
    creditKg: credits[0]?.creditKg || 0,
    procuredKg: procurement[0]?.procuredKg || 0,
    procurementCostUgx: procurement[0]?.procurementCostUgx || 0,
    availableKg: stock[0]?.availableKg || 0,
  });
};

