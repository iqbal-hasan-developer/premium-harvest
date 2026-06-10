import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.banglaName} | প্রিমিয়াম অর্গানিক আম`,
    template: `%s | ${siteConfig.banglaName}`
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.banglaName} | প্রিমিয়াম অর্গানিক আম`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Premium Harvest organic mangoes"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.banglaName,
    description: siteConfig.description
  },
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    areaServed: "Bangladesh",
    sameAs: ["https://facebook.com", "https://instagram.com"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${siteConfig.whatsappNumber}`,
      contactType: "customer support"
    }
  };

  return (
    <html lang="bn">
      <body>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
        <Script
          id="store-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
