import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabasePublicReadClient } from "@/lib/supabase/public-client";
import type { Product, ProductPackage } from "@/types";

type SupabaseProductPackageRow = {
  product_id: string;
  weight: string | null;
  price: number | string | null;
  recommended: boolean | null;
  sort_order: number | null;
};

type SupabaseProductImageRow = {
  product_id: string;
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
  created_at
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

function mapProduct(
  row: SupabaseProductRow,
  packagesByProductId: Map<string, SupabaseProductPackageRow[]>,
  imagesByProductId: Map<string, SupabaseProductImageRow[]>
): Product {
  const packages = mapPackages(packagesByProductId.get(row.id));
  const images = mapImages(imagesByProductId.get(row.id));
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
    images: images.length ? images : ["/shop-banner.webp"],
    createdAt: row.created_at || undefined
  };
}

function groupByProductId<T extends { product_id: string }>(rows: T[]) {
  const grouped = new Map<string, T[]>();

  rows.forEach((row) => {
    grouped.set(row.product_id, [...(grouped.get(row.product_id) || []), row]);
  });

  return grouped;
}

async function getActiveProductRelations(supabase: SupabaseClient, productIds: string[]) {
  if (!productIds.length) {
    return {
      packagesByProductId: new Map<string, SupabaseProductPackageRow[]>(),
      imagesByProductId: new Map<string, SupabaseProductImageRow[]>()
    };
  }

  const [packagesResult, imagesResult] = await Promise.all([
    supabase
      .from("product_packages")
      .select("product_id, weight, price, recommended, sort_order")
      .in("product_id", productIds)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_images")
      .select("product_id, image_url, sort_order, is_primary")
      .in("product_id", productIds)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
  ]);

  if (packagesResult.error) {
    console.warn("Supabase product packages read failed:", packagesResult.error.message);
  }

  if (imagesResult.error) {
    console.warn("Supabase product images read failed:", imagesResult.error.message);
  }

  return {
    packagesByProductId: groupByProductId((packagesResult.data || []) as SupabaseProductPackageRow[]),
    imagesByProductId: groupByProductId((imagesResult.data || []) as SupabaseProductImageRow[])
  };
}

async function mapProductRows(supabase: SupabaseClient, rows: SupabaseProductRow[]) {
  const productIds = rows.map((row) => row.id);
  const { packagesByProductId, imagesByProductId } = await getActiveProductRelations(supabase, productIds);

  return rows.map((row) => mapProduct(row, packagesByProductId, imagesByProductId));
}

export async function getSupabaseProducts() {
  const supabase = createSupabasePublicReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("published", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase products read failed:", error.message);
    return [];
  }

  return mapProductRows(supabase, (data || []) as SupabaseProductRow[]);
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
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.warn("Supabase featured products read failed:", error.message);
    return [];
  }

  return mapProductRows(supabase, (data || []) as SupabaseProductRow[]);
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
    .maybeSingle();

  if (error) {
    console.warn(`Supabase product read failed for slug "${slug}":`, error.message);
    return null;
  }

  if (!data) return null;

  const products = await mapProductRows(supabase, [data as SupabaseProductRow]);
  return products[0] ?? null;
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
