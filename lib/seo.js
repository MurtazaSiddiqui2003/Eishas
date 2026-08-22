// Shared between all three stores' product pages so the social-preview
// (Open Graph) tags and the Google structured data stay consistent
// without tripling this logic three times.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function getProductMetadata(product, storeHref) {
  const description =
    product.description?.length > 155
      ? product.description.slice(0, 152) + "..."
      : product.description;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `${siteUrl}${storeHref}/${product.slug}`,
      type: "website",
      images: product.images?.[0]
        ? [{ url: product.images[0], width: 1200, height: 1200, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

// Schema.org Product structured data — this is what lets Google show
// price and stock availability directly in search results instead of
// just a plain blue link.
export function getProductJsonLd(product, storeHref) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product._id,
    category: product.categories?.join(", "),
    url: `${siteUrl}${storeHref}/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}${storeHref}/${product.slug}`,
    },
  };
}
