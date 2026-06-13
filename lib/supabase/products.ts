import "server-only";

import { createSupabasePublicReadClient } from "@/lib/supabase/public-client";
import type { Product, ProductPackage } from "@/types";

type SupabaseProductPackageRow = {
  weight: string | null;
  price: number | string | null;
  recommended: boolean | null;
  sort_order: number | null;
};

type SupabaseProductImageRow = {
  image_url: string | null;
  sort_order: number | null;
  is_primary: boolean | null;
};

type SupabaseCategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type SupabaseProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  base_price: number | string | null;
  stock_quantity: number | null;
  featured: boolean | null;
  created_at: string | null;
  product_packages?: SupabaseProductPackageRow[] | null;
  product_images?: SupabaseProductImageRow[] | null;
};

const PRODUCT_SELECT = `
  id,
  name,
  slug,
  short_description,
  description,
  base_price,
  stock_quantity,
  featured,
  created_at,
  product_packages (
    weight,
    price,
    recommended,
    sort_order
  ),
  product_images (
    image_url,
    sort_order,
    is_primary
  )
`;

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function mapPackages(packages: SupabaseProductPackageRow[] | null | undefined): ProductPackage[] {
  return (packages || [])
    .filter((item) => item.weight && toNumber(item.price) > 0)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item) => ({
      weight: item.weight || "",
      price: toNumber(item.price),
      recommended: item.recommended || undefined
    }));
}

function mapImages(images: SupabaseProductImageRow[] | null | undefined) {
  return (images || [])
    .filter((item) => Boolean(item.image_url))
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((item) => item.image_url || "");
}

function mapProduct(row: SupabaseProductRow): Product {
  const packages = mapPackages(row.product_packages);
  const price = packages[0]?.price || toNumber(row.base_price);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price,
    packages,
    shortDescription: row.short_description || "",
    description: row.description || row.short_description || "",
    featured: Boolean(row.featured),
    stock: row.stock_quantity ?? undefined,
    images: mapImages(row.product_images),
    createdAt: row.created_at || undefined
  };
}

export async function getSupabaseProducts() {
  const supabase = createSupabasePublicReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("published", true)
    .eq("is_active", true)
    .eq("product_packages.is_active", true)
    .eq("product_images.is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase products read failed:", error.message);
    return [];
  }

  return ((data || []) as SupabaseProductRow[]).map(mapProduct);
}

export async function getSupabaseFeaturedProducts() {
  const supabase = createSupabasePublicReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("published", true)
    .eq("is_active", true)
    .eq("featured", true)
    .eq("product_packages.is_active", true)
    .eq("product_images.is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.warn("Supabase featured products read failed:", error.message);
    return [];
  }

  return ((data || []) as SupabaseProductRow[]).map(mapProduct);
}

export async function getSupabaseProductBySlug(slug: string) {
  const supabase = createSupabasePublicReadClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .eq("is_active", true)
    .eq("product_packages.is_active", true)
    .eq("product_images.is_active", true)
    .maybeSingle();

  if (error) {
    console.warn(`Supabase product read failed for slug "${slug}":`, error.message);
    return null;
  }

  return data ? mapProduct(data as SupabaseProductRow) : null;
}

export async function getSupabaseCategories() {
  const supabase = createSupabasePublicReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("Supabase categories read failed:", error.message);
    return [];
  }

  return (data || []) as SupabaseCategoryRow[];
}
