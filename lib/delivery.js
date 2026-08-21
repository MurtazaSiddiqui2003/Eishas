// Single source of truth for delivery pricing, so the progress bar in the
// cart drawer, the checkout total, and the actual order total can never
// drift out of sync with each other.

export const FREE_DELIVERY_THRESHOLD = 5000;
export const DELIVERY_FEE = 300;

export function getDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}
