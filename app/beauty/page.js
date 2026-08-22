import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import PaymentSettings from "@/models/PaymentSettings";
import StoreNav from "@/components/StoreNav";
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroBanner from "@/components/HeroBanner";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  await connectDB();
  const settings = await Settings.findOne({ store: "beauty" }).lean();
  const ogImage = settings?.heroImage;

  return {
    openGraph: ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : undefined,
  };
}

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

export default async function BeautyPage() {
  const { products, settings, whatsappNumber, contactPhone } = await getData();

  return (
    <>
      <StoreNav storeName="Eisha's Beauty" homeHref="/beauty" logo={settings?.logo} />

      <HeroBanner
        desktop={settings?.heroImage}
        mobile={settings?.heroImageMobile}
        gradientClassName="bg-gradient-to-t from-black/40 to-transparent"
      >
        <p className="font-body text-xs tracking-[0.16em] uppercase text-white/85 mb-2">
          Skincare &amp; Rituals
        </p>
        <h1 className="font-display font-[var(--heading-weight)] text-[clamp(1.6rem,4vw,2.3rem)] text-white leading-tight">
          Slow down. Take care of your skin.
        </h1>
      </HeroBanner>

      <FeaturedProducts products={products} storeHref="/beauty" />

      <div className="text-center pb-14 pt-2">
        <a
          href="/beauty/collection"
          className="inline-block px-8 py-3.5 border border-theme-accent text-theme-accent font-body text-sm uppercase tracking-wide hover:bg-theme-accent hover:text-theme-bg transition-colors"
        >
          Shop the full collection
        </a>
      </div>

      <Footer whatsappNumber={whatsappNumber} contactPhone={contactPhone} instagramUrl={settings?.instagramUrl} />
    </>
  );
}
