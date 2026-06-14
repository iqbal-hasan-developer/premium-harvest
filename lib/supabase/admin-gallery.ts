import "server-only";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { SUPABASE_STORAGE_BUCKETS } from "@/lib/supabase/storage";
import type { GalleryImage } from "@/types";

export type AdminGalleryImage = GalleryImage & {
  description?: string | null;
  altText?: string | null;
  sortOrder: number;
  published: boolean;
  updatedAt?: string;
};

export type AdminGalleryInput = {
  title: string;
  description?: string;
  altText?: string;
  height: "short" | "medium" | "tall";
  sortOrder: number;
  published: boolean;
};

type SupabaseGalleryRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text: string | null;
  height: "short" | "medium" | "tall" | null;
  sort_order: number | null;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

function safeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function mapGalleryImage(row: SupabaseGalleryRow): AdminGalleryImage {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    altText: row.alt_text,
    height: row.height || "medium",
    sortOrder: row.sort_order ?? 0,
    published: Boolean(row.published),
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined
  };
}

function storagePathFromPublicUrl(imageUrl: string) {
  const marker = `/storage/v1/object/public/${SUPABASE_STORAGE_BUCKETS.gallery}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(imageUrl.slice(index + marker.length));
}

function revalidateGalleryPaths() {
  revalidatePath("/");
  revalidatePath("/gallery");
}

export async function getAdminGalleryImages() {
  await requireAdmin("/dashboard/gallery");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gallery")
    .select("id, title, description, image_url, alt_text, height, sort_order, published, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase admin gallery read failed:", error.message);
    return [];
  }

  return ((data || []) as SupabaseGalleryRow[]).map(mapGalleryImage);
}

export async function uploadGalleryImage(file: File, input: AdminGalleryInput, index = 0) {
  await requireAdmin("/dashboard/gallery");
  const supabase = createSupabaseAdminClient();
  const fileName = safeFileName(file.name) || "gallery-image.webp";
  const datePath = new Date().toISOString().slice(0, 10);
  const path = `gallery/${datePath}/${Date.now()}-${index}-${fileName}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKETS.gallery)
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from(SUPABASE_STORAGE_BUCKETS.gallery).getPublicUrl(path);
  const fallbackTitle = titleFromFileName(file.name) || "Gallery image";
  const title = input.title || fallbackTitle;
  const titleWithIndex = index > 0 && input.title ? `${title} ${index + 1}` : title;

  const { error: insertError } = await supabase.from("gallery").insert({
    title: titleWithIndex,
    description: input.description || null,
    image_url: publicUrlData.publicUrl,
    alt_text: input.altText || titleWithIndex,
    height: input.height,
    sort_order: input.sortOrder + index,
    published: input.published
  });

  if (insertError) {
    await supabase.storage.from(SUPABASE_STORAGE_BUCKETS.gallery).remove([path]);
    throw new Error(insertError.message);
  }

  revalidateGalleryPaths();
}

export async function deleteGalleryImage(imageId: string) {
  await requireAdmin("/dashboard/gallery");
  const supabase = createSupabaseAdminClient();
  const { data: image, error: imageError } = await supabase
    .from("gallery")
    .select("image_url")
    .eq("id", imageId)
    .maybeSingle();

  if (imageError) throw new Error(imageError.message);

  const { error } = await supabase.from("gallery").delete().eq("id", imageId);
  if (error) throw new Error(error.message);

  const storagePath = image?.image_url ? storagePathFromPublicUrl(image.image_url) : null;
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from(SUPABASE_STORAGE_BUCKETS.gallery).remove([storagePath]);
    if (storageError) console.warn("Supabase gallery storage cleanup failed:", storageError.message);
  }

  revalidateGalleryPaths();
}
