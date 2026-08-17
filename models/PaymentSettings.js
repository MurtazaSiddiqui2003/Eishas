// A single document holding the payment info shown at checkout. Starts
// as manual bank/EasyPaisa transfer details — when a real payment
// gateway gets set up later, this is the natural place to add API keys
// and a `gatewayEnabled` flag, without touching the checkout flow itself.

import mongoose from "mongoose";

const PaymentSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    bankName: { type: String },
    accountTitle: { type: String },
    accountNumber: { type: String },
    iban: { type: String },
    easypaisaNumber: { type: String },
    easypaisaName: { type: String },
    whatsappNumber: { type: String }, // customers send payment proof here
    instructions: { type: String }, // free-text note shown at checkout
  },
  { timestamps: true }
);

export default mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);
