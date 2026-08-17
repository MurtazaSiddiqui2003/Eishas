// One document per store, holding the images that are editable from the
// admin panel: the nav logo, the image used on the landing page's split
// screen, and the hero banner image at the top of the store itself.

import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    store: {
      type: String,
      enum: ["apparel", "beauty", "jewelry"],
      required: true,
      unique: true,
    },
    logo: { type: String }, // shown in the store nav bar
    doorImage: { type: String }, // shown on the landing page split screen (desktop)
    doorImageMobile: { type: String }, // optional — falls back to doorImage if empty
    heroImage: { type: String }, // shown as the store's own hero banner (desktop)
    heroImageMobile: { type: String }, // optional — falls back to heroImage if empty
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
