"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function StoreNav({ storeName, homeHref, logo }) {
  const { data: session } = useSession();
  const { count, toggleCart } = useCart();
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2.5 sm:gap-5 px-4 sm:px-8 py-4 sm:py-5 border-b border-[color-mix(in_srgb,var(--ink)_12%,transparent)]">
      <Link
        href="/"
        title="Back to Eisha's"
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-theme-gold flex items-center justify-center font-display text-theme-accent shrink-0 overflow-hidden"
      >
        {logo ? (
          <img src={logo} alt="" className="w-full h-full object-cover" />
        ) : (
          "E"
        )}
      </Link>

      <Link
        href={homeHref}
        className="font-display font-[var(--heading-weight,500)] text-sm sm:text-lg text-theme-ink flex-1 min-w-0 truncate"
      >
        {storeName}
      </Link>

      <div className="flex items-center gap-2.5 sm:gap-6 font-body text-xs sm:text-sm shrink-0">
        <Link
          href={`${homeHref}/collection`}
          className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all whitespace-nowrap"
        >
          Shop
        </Link>
        <button
          onClick={toggleCart}
          className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all whitespace-nowrap"
        >
          Cart{count > 0 ? ` (${count})` : ""}
        </button>
        {session ? (
          <>
            <Link
              href="/account"
              className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all whitespace-nowrap"
            >
              Orders
            </Link>
            <button
              onClick={() => signOut()}
              className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all whitespace-nowrap"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            className="text-theme-ink opacity-75 hover:opacity-100 hover:text-theme-accent transition-all whitespace-nowrap"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
