// Pakistani retail convention: "Rs 1,200" — comma-grouped, no decimals
// (paisa is essentially never used in retail pricing). Centralized here
// so every price on the site formats the same way, and if this ever
// needs to change (different currency, decimals, etc.) it's one file.

export function formatPrice(amount) {
  const rounded = Math.round(Number(amount) || 0);
  return `Rs ${rounded.toLocaleString("en-PK")}`;
}
