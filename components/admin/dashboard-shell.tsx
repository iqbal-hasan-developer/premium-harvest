"use client";

import { Home, ImageIcon, LogOut, MessageSquare, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { label: "ওভারভিউ", href: "/dashboard", icon: Home },
  { label: "পণ্য", href: "/dashboard/products", icon: Package },
  { label: "গ্যালারি", href: "/dashboard/gallery", icon: ImageIcon },
  { label: "অর্ডার", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "মেসেজ", href: "/dashboard/contacts", icon: MessageSquare }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    toast.success("লগআউট সম্পন্ন হয়েছে");
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F7FBF7]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#E8F5E9] bg-white p-5 lg:block">
        <Link href="/" aria-label="হোমে যান">
          <BrandLogo />
        </Link>
        <nav className="mt-8 grid gap-2">
          {links.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  active ? "bg-[#E8F5E9] text-[#1B5E20]" : "text-neutral-600 hover:bg-[#F7FBF7]"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-full bg-[#1B5E20] px-4 py-3 text-sm font-semibold text-white"
        >
          <LogOut className="size-4" />
          লগআউট
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#E8F5E9] bg-white/90 p-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" aria-label="ড্যাশবোর্ডে যান">
              <BrandLogo size="sm" />
            </Link>
            <button type="button" onClick={handleLogout} className="rounded-full bg-[#E8F5E9] px-3 py-2 text-sm font-semibold text-[#1B5E20]">
              লগআউট
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-[#E8F5E9] px-3 py-2 text-xs font-semibold text-[#1B5E20]">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="container-page py-8">{children}</div>
      </div>
    </div>
  );
}
