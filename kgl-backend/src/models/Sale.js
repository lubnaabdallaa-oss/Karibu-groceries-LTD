/**
 * File purpose: Cash sale schema for completed paid sales.
 */
const mongoose = require("mongoose");
const { BRANCHES, PRODUCTS } = require("../config/constants");

// Cash sales recorded at a branch and linked to the recorder role.
const saleSchema = new mongoose.Schema(
  {
    productName: { type: String, enum: PRODUCTS, required: true },
    produceType: { type: String, required: true, minlength: 2, match: /^[A-Za-z\s]+$/ },
    branch: { type: String, enum: BRANCHES, required: true },
    tonnageKg: { type: Number, required: true, min: 1 },
    amountPaidUgx: { type: Number, required: true, min: 10000 },
    buyerName: { type: String, required: true, minlength: 2 },
    salesAgentName: { type: String, required: true, minlength: 2 },
    soldAt: { type: Date, required: true },
    recordedByRole: { type: String, enum: ["manager", "agent"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);

