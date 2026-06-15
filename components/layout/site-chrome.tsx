"use client";

import { usePathname } from "next/navigation";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Navbar } from "@/components/layout/navbar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adminArea = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (adminArea) {
    return <main>{children}</main>;
  }

  return (
    <CartProvider>
      <MetaPixel />
      <Navbar />
      <main className="pb-24 lg:pb-0">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <MobileBottomNav />
      <CartDrawer />
    </CartProvider>
  );
}
