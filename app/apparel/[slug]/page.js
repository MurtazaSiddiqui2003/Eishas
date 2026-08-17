import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import StoreNav from "@/components/StoreNav";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ApparelProductPage({ params }) {
  await connectDB();

  const [product, settings] = await Promise.all([
    Product.findOne({ store: "apparel", slug: params.slug }).lean(),
    Settings.findOne({ store: "apparel" }).lean(),
  ]);

  if (!product) notFound();

  return (
    <>
      <StoreNav storeName="Eisha's Collection" homeHref="/apparel" logo={settings?.logo} />
      <ProductDetail product={JSON.parse(JSON.stringify(product))} />
    </>
  );
}
