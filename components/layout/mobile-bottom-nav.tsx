"use client";

import { GalleryHorizontal, Home, Phone, ShoppingBag, ShoppingCart, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { formatBanglaNumber } from "@/utils/format";

type MobileNavLinkItem = { label: string; href: string; icon: LucideIcon; type?: "link" };
type MobileNavCartItem = { label: string; href: string; icon: LucideIcon; type: "cart" };
type MobileNavItem = MobileNavLinkItem | MobileNavCartItem;

const mobileNavItems: MobileNavItem[] = [
  { label: "হোম", href: "/", icon: Home },
  { label: "শপ", href: "/shop", icon: ShoppingBag },
  { label: "কার্ট", href: "/cart", icon: ShoppingCart, type: "cart" },
  { label: "গ্যালারি", href: "/gallery", icon: GalleryHorizontal },
  { label: "যোগাযোগ", href: "/contact", icon: Phone }
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openCart, itemCount, isOpen } = useCart();

  return (
    <nav
      aria-label="মোবাইল নেভিগেশন"
      className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-[#CFE3C7] bg-white/95 px-2 py-2 shadow-2xl shadow-green-950/15 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-5 gap-1">
        {mobileNavItems.map((item) => {
          const active = item.type === "cart" ? isOpen : isActive(pathname, item.href);
          const className = `relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold transition ${
            active ? "bg-[#E8F5E9] text-[#1B5E20] shadow-sm" : "text-neutral-500 hover:bg-[#F7FBF7] hover:text-[#1B5E20]"
          }`;
          const content = (
            <>
              <span className="relative">
                <item.icon className={`size-5 ${active ? "stroke-[2.6]" : ""}`} />
                {item.type === "cart" && itemCount ? (
                  <span className="absolute -right-3 -top-2 grid min-w-5 place-items-center rounded-full bg-[#F5B82E] px-1 text-[10px] font-black text-[#17351a] ring-2 ring-white">
                    {formatBanglaNumber(itemCount)}
                  </span>
                ) : null}
              </span>
              <span className="leading-none">{item.label}</span>
            </>
          );

          if (item.type === "cart") {
            return (
              <button key={item.href} type="button" onClick={openCart} className={className} aria-label="কার্ট খুলুন">
                {content}
              </button>
            );
          }

          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
