import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { siteConfig } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const routes = [
    "",
    "/shop",
    "/gallery",
    "/about",
    "/contact",
    "/delivery-policy",
    "/refund-policy",
    "/privacy-policy",
    "/terms",
    "/faq"
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : route === "/shop" ? 0.9 : 0.7
  }));

  return [
    ...routes,
    ...products.map((product) => ({
      url: `${siteConfig.url}/shop/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
