import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import PaymentSettings from "@/models/PaymentSettings";
import StoreNav from "@/components/StoreNav";
import ProductDetail from "@/components/ProductDetail";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function JewelryProductPage({ params }) {
  await connectDB();

  const [product, settings, paymentSettings] = await Promise.all([
    Product.findOne({ store: "jewelry", slug: params.slug }).lean(),
    Settings.findOne({ store: "jewelry" }).lean(),
    PaymentSettings.findOne({ key: "default" }).lean(),
  ]);

  if (!product) notFound();

  return (
    <>
      <StoreNav storeName="Eisha's Jewelry" homeHref="/jewelry" logo={settings?.logo} />
      <ProductDetail product={JSON.parse(JSON.stringify(product))} />
      <Footer
        whatsappNumber={paymentSettings?.whatsappNumber}
        contactPhone={paymentSettings?.contactPhone}
        instagramUrl={settings?.instagramUrl}
      />
    </>
  );
}
