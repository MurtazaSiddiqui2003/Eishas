import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import PaymentSettings from "@/models/PaymentSettings";
import StoreNav from "@/components/StoreNav";
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroBanner from "@/components/HeroBanner";
import Footer from "@/components/Footer";

// Render fresh on every request instead of at build time — otherwise
// new products/images added in the admin panel wouldn't show up until
// the next deploy, and a build would fail if the DB were briefly unreachable.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  await connectDB();
  const settings = await Settings.findOne({ store: "apparel" }).lean();
  const ogImage = settings?.heroImage;

  return {
    openGraph: ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : undefined,
  };
}

async function getData() {
  await connectDB();
  const [products, settings, paymentSettings] = await Promise.all([
    Product.find({ store: "apparel" }).sort({ createdAt: -1 }).lean(),
    Settings.findOne({ store: "apparel" }).lean(),
    PaymentSettings.findOne({ key: "default" }).lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)),
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
    whatsappNumber: paymentSettings?.whatsappNumber,
    contactPhone: paymentSettings?.contactPhone,
  };
}

const border = (
  <div
    className="h-1.5 opacity-55"
    style={{
      background:
        "repeating-linear-gradient(45deg, var(--accent), var(--accent) 8px, var(--gold) 8px, var(--gold) 16px)",
    }}
    aria-hidden="true"
  />
);

export default async function ApparelPage() {
  const { products, settings, whatsappNumber, contactPhone } = await getData();

  return (
    <>
      <StoreNav storeName="Eisha's Collection" homeHref="/apparel" logo={settings?.logo} />
      {border}

      <HeroBanner
        desktop={settings?.heroImage}
        mobile={settings?.heroImageMobile}
        gradientClassName="bg-gradient-to-t from-black/55 to-transparent"
      >
        <p className="font-body text-xs tracking-[0.18em] uppercase text-white/85 mb-2">
          Eastern Wear
        </p>
        <h1 className="font-display font-medium text-[clamp(1.8rem,4vw,2.6rem)] text-white">
          Suits &middot; Sarees &middot; Lehngas
        </h1>
      </HeroBanner>

      <FeaturedProducts products={products} storeHref="/apparel" />

      <div className="text-center pb-14 pt-2">
        <a
          href="/apparel/collection"
          className="inline-block px-8 py-3.5 border border-theme-accent text-theme-accent font-body text-sm uppercase tracking-wide hover:bg-theme-accent hover:text-theme-bg transition-colors"
        >
          Shop the full collection
        </a>
      </div>

      {border}
      <Footer whatsappNumber={whatsappNumber} contactPhone={contactPhone} instagramUrl={settings?.instagramUrl} />
    </>
  );
}
