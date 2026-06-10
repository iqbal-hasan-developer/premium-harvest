"use client";

import { Phone, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { BrandLogo } from "@/components/layout/brand-logo";
import { siteConfig } from "@/lib/constants";
import { formatBanglaNumber } from "@/utils/format";

export function Navbar() {
  const pathname = usePathname();
  const { openCart, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8F5E9] bg-white/90 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between gap-2 lg:gap-4">
        <Link href="/" aria-label="হোমে যান">
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-1 rounded-full bg-[#6bca2c]/60 p-1 lg:flex">
          {siteConfig.navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-white text-[#1B5E20] shadow-sm" : "text-neutral-700 hover:text-white/85"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E8F5E9] px-5 py-2.5 text-sm font-semibold text-[#1B5E20] transition duration-200 hover:bg-[#d6edd8] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 cursor-pointer"
            aria-label="কার্ট খুলুন"
          >
            <ShoppingCart className="size-4" />
            কার্ট
            {itemCount ? (
              <span className="absolute -right-2 -top-2 grid min-w-6 place-items-center rounded-full bg-[#F5B82E] px-1.5 py-0.5 text-xs font-black text-[#17351a] ring-2 ring-white">
                {formatBanglaNumber(itemCount)}
              </span>
            ) : null}
          </button>
        </div>

        <a
          href="tel:+8801786333527"
          aria-label="Call Premium Harvest at +880 1786333527"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#CFE3C7] bg-[#E8F5E9] px-3 py-2 text-xs font-extrabold leading-none text-[#1B5E20] shadow-sm shadow-green-950/5 transition hover:bg-[#d6edd8] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/25 lg:hidden min-[390px]:px-3.5 min-[390px]:text-sm"
        >
          <Phone className="size-3.5 shrink-0 min-[390px]:size-4" />
          <span>+880 1786333527</span>
        </a>
      </nav>
    </header>
  );
}
