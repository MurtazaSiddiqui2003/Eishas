import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

export const dynamic = "force-dynamic";

const doors = [
  { href: "/apparel", key: "apparel", label: "Eisha's Collection" },
  { href: "/beauty", key: "beauty", label: "Eisha's Beauty" },
  { href: "/jewelry", key: "jewelry", label: "Eisha's Jewelry" },
];

async function getDoorImages() {
  await connectDB();
  const all = await Settings.find({}).lean();
  const map = {};
  for (const s of all) {
    map[s.store] = { desktop: s.doorImage, mobile: s.doorImageMobile };
  }
  return map;
}

export default async function HomePage() {
  const doorImages = await getDoorImages();

  return (
    <main className="h-screen flex flex-col md:flex-row bg-[var(--ivory)]">
      {doors.map((door, i) => {
        const images = doorImages[door.key] || {};

        return (
          <a
            key={door.href}
            href={door.href}
            className={`group relative flex-1 h-1/3 md:h-full overflow-hidden block ${
              i === 0 ? "" : "border-t md:border-t-0 md:border-l border-[color-mix(in_srgb,var(--gold)_45%,transparent)]"
            }`}
          >
            {images.desktop ? (
              // A <picture> element (not next/image) is the right tool here —
              // mobile and desktop are genuinely different crops of the photo,
              // not just different sizes of the same crop, so the browser needs
              // to pick between two distinct images rather than one resized one.
              <picture>
                {images.mobile && (
                  <source media="(max-width: 767px)" srcSet={images.mobile} />
                )}
                <img
                  src={images.desktop}
                  alt={door.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </picture>
            ) : (
              <div className="absolute inset-0 bg-[var(--ivory)] flex items-center justify-center">
                <span className="font-['Cormorant_Garamond'] text-[var(--ink)] opacity-30 text-sm">
                  Upload a door image in Admin
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

            <span className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 font-['Cormorant_Garamond'] font-medium text-2xl md:text-3xl text-white tracking-wide whitespace-nowrap">
              {door.label}
            </span>
          </a>
        );
      })}
    </main>
  );
}
