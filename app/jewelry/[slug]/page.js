import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import PaymentSettings from "@/models/PaymentSettings";
import StoreNav from "@/components/StoreNav";
import ProductDetail from "@/components/ProductDetail";
import Footer from "@/components/Footer";
import { getProductMetadata, getProductJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  await connectDB();
  const product = await Product.findOne({ store: "jewelry", slug: params.slug }).lean();
  if (!product) return {};
  return getProductMetadata(product, "/jewelry");
}

export default async function JewelryProductPage({ params }) {
  await connectDB();

  const [product, settings, paymentSettings] = await Promise.all([
    Product.findOne({ store: "jewelry", slug: params.slug }).lean(),
    Settings.findOne({ store: "jewelry" }).lean(),
    PaymentSettings.findOne({ key: "default" }).lean(),
  ]);

  if (!product) notFound();

  const plainProduct = JSON.parse(JSON.stringify(product));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProductJsonLd(plainProduct, "/jewelry")) }}
      />
      <StoreNav storeName="Eisha's Jewelry" homeHref="/jewelry" logo={settings?.logo} />
      <ProductDetail product={plainProduct} />
      <Footer
        whatsappNumber={paymentSettings?.whatsappNumber}
        contactPhone={paymentSettings?.contactPhone}
        instagramUrl={settings?.instagramUrl}
      />
    </>
  );
}
