import "server-only";

import { createSupabasePublicReadClient } from "@/lib/supabase/public-client";
import type { GalleryImage } from "@/types";

type SupabaseGalleryRow = {
  id: string;
  title: string;
  image_url: string;
  height: "short" | "medium" | "tall" | null;
  created_at: string | null;
};

function mapGalleryImage(row: SupabaseGalleryRow): GalleryImage {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    height: row.height || "medium",
    createdAt: row.created_at || undefined
  };
}

export async function getSupabaseGalleryImages() {
  const supabase = createSupabasePublicReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("gallery")
    .select("id, title, image_url, height, created_at")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase gallery read failed:", error.message);
    return [];
  }

  return ((data || []) as SupabaseGalleryRow[]).map(mapGalleryImage);
}
