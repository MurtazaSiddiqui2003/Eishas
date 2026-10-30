import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  await connectDB();
  const beautySettings = await Settings.findOne({ store: "beauty" }).lean();
  const heroImage = beautySettings?.heroImage || beautySettings?.doorImage;

  return {
    title: "Eisha's Beauty — Beauty, Made Personal",
    description:
      "Discover Eisha's Beauty: skincare, makeup, and everyday beauty essentials from Eisha's Collection, based in Pakistan.",
    openGraph: heroImage
      ? {
          title: "Eisha's Beauty — Beauty, Made Personal",
          description:
            "Discover skincare, makeup, and everyday beauty essentials from Eisha's Collection.",
          images: [{ url: heroImage, width: 1200, height: 630 }],
        }
      : undefined,
  };
}

async function getBeautySettings() {
  await connectDB();
  const settings = await Settings.findOne({ store: "beauty" }).lean();
  return settings ? JSON.parse(JSON.stringify(settings)) : null;
}

export default async function HomePage() {
  const settings = await getBeautySettings();
  const desktopImage = settings?.heroImage || settings?.doorImage;
  const mobileImage =
    settings?.heroImageMobile || settings?.doorImageMobile || desktopImage;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Eisha's Collection",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    description:
      "Eisha's Collection is a Pakistani brand, with Eisha's Beauty as its featured beauty destination.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
    },
  };

  return (
    <main className="min-h-screen bg-[#fbf7f2] text-[#332e2b]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8 md:px-12">
        <Link
          href="/"
          aria-label="Eisha's Collection home"
          className="font-['Cormorant_Garamond'] text-xl sm:text-2xl tracking-wide text-white"
        >
          Eisha&rsquo;s Collection
        </Link>
        <Link
          href="/beauty/collection"
          className="border border-white/75 px-4 py-2 font-['Inter'] text-[10px] sm:text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-[#332e2b]"
        >
          Shop Beauty
        </Link>
      </header>

      <section className="relative flex min-h-[82svh] items-end overflow-hidden bg-[#b98a91] sm:min-h-[88svh]">
        {desktopImage ? (
          <picture>
            {mobileImage && (
              <source media="(max-width: 767px)" srcSet={mobileImage} />
            )}
            <img
              src={desktopImage}
              alt=""
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,#e8c9c9_0%,transparent_42%),linear-gradient(135deg,#b98a91_0%,#fbf7f2_100%)]"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
        <div className="relative z-10 w-full px-6 pb-14 pt-32 sm:px-10 sm:pb-20 md:px-16 lg:px-24">
          <p className="mb-4 font-['Inter'] text-[10px] uppercase tracking-[0.24em] text-white/85 sm:text-xs">
            A beauty destination by Eisha&rsquo;s Collection
          </p>
          <h1 className="max-w-2xl font-['Cormorant_Garamond'] text-5xl leading-[0.98] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Beauty, made personal.
          </h1>
          <p className="mt-5 max-w-md font-['Inter'] text-sm leading-7 text-white/85 sm:text-base">
            Thoughtful beauty essentials for the little rituals that make you feel like yourself.
          </p>
          <Link
            href="/beauty"
            className="mt-8 inline-flex items-center border border-white bg-white px-7 py-3.5 font-['Inter'] text-xs uppercase tracking-[0.16em] text-[#332e2b] transition-colors hover:bg-transparent hover:text-white"
          >
            Discover Eisha&rsquo;s Beauty
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
        <div className="max-w-xl">
          <p className="mb-3 font-['Inter'] text-[10px] uppercase tracking-[0.2em] text-[#a8757d]">
            More from Eisha&rsquo;s
          </p>
          <h2 className="font-['Cormorant_Garamond'] text-3xl leading-tight sm:text-4xl">
            One collection. More ways to express yourself.
          </h2>
          <p className="mt-3 font-['Inter'] text-sm leading-6 text-[#6f625e]">
            Explore the other worlds in the Eisha&rsquo;s Collection family.
          </p>
        </div>

        <div className="mt-8 grid gap-px border border-[#e8ddd7] bg-[#e8ddd7] sm:grid-cols-2">
          <Link
            href="/apparel"
            className="group flex min-h-32 items-center justify-between bg-[#fbf7f2] px-6 py-7 transition-colors hover:bg-white sm:px-8"
          >
            <span>
              <span className="block font-['Inter'] text-[10px] uppercase tracking-[0.18em] text-[#a8757d]">
                Explore
              </span>
              <span className="mt-1 block font-['Cormorant_Garamond'] text-2xl">
                Eisha&rsquo;s Fashion
              </span>
            </span>
            <span aria-hidden="true" className="font-['Inter'] text-xl transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>

          <Link
            href="/jewelry"
            className="group flex min-h-32 items-center justify-between bg-[#fbf7f2] px-6 py-7 transition-colors hover:bg-white sm:px-8"
          >
            <span>
              <span className="block font-['Inter'] text-[10px] uppercase tracking-[0.18em] text-[#a8757d]">
                Explore
              </span>
              <span className="mt-1 block font-['Cormorant_Garamond'] text-2xl">
                Eisha&rsquo;s Jewelry
              </span>
            </span>
            <span aria-hidden="true" className="font-['Inter'] text-xl transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e8ddd7] px-6 py-7 text-center">
        <p className="font-['Cormorant_Garamond'] text-lg">Eisha&rsquo;s Collection</p>
        <p className="mt-1 font-['Inter'] text-[10px] tracking-wide text-[#8b7d77]">
          Fashion, Beauty, and Jewelry — three worlds, one house.
        </p>
      </footer>
    </main>
  );
}
