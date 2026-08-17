// A tiny counter collection, incremented atomically with $inc so two
// orders placed at the same moment can never get the same number —
// a plain "count existing orders + 1" approach has a race condition,
// this doesn't.

import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
