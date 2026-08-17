import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import StoreNav from "@/components/StoreNav";
import FeaturedProducts from "@/components/FeaturedProducts";
import StoreCatalog from "@/components/StoreCatalog";
import HeroBanner from "@/components/HeroBanner";

// Render fresh on every request instead of at build time — otherwise
// new products/images added in the admin panel wouldn't show up until
// the next deploy, and a build would fail if the DB were briefly unreachable.
export const dynamic = "force-dynamic";

async function getData() {
  await connectDB();
  const [products, settings] = await Promise.all([
    Product.find({ store: "apparel" }).sort({ createdAt: -1 }).lean(),
    Settings.findOne({ store: "apparel" }).lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)),
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
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
  const { products, settings } = await getData();

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
      <StoreCatalog products={products} storeHref="/apparel" />

      {border}
    </>
  );
}
