import { NextResponse } from "next/server";
import Order from "@/models/Order";
import PaymentTransaction from "@/models/PaymentTransaction";
import { connectDB } from "@/lib/mongodb";
import { createJazzCashSecureHash, getJazzCashConfig } from "@/lib/jazzcash";

const SUCCESS_CODE = "000";

function getCallbackFields(request) {
  const fields = {};

  for (const [key, value] of request.entries()) {
    fields[key] = value;
  }

  return fields;
}

function buildRedirectUrl(request, orderNumber, token, result) {
  const url = new URL(
    "/order-confirmation/" + encodeURIComponent(orderNumber),
    request.url
  );
  url.searchParams.set("token", token);
  url.searchParams.set("payment", result);
  return url;
}

async function handleCallback(request) {
  await connectDB();

  const fields = getCallbackFields(await request.formData());
  const secureHash = String(fields.pp_SecureHash || "").trim();

  if (!secureHash) {
    return NextResponse.json(
      { error: "Missing JazzCash secure hash" },
      { status: 400 }
    );
  }

  const config = getJazzCashConfig();
  const hashFields = { ...fields };
  delete hashFields.pp_SecureHash;

  const expectedHash = createJazzCashSecureHash(
    hashFields,
    config.integritySalt
  );

  if (secureHash.toLowerCase() !== expectedHash.toLowerCase()) {
    return NextResponse.json(
      { error: "Invalid JazzCash secure hash" },
      { status: 400 }
    );
  }

  const transactionReference = String(fields.pp_TxnRefNo || "").trim();
  const responseCode = String(fields.pp_ResponseCode || "").trim();
  const merchantId = String(fields.pp_MerchantID || "").trim();
  const billReference = String(fields.pp_BillReference || "").trim();
  const retrievalReference = String(
    fields.pp_RetreivalReferenceNo || ""
  ).trim();

  if (!transactionReference) {
    return NextResponse.json(
      { error: "Missing JazzCash transaction reference" },
      { status: 400 }
    );
  }

  if (merchantId !== config.merchantId) {
    return NextResponse.json(
      { error: "JazzCash merchant mismatch" },
      { status: 400 }
    );
  }

  const transaction = await PaymentTransaction.findOne({
    provider: "jazzcash",
    transactionId: transactionReference,
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "JazzCash transaction not found" },
      { status: 404 }
    );
  }

  const order = await Order.findById(transaction.order).select(
    "+confirmationToken"
  );

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (billReference !== order.orderNumber) {
    return NextResponse.json(
      { error: "JazzCash order reference mismatch" },
      { status: 400 }
    );
  }

  if (responseCode === SUCCESS_CODE) {
    const returnedAmount = String(fields.pp_Amount || "").trim();
    const expectedAmount = String(Math.round(order.total * 100));

    if (
      returnedAmount !== expectedAmount ||
      String(fields.pp_TxnCurrency || "").trim() !== "PKR"
    ) {
      return NextResponse.json(
        { error: "JazzCash payment amount or currency mismatch" },
        { status: 400 }
      );
    }

    if (transaction.status !== "paid") {
      transaction.status = "paid";
      transaction.paidAt = transaction.paidAt || new Date();
      transaction.failureReason = undefined;
      await transaction.save();
    }

    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.paymentReference = retrievalReference || transactionReference;
      await order.save();
    }

    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        order.orderNumber,
        order.confirmationToken,
        "success"
      )
    );
  }

  const responseMessage = String(fields.pp_ResponseMessage || "").trim();

  if (transaction.status !== "paid") {
    transaction.status = "failed";
    transaction.failureReason =
      responseMessage ||
      `JazzCash response code ${responseCode || "unknown"}`;
    await transaction.save();

    order.paymentStatus = "failed";
    order.paymentReference = transactionReference;
    await order.save();
  }

  return NextResponse.redirect(
    buildRedirectUrl(
      request,
      order.orderNumber,
      order.confirmationToken,
      "failed"
    )
  );
}

export async function POST(request) {
  try {
    return await handleCallback(request);
  } catch (error) {
    console.error("JazzCash callback failed:", error);

    return NextResponse.json(
      { error: "Unable to process JazzCash callback" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "JazzCash callback must use POST" },
    { status: 405 }
  );
}
