import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. "ES-0001"

    // Optional — guest checkout is allowed, so an order isn't tied to a
    // registered account unless the person was signed in when they ordered.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    customerName: { type: String, required: true },
    customerEmail: { type: String },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        store: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String },
        image: { type: String },
      },
    ],

    shippingAddress: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "Pakistan" },
      phone: { type: String, required: true },
    },

    total: { type: Number, required: true },

    // Kept separate from fulfillment status below — a manual-transfer order
    // sits in "pending_verification" until you confirm the money came in.
    // A future real gateway would just set this via webhook instead.
    paymentMethod: {
      type: String,
      enum: ["manual_transfer"],
      default: "manual_transfer",
    },
    paymentStatus: {
      type: String,
      enum: ["pending_verification", "paid", "failed"],
      default: "pending_verification",
    },
    paymentReference: { type: String }, // customer-submitted transaction ID / note

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
