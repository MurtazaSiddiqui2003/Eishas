import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import StoreNav from "@/components/StoreNav";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function BeautyProductPage({ params }) {
  await connectDB();

  const [product, settings] = await Promise.all([
    Product.findOne({ store: "beauty", slug: params.slug }).lean(),
    Settings.findOne({ store: "beauty" }).lean(),
  ]);

  if (!product) notFound();

  return (
    <>
      <StoreNav storeName="Eisha's Beauty" homeHref="/beauty" logo={settings?.logo} />
      <ProductDetail product={JSON.parse(JSON.stringify(product))} />
    </>
  );
}
