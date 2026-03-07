/**
 * File purpose: Defines inventory read routes for authorized users.
 */
const mongoose = require("mongoose");
const { BRANCHES, PRODUCTS } = require("../config/constants");

// Current stock snapshot per (branch + product + produce type).
const inventorySchema = new mongoose.Schema(
  {
    branch: { type: String, enum: BRANCHES, required: true },
    productName: { type: String, enum: PRODUCTS, required: true },
    produceType: { type: String, required: true, minlength: 2, match: /^[A-Za-z\s]+$/ },
    availableKg: { type: Number, required: true, min: 0, default: 0 },
    sellingPricePerKgUgx: { type: Number, required: true, min: 1000 },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate rows for the same stock identity.
inventorySchema.index({ branch: 1, productName: 1, produceType: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);

