import mongoose from "mongoose";

const PaymentTransactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["easypaisa", "jazzcash", "sadapay", "bank_transfer"],
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
      maxlength: 200,
      index: true,
    },
    merchantReference: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "PKR",
      enum: ["PKR"],
    },
    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "cancelled", "refunded"],
      default: "created",
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 200,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

PaymentTransactionSchema.index({ provider: 1, transactionId: 1 }, { unique: true, sparse: true });

export default mongoose.models.PaymentTransaction ||
  mongoose.model("PaymentTransaction", PaymentTransactionSchema);
