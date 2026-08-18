import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import PaymentSettings from "@/models/PaymentSettings";
import StoreNav from "@/components/StoreNav";
import ProductDetail from "@/components/ProductDetail";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function BeautyProductPage({ params }) {
  await connectDB();

  const [product, settings, paymentSettings] = await Promise.all([
    Product.findOne({ store: "beauty", slug: params.slug }).lean(),
    Settings.findOne({ store: "beauty" }).lean(),
    PaymentSettings.findOne({ key: "default" }).lean(),
  ]);

  if (!product) notFound();

  return (
    <>
      <StoreNav storeName="Eisha's Beauty" homeHref="/beauty" logo={settings?.logo} />
      <ProductDetail product={JSON.parse(JSON.stringify(product))} />
      <Footer whatsappNumber={paymentSettings?.whatsappNumber} />
    </>
  );
}
