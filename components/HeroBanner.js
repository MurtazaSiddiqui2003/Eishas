// A <picture> element (not next/image) is the right tool here — mobile
// and desktop are genuinely different crops of the same photo, not just
// different sizes of one crop, so the browser needs to choose between two
// distinct images rather than resize a single one.

export default function HeroBanner({ desktop, mobile, gradientClassName, overlay, children }) {
  return (
    <section className="relative h-[68vh] min-h-[420px] flex items-end bg-theme-bg overflow-hidden">
      {desktop && (
        <picture>
          {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
          <img
            src={desktop}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
      )}

      <div className={`absolute inset-0 ${gradientClassName || "bg-gradient-to-t from-black/55 to-transparent"}`} />

      {overlay}

      <div className="relative z-10 px-8 pb-8">{children}</div>
    </section>
  );
}
