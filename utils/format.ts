import type { Product, ProductPackage } from "@/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatBanglaNumber(value: number) {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 0
  }).format(value);
}

export function getProductPackages(product: Product): ProductPackage[] {
  if (product.packages?.length) return product.packages;

  return [
    { weight: "৫ কেজি", price: product.price, recommended: true },
    { weight: "১০ কেজি", price: product.price * 2 },
    { weight: "২০ কেজি", price: product.price * 4 }
  ];
}

export function getStartingPrice(product: Product) {
  return getProductPackages(product).reduce((lowest, item) => Math.min(lowest, item.price), Number.POSITIVE_INFINITY);
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function whatsappLink(message: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801700000000";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
