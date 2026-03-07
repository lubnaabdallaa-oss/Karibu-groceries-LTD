/**
 * File purpose: Handles cash/credit sales workflows and stock deduction logic.
 */
const CreditSale = require("../models/CreditSale");
const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");
const { LOW_STOCK_THRESHOLD_KG } = require("../config/constants");
const { normalizeName, throwIf, validateNin, validatePhone } = require("../config/validators");

// Agents are restricted to their assigned branch; managers may provide branch in payload.
function resolveBranch(req, payloadBranch) {
  if (req.user.role === "agent") {
    return req.user.branch;
  }
  return String(payloadBranch || "").trim().toLowerCase();
}

// Atomic stock decrement to prevent overselling under concurrent requests.
async function reduceStockOrThrow(branch, productName, produceType, tonnageKg) {
  const updated = await Inventory.findOneAndUpdate(
    {
      branch,
      productName,
      produceType,
      availableKg: { $gte: tonnageKg },
    },
    {
      $inc: { availableKg: -tonnageKg },
      $set: { updatedBy: "sale" },
    },
    { new: true }
  );

  throwIf(!updated, `Insufficient stock for ${productName} (${produceType}) in ${branch}`, 409);
  return updated;
}

exports.createCashSale = async (req, res) => {
  // Creates a cash sale, decrements stock, and returns optional low-stock notice.
  const payload = req.body || {};
  const productName = normalizeName(payload.productName);
  const produceType = normalizeName(payload.produceType);
  const tonnageKg = Number(payload.tonnageKg);
  const buyerName = normalizeName(payload.buyerName);
  const salesAgentName = normalizeName(payload.salesAgentName || req.user.fullName || req.user.username);
  const soldAt = new Date(payload.soldAt);
  const branch = resolveBranch(req, payload.branch);

  throwIf(Number.isNaN(soldAt.getTime()), "Invalid sale date/time");
  throwIf(!branch, "Branch is required");

  // Use manager-defined selling price from inventory (not client-provided amounts).
  const inventory = await reduceStockOrThrow(branch, productName, produceType, tonnageKg);
  const amountPaidUgx = Math.round(tonnageKg * inventory.sellingPricePerKgUgx);

  const row = await Sale.create({
    productName,
    produceType,
    branch,
    tonnageKg,
    amountPaidUgx,
    buyerName,
    salesAgentName,
    soldAt,
    recordedByRole: req.user.role,
  });

  const lowStock = inventory.availableKg <= LOW_STOCK_THRESHOLD_KG;
  return res.status(201).json({
    message: "Sale recorded",
    sale: row,
    managerNotification: lowStock
      ? `Low stock alert for ${productName} (${produceType}) in ${branch}: ${inventory.availableKg}kg left`
      : null,
  });
};

exports.createCreditSale = async (req, res) => {
  // Creates a credit sale after validating buyer details and stock availability.
  const payload = req.body || {};
  const productName = normalizeName(payload.productName);
  const produceType = normalizeName(payload.produceType);
  const tonnageKg = Number(payload.tonnageKg);
  const buyerName = normalizeName(payload.buyerName);
  const nationalId = String(payload.nationalId || "").trim().toUpperCase();
  const location = normalizeName(payload.location);
  const contact = String(payload.contact || "").trim();
  const salesAgentName = normalizeName(payload.salesAgentName || req.user.fullName || req.user.username);
  const dueDate = new Date(payload.dueDate);
  const dispatchDate = new Date(payload.dispatchDate);
  const branch = resolveBranch(req, payload.branch);

  throwIf(!branch, "Branch is required");
  throwIf(!validateNin(nationalId), "Invalid NIN format");
  throwIf(!validatePhone(contact), "Enter a valid Uganda phone number");
  throwIf(Number.isNaN(dueDate.getTime()) || Number.isNaN(dispatchDate.getTime()), "Invalid due/dispatch date");
  throwIf(dueDate < dispatchDate, "Due date must be after dispatch date");

  // Credit amounts are also derived from inventory pricing.
  const inventory = await reduceStockOrThrow(branch, productName, produceType, tonnageKg);
  const amountDueUgx = Math.round(tonnageKg * inventory.sellingPricePerKgUgx);
  throwIf(amountDueUgx < 10000, "Amount due is too low. Increase tonnage or selling price.");

  const row = await CreditSale.create({
    buyerName,
    nationalId,
    location,
    contact,
    branch,
    amountDueUgx,
    salesAgentName,
    dueDate,
    productName,
    produceType,
    tonnageKg,
    dispatchDate,
  });

  const lowStock = inventory.availableKg <= LOW_STOCK_THRESHOLD_KG;
  return res.status(201).json({
    message: "Credit sale recorded",
    creditSale: row,
    managerNotification: lowStock
      ? `Low stock alert for ${productName} (${produceType}) in ${branch}: ${inventory.availableKg}kg left`
      : null,
  });
};

exports.getRecentSales = async (req, res) => {
  // Lists recent cash sales, restricted to agent branch where applicable.
  // Branch-level data isolation for agent accounts.
  const filter = {};
  if (req.user.role === "agent") {
    filter.branch = req.user.branch;
  }
  if (req.query.branch) {
    filter.branch = String(req.query.branch).toLowerCase();
  }

  const rows = await Sale.find(filter).sort({ soldAt: -1 }).limit(100).lean();
  res.json(rows);
};

exports.getRecentCreditSales = async (req, res) => {
  // Lists recent credit sales, restricted to agent branch where applicable.
  const filter = {};
  if (req.user.role === "agent") {
    filter.branch = req.user.branch;
  }
  if (req.query.branch) {
    filter.branch = String(req.query.branch).toLowerCase();
  }

  const rows = await CreditSale.find(filter).sort({ dispatchDate: -1 }).limit(100).lean();
  res.json(rows);
};

