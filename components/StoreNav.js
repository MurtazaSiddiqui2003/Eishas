"use client";

import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";

export default function StoreNav({ storeName, homeHref, logo }) {
  const { data: session } = useSession();
  const { count } = useCart();

  return (
    <nav className="flex items-center gap-5 px-8 py-5 border-b border-[color-mix(in_srgb,var(--ink)_12%,transparent)]">
      <a
        href="/"
        title="Back to Eisha's"
        className="w-8 h-8 rounded-full border border-theme-gold flex items-center justify-center font-display text-theme-accent shrink-0 overflow-hidden"
      >
        {logo ? (
          <img src={logo} alt="" className="w-full h-full object-cover" />
        ) : (
          "E"
        )}
      </a>

      <a href={homeHref} className="font-display font-[var(--heading-weight,500)] text-lg text-theme-ink flex-1">
        {storeName}
      </a>

      <div className="flex items-center gap-6 font-body text-sm">
        <a href={`${homeHref}/collection`} className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all">
          Shop
        </a>
        <a href="/cart" className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all">
          Cart{count > 0 ? ` (${count})` : ""}
        </a>
        {session ? (
          <button
            onClick={() => signOut()}
            className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all"
          >
            Sign out
          </button>
        ) : (
          <a href="/login" className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all">
            Sign in
          </a>
        )}
      </div>
    </nav>
  );
}
