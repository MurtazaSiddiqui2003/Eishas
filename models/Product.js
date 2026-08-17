// One shared Product collection for all three stores.
// The "store" field is what separates Apparel / Beauty / Jewelry —
// this keeps the cart, checkout, and admin panel logic unified instead
// of having to duplicate everything three times.

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    store: {
      type: String,
      enum: ["apparel", "beauty", "jewelry"],
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number }, // for showing a strikethrough "was" price
    images: [{ type: String, required: true }], // Cloudinary URLs
    category: { type: String, required: true }, // e.g. "Sarees", "Skincare", "Earrings"

    // Apparel-specific (ignored by other stores)
    sizes: [{ type: String }], // e.g. ["S", "M", "L", "XL"]
    color: { type: String }, // shared with jewelry below — same field, both stores use it
    fabric: { type: String }, // e.g. "Chiffon", "Silk", "Cotton"

    // Beauty-specific
    skinType: { type: String }, // e.g. "Oily", "Dry", "All"
    volume: { type: String }, // e.g. "50ml"

    // Jewelry-specific
    material: { type: String }, // e.g. "22k Gold Plated"
    // color (see above) is also used here — e.g. "Rose Gold", "Antique Silver"

    stock: { type: Number, required: true, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
