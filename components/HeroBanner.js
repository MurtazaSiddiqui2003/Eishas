// Desktop and mobile use genuinely different crops, so the browser
// chooses the appropriate source instead of forcing one image into both layouts.

export default function HeroBanner({ desktop, mobile, gradientClassName, overlay, children }) {
  return (
    <section className="relative h-[72vh] min-h-[500px] md:h-[70vh] md:min-h-[520px] flex items-end bg-theme-bg overflow-hidden">
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

      <div
        className={`absolute inset-0 ${gradientClassName || "bg-gradient-to-t from-black/55 to-transparent"}`}
      />

      {overlay}

      <div className="relative z-10 w-full px-6 pb-8 sm:px-8 sm:pb-10 md:px-12 md:pb-12">
        {children}
      </div>
    </section>
  );
}
