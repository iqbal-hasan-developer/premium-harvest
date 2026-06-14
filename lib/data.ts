import { demoGallery, demoProducts } from "@/lib/demo-data";
import { getSupabaseGalleryImages } from "@/lib/supabase/gallery";
import {
  getSupabaseFeaturedProducts,
  getSupabaseProductBySlug,
  getSupabaseProducts
} from "@/lib/supabase/products";

function isDemoDataEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === "true";
}

function demoProductsFallback() {
  return isDemoDataEnabled() ? demoProducts : [];
}

function demoGalleryFallback() {
  return isDemoDataEnabled() ? demoGallery : [];
}

export async function getProducts() {
  const supabaseProducts = await getSupabaseProducts();
  if (supabaseProducts.length) return supabaseProducts;

  return demoProductsFallback();
}

export async function getFeaturedProducts() {
  const supabaseProducts = await getSupabaseFeaturedProducts();
  if (supabaseProducts.length) return supabaseProducts;

  return demoProductsFallback().filter((product) => product.featured).slice(0, 3);
}

export async function getProductBySlug(slug: string) {
  const supabaseProduct = await getSupabaseProductBySlug(slug);
  if (supabaseProduct) return supabaseProduct;

  return demoProductsFallback().find((product) => product.slug === slug) ?? null;
}

export async function getGalleryImages() {
  const supabaseGallery = await getSupabaseGalleryImages();
  if (supabaseGallery.length) return supabaseGallery;

  return demoGalleryFallback();
}
