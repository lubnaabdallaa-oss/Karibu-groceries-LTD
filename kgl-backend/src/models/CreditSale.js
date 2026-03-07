/**
 * File purpose: Credit sale schema for deferred payment transactions.
 */
const mongoose = require("mongoose");
const { BRANCHES, PRODUCTS } = require("../config/constants");

// Deferred-payment sales for trusted buyers.
const creditSaleSchema = new mongoose.Schema(
  {
    buyerName: { type: String, required: true, minlength: 2 },
    nationalId: { type: String, required: true },
    location: { type: String, required: true, minlength: 2 },
    contact: { type: String, required: true },
    branch: { type: String, enum: BRANCHES, required: true },
    amountDueUgx: { type: Number, required: true, min: 10000 },
    salesAgentName: { type: String, required: true, minlength: 2 },
    dueDate: { type: Date, required: true },
    productName: { type: String, enum: PRODUCTS, required: true },
    produceType: { type: String, required: true, minlength: 2, match: /^[A-Za-z\s]+$/ },
    tonnageKg: { type: Number, required: true, min: 1 },
    dispatchDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreditSale", creditSaleSchema);

