/**
 * File purpose: Processes procurement creation and procurement listing endpoints.
 */
const Inventory = require("../models/Inventory");
const Procurement = require("../models/Procurement");
const { normalizeName, throwIf, validatePhone } = require("../config/validators");

exports.createProcurement = async (req, res) => {
  // Creates a procurement record and increases matching inventory stock.
  const payload = req.body || {};
  const productName = normalizeName(payload.productName);
  const produceType = normalizeName(payload.produceType);
  const source = payload.source;
  const sourceName = normalizeName(payload.sourceName);
  const sourceContact = String(payload.sourceContact || "").trim();
  const branch = String(payload.branch || "").trim().toLowerCase();
  const tonnageKg = Number(payload.tonnageKg);
  const costUgx = Number(payload.costUgx);
  const sellingPricePerKgUgx = Number(payload.sellingPricePerKgUgx);
  const procuredAt = new Date(payload.procuredAt);

  // Enforce business rules before persisting.
  throwIf(!validatePhone(sourceContact), "Enter a valid Uganda phone number (07xxxxxxxx or +2567xxxxxxxx)");
  throwIf(Number.isNaN(procuredAt.getTime()), "Invalid procurement date and time");
  throwIf(source === "individual_dealer" && tonnageKg < 1000, "Dealer procurement must be at least 1000kg");

  const row = await Procurement.create({
    productName,
    produceType,
    source,
    sourceName,
    sourceContact,
    branch,
    tonnageKg,
    costUgx,
    sellingPricePerKgUgx,
    procuredAt,
    recordedBy: req.user.username,
  });

  await Inventory.findOneAndUpdate(
    { branch, productName, produceType },
    {
      $inc: { availableKg: tonnageKg },
      $set: {
        sellingPricePerKgUgx,
        updatedBy: req.user.username,
      },
    },
    // Upsert allows first-time stock rows to be created automatically per branch/product/type.
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({ message: "Procurement recorded", procurement: row });
};

exports.getProcurements = async (req, res) => {
  // Returns recent procurement rows scoped by role/branch permissions.
  // Agents are limited to their branch, manager/director can filter by query branch.
  const query = {};
  if (req.user.role === "agent") {
    query.branch = req.user.branch;
  }
  if (req.query.branch) {
    query.branch = String(req.query.branch).toLowerCase();
  }

  const rows = await Procurement.find(query).sort({ procuredAt: -1 }).limit(200).lean();
  res.json(rows);
};

