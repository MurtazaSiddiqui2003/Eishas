import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Generate on each request instead of at build time — otherwise a build
// fails if the DB is briefly unreachable, and new products wouldn't show
// up in the sitemap until the next deploy.
export const dynamic = "force-dynamic";

const storeHrefs = {
  apparel: "/apparel",
  beauty: "/beauty",
  jewelry: "/jewelry",
};

export default async function sitemap() {
  await connectDB();
  const products = await Product.find({}).select("store slug updatedAt").lean();

  const staticPages = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/apparel`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/apparel/collection`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/beauty`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/beauty/collection`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/jewelry`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/jewelry/collection`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/shipping-returns`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const productPages = products.map((p) => ({
    url: `${siteUrl}${storeHrefs[p.store]}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
