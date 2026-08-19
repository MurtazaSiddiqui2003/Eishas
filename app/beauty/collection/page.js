import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import PaymentSettings from "@/models/PaymentSettings";
import StoreNav from "@/components/StoreNav";
import StoreCatalog from "@/components/StoreCatalog";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

async function getData() {
  await connectDB();
  const [products, settings, paymentSettings] = await Promise.all([
    Product.find({ store: "beauty" }).sort({ createdAt: -1 }).lean(),
    Settings.findOne({ store: "beauty" }).lean(),
    PaymentSettings.findOne({ key: "default" }).lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)),
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
    whatsappNumber: paymentSettings?.whatsappNumber,
    contactPhone: paymentSettings?.contactPhone,
  };
}

export default async function BeautyCollectionPage() {
  const { products, settings, whatsappNumber, contactPhone } = await getData();

  return (
    <>
      <StoreNav storeName="Eisha's Beauty" homeHref="/beauty" logo={settings?.logo} />

      <div className="text-center pt-12 pb-2">
        <p className="font-body text-xs tracking-[0.16em] uppercase text-theme-accent mb-2">
          The Full Collection
        </p>
        <h1 className="font-display font-[var(--heading-weight)] text-2xl text-theme-ink">
          Skincare &amp; Rituals
        </h1>
      </div>

      <StoreCatalog products={products} storeHref="/beauty" />

      <Footer whatsappNumber={whatsappNumber} contactPhone={contactPhone} instagramUrl={settings?.instagramUrl} />
    </>
  );
}
