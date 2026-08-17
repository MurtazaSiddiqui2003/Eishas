import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import StoreNav from "@/components/StoreNav";
import FeaturedProducts from "@/components/FeaturedProducts";
import StoreCatalog from "@/components/StoreCatalog";
import HeroBanner from "@/components/HeroBanner";

export const dynamic = "force-dynamic";

async function getData() {
  await connectDB();
  const [products, settings] = await Promise.all([
    Product.find({ store: "jewelry" }).sort({ createdAt: -1 }).lean(),
    Settings.findOne({ store: "jewelry" }).lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)),
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
  };
}

const vitrineFrame = (
  <div
    className="absolute inset-3 pointer-events-none"
    style={{ border: "1px solid color-mix(in srgb, var(--gold) 35%, transparent)" }}
    aria-hidden="true"
  />
);

export default async function JewelryPage() {
  const { products, settings } = await getData();

  return (
    <>
      <StoreNav storeName="Eisha's Jewelry" homeHref="/jewelry" logo={settings?.logo} />

      <HeroBanner
        desktop={settings?.heroImage}
        mobile={settings?.heroImageMobile}
        gradientClassName="bg-gradient-to-t from-black/60 to-transparent"
        overlay={vitrineFrame}
      >
        <p className="font-body text-xs tracking-[0.22em] uppercase text-[var(--gold)] mb-2">
          The Vitrine
        </p>
        <h1 className="font-display font-[var(--heading-weight)] text-[clamp(1.8rem,4vw,2.6rem)] text-white">
          Earrings &middot; Sets &middot; Bangles
        </h1>
      </HeroBanner>

      <FeaturedProducts products={products} storeHref="/jewelry" />
      <StoreCatalog products={products} storeHref="/jewelry" />
    </>
  );
}
