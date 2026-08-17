import Counter from "@/models/Counter";

// Produces ES-0001, ES-0002, etc. — used as the order number customers
// reference when they send payment proof, and printed on invoices.
export async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orderNumber" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  return `ES-${String(counter.seq).padStart(4, "0")}`;
}
