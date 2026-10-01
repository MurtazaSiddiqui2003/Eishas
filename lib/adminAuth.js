import crypto from "crypto";

const COOKIE_NAME = "eishas_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
  return secret;
}

function sign(timestamp) {
  return crypto.createHmac("sha256", getSecret()).update(timestamp).digest("hex");
}

export function createAdminToken() {
  const timestamp = String(Date.now());
  return timestamp + "." + sign(timestamp);
}

export function isValidAdminToken(token) {
  if (!token) return false;

  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) return false;

  const age = Date.now() - Number(timestamp);
  if (age < 0 || age > MAX_AGE_SECONDS * 1000) return false;

  const expected = sign(timestamp);
  const providedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export const adminCookie = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS,
};
