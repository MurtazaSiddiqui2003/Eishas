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
    Product.find({ store: "beauty" }).sort({ createdAt: -1 }).lean(),
    Settings.findOne({ store: "beauty" }).lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)),
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
  };
}

export default async function BeautyPage() {
  const { products, settings } = await getData();

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
      <StoreCatalog products={products} storeHref="/beauty" />
    </>
  );
}
