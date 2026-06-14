import "server-only";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { SUPABASE_STORAGE_BUCKETS } from "@/lib/supabase/storage";
import type { Product } from "@/types";
import { slugify } from "@/utils/format";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type AdminProductPackage = {
  id?: string;
  label?: string;
  weight: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  sortOrder: number;
  recommended: boolean;
  isActive: boolean;
};

export type AdminProductImage = {
  id: string;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;
};

export type AdminProduct = Product & {
  categoryId?: string | null;
  categoryName?: string | null;
  basePrice: number;
  stockQuantity: number;
  published: boolean;
  isActive: boolean;
  sortOrder: number;
  packageRecords: AdminProductPackage[];
  imageRecords: AdminProductImage[];
};

export type AdminProductInput = {
  categoryId?: string | null;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  stockQuantity: number;
  featured: boolean;
  published: boolean;
  isActive: boolean;
  sortOrder: number;
  packages: AdminProductPackage[];
};

type SupabaseProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  base_price: number | string | null;
  stock_quantity: number | null;
  featured: boolean | null;
  published: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  created_at: string | null;
  categories?: { name?: string | null; slug?: string | null } | null;
  product_packages?: SupabasePackageRow[] | null;
  product_images?: SupabaseImageRow[] | null;
};

type SupabasePackageRow = {
  id: string;
  label: string | null;
  weight: string | null;
  price: number | string | null;
  compare_at_price: number | string | null;
  stock_quantity: number | null;
  sort_order: number | null;
  recommended: boolean | null;
  is_active: boolean | null;
};

type SupabaseImageRow = {
  id: string;
  image_url: string | null;
  alt_text: string | null;
  sort_order: number | null;
  is_primary: boolean | null;
  is_active: boolean | null;
};

const ADMIN_PRODUCT_SELECT = `
  id,
  category_id,
  name,
  slug,
  short_description,
  description,
  base_price,
  stock_quantity,
  featured,
  published,
  is_active,
  sort_order,
  created_at,
  categories (
    name,
    slug
  ),
  product_packages (
    id,
    label,
    weight,
    price,
    compare_at_price,
    stock_quantity,
    sort_order,
    recommended,
    is_active
  ),
  product_images (
    id,
    image_url,
    alt_text,
    sort_order,
    is_primary,
    is_active
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

function safeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapProduct(row: SupabaseProductRow): AdminProduct {
  const packageRecords = (row.product_packages || [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item) => ({
      id: item.id,
      label: item.label || undefined,
      weight: item.weight || "",
      price: toNumber(item.price),
      compareAtPrice: item.compare_at_price == null ? undefined : toNumber(item.compare_at_price),
      stockQuantity: item.stock_quantity ?? 0,
      sortOrder: item.sort_order ?? 0,
      recommended: Boolean(item.recommended),
      isActive: item.is_active !== false
    }));
  const activePackages = packageRecords.filter((item) => item.isActive);
  const imageRecords = (row.product_images || [])
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((item) => ({
      id: item.id,
      imageUrl: item.image_url || "",
      altText: item.alt_text || undefined,
      sortOrder: item.sort_order ?? 0,
      isPrimary: Boolean(item.is_primary),
      isActive: item.is_active !== false
    }));
  const activeImages = imageRecords.filter((item) => item.isActive && item.imageUrl);
  const price = activePackages[0]?.price || toNumber(row.base_price);

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.categories?.name || null,
    name: row.name,
    slug: row.slug,
    price,
    basePrice: toNumber(row.base_price),
    stock: row.stock_quantity ?? undefined,
    stockQuantity: row.stock_quantity ?? 0,
    packages: activePackages.map((item) => ({
      weight: item.weight,
      price: item.price,
      recommended: item.recommended || undefined
    })),
    packageRecords,
    shortDescription: row.short_description || "",
    description: row.description || row.short_description || "",
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    isActive: row.is_active !== false,
    sortOrder: row.sort_order ?? 0,
    images: activeImages.map((item) => item.imageUrl),
    imageRecords,
    createdAt: row.created_at || undefined
  };
}

async function assertUniqueSlug(slug: string, productId?: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data && data.id !== productId) {
    throw new Error("এই slug আগে থেকেই ব্যবহার করা হয়েছে।");
  }
}

void assertUniqueSlug;

async function makeUniqueSlug(slug: string, productId?: string) {
  const supabase = createSupabaseAdminClient();
  const baseSlug = slugify(slug);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase.from("products").select("id").eq("slug", candidate).maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.id === productId) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function revalidateProductPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/shop/${slug}`);
}

export async function getAdminCategories() {
  await requireAdmin("/dashboard/products");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, is_active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase admin categories read failed:", error.message);
    return [];
  }

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    isActive: item.is_active !== false
  })) as AdminCategory[];
}

export async function getAdminProducts() {
  await requireAdmin("/dashboard/products");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase admin products read failed:", error.message);
    return [];
  }

  return ((data || []) as SupabaseProductRow[]).map(mapProduct);
}

export async function upsertProductPackages(productId: string, packages: AdminProductPackage[]) {
  const supabase = createSupabaseAdminClient();
  const { data: existingPackages, error: existingError } = await supabase
    .from("product_packages")
    .select("id")
    .eq("product_id", productId);

  if (existingError) throw new Error(existingError.message);

  const inputIds = new Set(packages.map((item) => item.id).filter(Boolean));
  const removedIds = (existingPackages || []).map((item) => item.id).filter((id) => !inputIds.has(id));

  if (removedIds.length) {
    const { error } = await supabase.from("product_packages").update({ is_active: false }).in("id", removedIds);
    if (error) throw new Error(error.message);
  }

  for (const [index, item] of packages.entries()) {
    const payload = {
      product_id: productId,
      label: item.label || null,
      weight: item.weight,
      price: item.price,
      compare_at_price: item.compareAtPrice ?? null,
      stock_quantity: item.stockQuantity ?? 0,
      sort_order: item.sortOrder ?? index,
      recommended: item.recommended,
      is_active: item.isActive
    };

    if (item.id) {
      const { error } = await supabase.from("product_packages").update(payload).eq("id", item.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("product_packages").insert(payload);
      if (error) throw new Error(error.message);
    }
  }
}

export async function uploadProductImage(file: File, productId: string, slug: string, sortOrder = 0) {
  const supabase = createSupabaseAdminClient();
  const fileName = safeFileName(file.name) || "product-image.webp";
  const path = `products/${slug}/${Date.now()}-${fileName}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKETS.products)
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from(SUPABASE_STORAGE_BUCKETS.products).getPublicUrl(path);
  const { data: existingPrimary } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .eq("is_active", true)
    .eq("is_primary", true)
    .limit(1);

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    image_url: publicUrlData.publicUrl,
    alt_text: fileName,
    sort_order: sortOrder,
    is_primary: !existingPrimary?.length,
    is_active: true
  });

  if (insertError) throw new Error(insertError.message);
}

export async function upsertProductImages(productId: string, files: File[], slug: string) {
  for (const [index, file] of files.entries()) {
    await uploadProductImage(file, productId, slug, index);
  }
}

export async function createProduct(input: AdminProductInput, files: File[] = []) {
  await requireAdmin("/dashboard/products");
  const slug = await makeUniqueSlug(input.slug || input.name);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      category_id: input.categoryId || null,
      name: input.name,
      slug,
      short_description: input.shortDescription,
      description: input.description,
      base_price: input.basePrice,
      stock_quantity: input.stockQuantity,
      featured: input.featured,
      published: input.published,
      is_active: input.isActive,
      sort_order: input.sortOrder
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await upsertProductPackages(data.id, input.packages);
  await upsertProductImages(data.id, files, slug);
  revalidateProductPaths(slug);

  return data.id as string;
}

export async function updateProduct(productId: string, input: AdminProductInput, files: File[] = []) {
  await requireAdmin("/dashboard/products");
  const supabase = createSupabaseAdminClient();
  const { data: existingProduct } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  const slug = await makeUniqueSlug(input.slug || input.name, productId);
  const { error } = await supabase
    .from("products")
    .update({
      category_id: input.categoryId || null,
      name: input.name,
      slug,
      short_description: input.shortDescription,
      description: input.description,
      base_price: input.basePrice,
      stock_quantity: input.stockQuantity,
      featured: input.featured,
      published: input.published,
      is_active: input.isActive,
      sort_order: input.sortOrder
    })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  await upsertProductPackages(productId, input.packages);
  await upsertProductImages(productId, files, slug);
  revalidateProductPaths(existingProduct?.slug);
  revalidateProductPaths(slug);
}

export async function deleteProduct(productId: string) {
  await requireAdmin("/dashboard/products");
  const supabase = createSupabaseAdminClient();
  const { data: product } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false, published: false })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  const { error: packagesError } = await supabase
    .from("product_packages")
    .update({ is_active: false })
    .eq("product_id", productId);

  if (packagesError) throw new Error(packagesError.message);

  const { error: imagesError } = await supabase
    .from("product_images")
    .update({ is_active: false, is_primary: false })
    .eq("product_id", productId);

  if (imagesError) throw new Error(imagesError.message);

  revalidateProductPaths(product?.slug);
}

function storagePathFromPublicUrl(imageUrl: string) {
  const marker = `/storage/v1/object/public/${SUPABASE_STORAGE_BUCKETS.products}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(imageUrl.slice(index + marker.length));
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin("/dashboard/products");
  const supabase = createSupabaseAdminClient();
  const { data: image, error: imageError } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", imageId)
    .maybeSingle();

  if (imageError) throw new Error(imageError.message);

  const { error } = await supabase.from("product_images").update({ is_active: false, is_primary: false }).eq("id", imageId);
  if (error) throw new Error(error.message);

  const storagePath = image?.image_url ? storagePathFromPublicUrl(image.image_url) : null;
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from(SUPABASE_STORAGE_BUCKETS.products).remove([storagePath]);
    if (storageError) console.warn("Supabase product image storage cleanup failed:", storageError.message);
  }

  revalidateProductPaths();
}

export async function setPrimaryProductImage(imageId: string, productId: string) {
  await requireAdmin("/dashboard/products");
  const supabase = createSupabaseAdminClient();
  const { error: resetError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  if (resetError) throw new Error(resetError.message);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true, is_active: true })
    .eq("id", imageId);

  if (error) throw new Error(error.message);
  revalidateProductPaths();
}
