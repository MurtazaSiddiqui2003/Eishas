import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import StoreNav from "@/components/StoreNav";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function JewelryProductPage({ params }) {
  await connectDB();

  const [product, settings] = await Promise.all([
    Product.findOne({ store: "jewelry", slug: params.slug }).lean(),
    Settings.findOne({ store: "jewelry" }).lean(),
  ]);

  if (!product) notFound();

  return (
    <>
      <StoreNav storeName="Eisha's Jewelry" homeHref="/jewelry" logo={settings?.logo} />
      <ProductDetail product={JSON.parse(JSON.stringify(product))} />
    </>
  );
}
