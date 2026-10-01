import { createHmac } from "crypto";

const DEFAULT_PAYMENT_URL =
  "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

export function getJazzCashConfig() {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
  const returnUrl = process.env.JAZZCASH_RETURN_URL;
  const paymentUrl = process.env.JAZZCASH_PAYMENT_URL || DEFAULT_PAYMENT_URL;

  if (!merchantId || !password || !integritySalt || !returnUrl) {
    throw new Error("JazzCash payment configuration is incomplete");
  }

  return {
    merchantId,
    password,
    integritySalt,
    returnUrl,
    paymentUrl,
  };
}

export function formatJazzCashAmount(amount) {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid JazzCash payment amount");
  }

  return String(Math.round(amount * 100));
}

export function getJazzCashDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function getJazzCashTransactionReference(orderNumber) {
  const compactOrderNumber = String(orderNumber).replace(/[^A-Za-z0-9]/g, "");

  return `T${compactOrderNumber}${Date.now().toString().slice(-6)}`;
}

export function createJazzCashSecureHash(fields, integritySalt) {
  if (!integritySalt) {
    throw new Error("JazzCash integrity salt is required");
  }

  const payload = Object.entries(fields)
    .filter(
      ([key, value]) =>
        key.toLowerCase().startsWith("pp") &&
        value !== undefined &&
        value !== null &&
        value !== ""
    )
    .sort(([keyA], [keyB]) => {
      const comparison = Buffer.from(keyA, "ascii").compare(
        Buffer.from(keyB, "ascii")
      );

      return comparison;
    })
    .map(([, value]) => String(value))
    .join("&");

  const message = `${integritySalt}&${payload}`;
  const messageBytes = Buffer.from(message, "utf8").toString("latin1");

  return createHmac("sha256", Buffer.from(integritySalt, "utf8"))
    .update(Buffer.from(messageBytes, "latin1"))
    .digest("hex");
}
