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
  const product = await Product.findOne({ store: "beauty", slug: params.slug }).lean();
  if (!product) return {};
  return getProductMetadata(product, "/beauty");
}

export default async function BeautyProductPage({ params }) {
  await connectDB();

  const [product, settings, paymentSettings] = await Promise.all([
    Product.findOne({ store: "beauty", slug: params.slug }).lean(),
    Settings.findOne({ store: "beauty" }).lean(),
    PaymentSettings.findOne({ key: "default" }).lean(),
  ]);

  if (!product) notFound();

  const plainProduct = JSON.parse(JSON.stringify(product));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProductJsonLd(plainProduct, "/beauty")) }}
      />
      <StoreNav storeName="Eisha's Beauty" homeHref="/beauty" logo={settings?.logo} />
      <ProductDetail product={plainProduct} />
      <Footer
        whatsappNumber={paymentSettings?.whatsappNumber}
        contactPhone={paymentSettings?.contactPhone}
        instagramUrl={settings?.instagramUrl}
      />
    </>
  );
}
