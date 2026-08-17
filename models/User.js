import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Only set for email/password signups. Google-login users won't have one.
    password: { type: String },
    image: { type: String },
    addresses: [
      {
        label: String, // "Home", "Work"
        line1: String,
        city: String,
        province: String,
        postalCode: String,
        country: String,
        phone: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
