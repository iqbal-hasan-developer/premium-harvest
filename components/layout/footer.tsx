import { Facebook, Globe2, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { siteConfig } from "@/lib/constants";

const socialItems = [
  { label: "Facebook", href: siteConfig.socialLinks.facebook, icon: Facebook },
  { label: "Instagram", href: siteConfig.socialLinks.instagram, icon: Instagram },
  { label: "YouTube", href: siteConfig.socialLinks.youtube, icon: Youtube }
];

export function Footer() {
  return (
    <footer className="mt-20 overflow-hidden border-t border-[#CFE3C7] bg-[#F7FBF7]">
      <div className="h-1 bg-gradient-to-r from-[#E8F5E9] via-[#F5B82E] to-[#2E7D32]" />

      <div className="container-page grid gap-8 py-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.45fr_.85fr_.85fr_1.25fr] lg:gap-10 lg:py-12">
        <div className="flex flex-col items-center sm:items-start">
          <Link href="/" aria-label="Premium Harvest home" className="inline-flex">
            <BrandLogo className="mx-auto sm:mx-0" />
          </Link>
          <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-neutral-600">
            বাগান থেকে সরাসরি প্রিমিয়াম আম, যত্নসহকারে প্যাকিং ও দ্রুত ডেলিভারি।
          </p>
          <Link
            href={siteConfig.url}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-[#CFE3C7] bg-white/80 px-4 py-2 text-sm font-bold text-[#1B5E20] shadow-sm transition hover:border-[#A9D39F] hover:bg-white"
          >
            <Globe2 className="size-4" />
            {siteConfig.websiteDisplay}
          </Link>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#1B5E20]">দ্রুত লিংক</h3>
          <div className="mt-4 grid gap-2.5 text-sm font-semibold">
            {siteConfig.navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-neutral-600 transition hover:text-[#2E7D32]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#1B5E20]">সোশ্যাল</h3>
          <div className="mt-4 flex justify-center gap-3 sm:justify-start">
            {socialItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="grid size-11 place-items-center rounded-full border border-[#CFE3C7] bg-white text-[#2E7D32] shadow-sm shadow-green-950/5 transition hover:-translate-y-0.5 hover:border-[#F5B82E] hover:bg-[#FFF8E1] hover:text-[#1B5E20]"
              >
                <item.icon className="size-4.5" />
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#1B5E20]">যোগাযোগ</h3>
          <div className="mx-auto mt-4 grid max-w-sm gap-3 text-sm font-semibold text-neutral-600 sm:mx-0">
            <a href={siteConfig.phoneHref} className="flex items-center justify-center gap-2.5 rounded-full bg-white/80 px-4 py-2.5 transition hover:text-[#2E7D32] sm:justify-start">
              <Phone className="size-4 shrink-0 text-[#2E7D32]" />
              <span>{siteConfig.phoneDisplay}</span>
            </a>
            <a href={`mailto:${siteConfig.email}`} className="flex min-w-0 items-center justify-center gap-2.5 rounded-full bg-white/80 px-4 py-2.5 transition hover:text-[#2E7D32] sm:justify-start">
              <Mail className="size-4 shrink-0 text-[#2E7D32]" />
              <span className="break-all">{siteConfig.email}</span>
            </a>
            <span className="flex items-center justify-center gap-2.5 rounded-full bg-white/80 px-4 py-2.5 sm:justify-start">
              <MapPin className="size-4 shrink-0 text-[#2E7D32]" />
              <span>{siteConfig.address}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-[#DDEEDD] px-4 pb-28 pt-5 text-center text-xs font-semibold text-neutral-500 lg:pb-5">
        © 2026 Premium Harvest Ltd. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
