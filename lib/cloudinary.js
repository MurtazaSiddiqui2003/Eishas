// Central Cloudinary config. Import this anywhere you need to upload
// or delete images (admin panel, API routes) instead of configuring
// Cloudinary again in each file.

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
