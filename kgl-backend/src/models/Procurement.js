/**
 * File purpose: Procurement schema for incoming stock records.
 */
const mongoose = require("mongoose");
const { BRANCHES, PRODUCTS } = require("../config/constants");

// Incoming stock entries from dealers, companies, or own farms.
const procurementSchema = new mongoose.Schema(
  {
    productName: { type: String, enum: PRODUCTS, required: true },
    produceType: { type: String, required: true, minlength: 2, match: /^[A-Za-z\s]+$/ },
    source: { type: String, enum: ["individual_dealer", "company", "farm_maganjo", "farm_matugga"], required: true },
    sourceName: { type: String, required: true, minlength: 2 },
    sourceContact: { type: String, required: true },
    branch: { type: String, enum: BRANCHES, required: true },
    tonnageKg: { type: Number, required: true, min: 100 },
    costUgx: { type: Number, required: true, min: 10000 },
    sellingPricePerKgUgx: { type: Number, required: true, min: 1000 },
    procuredAt: { type: Date, required: true },
    recordedBy: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Procurement", procurementSchema);

