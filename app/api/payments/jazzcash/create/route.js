import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import PaymentTransaction from "@/models/PaymentTransaction";
import {
  createJazzCashSecureHash,
  formatJazzCashAmount,
  getJazzCashConfig,
  getJazzCashDateTime,
  getJazzCashTransactionReference,
} from "@/lib/jazzcash";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const orderNumber = String(body?.orderNumber || "").trim();
    const confirmationToken = String(body?.confirmationToken || "").trim();

    if (!orderNumber || !confirmationToken) {
      return NextResponse.json(
        { error: "Order number and confirmation token are required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      orderNumber,
      confirmationToken,
    }).select("+confirmationToken");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "jazzcash") {
      return NextResponse.json(
        { error: "This order is not configured for JazzCash" },
        { status: 400 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This order has already been paid" },
        { status: 409 }
      );
    }

    const transaction = await PaymentTransaction.findOne({
      order: order._id,
      provider: "jazzcash",
    }).sort({ createdAt: -1 });

    if (!transaction) {
      return NextResponse.json(
        { error: "JazzCash payment transaction was not created" },
        { status: 409 }
      );
    }

    if (transaction.status === "paid") {
      return NextResponse.json(
        { error: "This payment has already been completed" },
        { status: 409 }
      );
    }

    const config = getJazzCashConfig();
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 60 * 1000);
    const transactionReference = getJazzCashTransactionReference(
      order.orderNumber
    );

    const fields = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: config.merchantId,
      pp_SubMerchantID: "",
      pp_Password: config.password,
      pp_BankID: "",
      pp_ProductID: "",
      pp_TxnRefNo: transactionReference,
      pp_Amount: formatJazzCashAmount(order.total),
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: getJazzCashDateTime(now),
      pp_BillReference: order.orderNumber,
      pp_Description: `Eisha's Collection order ${order.orderNumber}`,
      pp_TxnExpiryDateTime: getJazzCashDateTime(expiry),
      pp_ReturnURL: config.returnUrl,
      ppmpf_1: order.orderNumber,
      ppmpf_2: randomBytes(16).toString("hex"),
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
    };

    fields.pp_SecureHash = createJazzCashSecureHash(
      fields,
      config.integritySalt
    );

    transaction.transactionId = transactionReference;
    transaction.merchantReference = order.orderNumber;
    transaction.amount = order.total;
    transaction.status = "pending";
    transaction.idempotencyKey =
      transaction.idempotencyKey || randomBytes(32).toString("hex");
    await transaction.save();

    return NextResponse.json({
      paymentUrl: config.paymentUrl,
      fields,
    });
  } catch (error) {
    console.error("JazzCash payment creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create JazzCash payment" },
      { status: 500 }
    );
  }
}
