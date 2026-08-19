// A single document holding payment + general contact info: shown at
// checkout (which methods a customer can pick) and on the confirmation
// and contact pages. When a real payment gateway gets set up later, this
// is the natural place to add API keys and a `gatewayEnabled` flag,
// without touching the checkout flow itself.

import mongoose from "mongoose";

const PaymentSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },

    // Bank transfer — treated as "configured" once bankName + accountNumber exist
    bankName: { type: String },
    accountTitle: { type: String },
    accountNumber: { type: String },
    iban: { type: String },

    // EasyPaisa — "configured" once easypaisaNumber exists
    easypaisaNumber: { type: String },
    easypaisaName: { type: String },

    // JazzCash — "configured" once jazzcashNumber exists
    jazzcashNumber: { type: String },
    jazzcashName: { type: String },

    // SadaPay — "configured" once sadapayNumber exists
    sadapayNumber: { type: String },
    sadapayName: { type: String },

    // Cash on Delivery — the only method that needs an explicit on/off,
    // since there's no account detail whose presence implies it's ready.
    codEnabled: { type: Boolean, default: true },

    whatsappNumber: { type: String }, // payment proof + general contact
    contactPhone: { type: String }, // shown as a plain phone/call link
    instructions: { type: String }, // free-text note shown at checkout
  },
  { timestamps: true }
);

export default mongoose.models.PaymentSettings ||
  mongoose.model("PaymentSettings", PaymentSettingsSchema);
