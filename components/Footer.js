// variant="store"  → sits inside a store's themed wrapper, picks up its
//                     colors/fonts automatically via the theme.* classes
// variant="shell"   → used on cart/checkout/order-confirmation, which use
//                     the neutral ivory shell instead of a store theme

export default function Footer({ variant = "store", whatsappNumber }) {
  const isStore = variant === "store";

  const wrapClass = isStore
    ? "bg-theme-bg text-theme-ink border-t border-[color-mix(in_srgb,var(--ink)_10%,transparent)]"
    : "bg-[var(--ivory)] text-[var(--ink)] border-t border-black/10";

  const headingClass = isStore
    ? "font-display text-sm mb-3"
    : "font-['Cormorant_Garamond'] text-base mb-3";

  const linkClass = isStore
    ? "block font-body text-sm opacity-70 hover:opacity-100 hover:text-theme-accent transition-colors mb-2"
    : "block font-['Inter'] text-sm opacity-70 hover:opacity-100 hover:text-[var(--gold-deep)] transition-colors mb-2";

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <footer className={`${wrapClass} px-8 py-12`}>
      <div className="max-w-[1400px] mx-auto flex flex-wrap gap-10 justify-between">
        <div className="max-w-[260px]">
          <a href="/" className={isStore ? "font-display text-lg" : "font-['Cormorant_Garamond'] text-lg"}>
            Eisha&rsquo;s
          </a>
          <p className={`${isStore ? "font-body" : "font-['Inter']"} text-xs opacity-60 mt-2 leading-relaxed`}>
            Apparel, Beauty, and Jewelry — three worlds, one house.
          </p>
        </div>

        <div>
          <p className={headingClass}>Shop</p>
          <a href="/apparel" className={linkClass}>Collection</a>
          <a href="/beauty" className={linkClass}>Beauty</a>
          <a href="/jewelry" className={linkClass}>Jewelry</a>
          <a href="/cart" className={linkClass}>Cart</a>
        </div>

        {whatsappLink && (
          <div>
            <p className={headingClass}>Contact</p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={linkClass}>
              WhatsApp
            </a>
          </div>
        )}
      </div>

      <p
        className={`${
          isStore ? "font-body" : "font-['Inter']"
        } text-center text-xs opacity-45 mt-10 pt-6 border-t ${
          isStore ? "border-[color-mix(in_srgb,var(--ink)_10%,transparent)]" : "border-black/10"
        }`}
      >
        &copy; {new Date().getFullYear()} Eisha&rsquo;s — made with love, for Eisha.
      </p>
    </footer>
  );
}
