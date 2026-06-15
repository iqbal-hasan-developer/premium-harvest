export const siteConfig = {
  name: "Premium Harvest",
  banglaName: "প্রিমিয়াম হারভেস্ট",
  description:
    "বাংলাদেশের প্রিমিয়াম অর্গানিক আম সরাসরি বাগান থেকে আপনার ঘরে।",
  logo: "/Premium Harvest Gloing.png",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  websiteDisplay: "www.premiumharvestbd.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801700000000",
  phoneDisplay: "+880 1786333527",
  phoneHref: "tel:+8801786333527",
  email: "premiumharvestbd@gmail.com",
  address: "ঢাকা, বাংলাদেশ",
  navItems: [
    { label: "হোম", href: "/" },
    { label: "শপ", href: "/shop" },
    { label: "গ্যালারি", href: "/gallery" },
    { label: "আমাদের গল্প", href: "/about" },
    { label: "অর্ডার ট্র্যাক", href: "/track-order" },
    { label: "যোগাযোগ", href: "/contact" }
  ],
  policyLinks: [
    { label: "Delivery Policy", href: "/delivery-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "FAQ", href: "/faq" }
  ],
  socialLinks: {
    facebook: "#",
    instagram: "#",
    youtube: "#"
  }
};

export const analyticsConfig = {
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  currency: "BDT",
  enableAnalytics: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID)
};

export const imageUrls = {
  hero:
    "https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=1800&auto=format&fit=crop",
  farm:
    "https://images.unsplash.com/photo-1621293954908-907159247fc8?q=80&w=1400&auto=format&fit=crop",
  basket:
    "https://images.unsplash.com/photo-1621841957884-1210fe19d66e?q=80&w=1400&auto=format&fit=crop"
};
