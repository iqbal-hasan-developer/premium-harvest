import { createClient } from "@supabase/supabase-js";

export const SUPABASE_STORAGE_BUCKETS = {
  products: process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "products",
  gallery: process.env.NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET || "gallery",
  banners: process.env.NEXT_PUBLIC_SUPABASE_BANNERS_BUCKET || "banners"
} as const;

export type SupabaseStorageBucket =
  (typeof SUPABASE_STORAGE_BUCKETS)[keyof typeof SUPABASE_STORAGE_BUCKETS];

export const SUPABASE_STORAGE_PATHS = {
  productImage: (productId: string, fileName: string) => `products/${productId}/${fileName}`,
  galleryImage: (imageId: string, fileName: string) => `gallery/${imageId}/${fileName}`,
  bannerImage: (pageName: string, fileName: string) => `banners/${pageName}/${fileName}`
} as const;

function getPublicSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

function normalizeStoragePath(path: string) {
  return path.replace(/^\/+/, "");
}

export function getPublicStorageUrl(bucket: SupabaseStorageBucket, path: string) {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseEnv();
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data } = supabase.storage.from(bucket).getPublicUrl(normalizeStoragePath(path));

  return data.publicUrl;
}
