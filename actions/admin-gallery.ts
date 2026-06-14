"use server";

import {
  deleteGalleryImage,
  getAdminGalleryImages,
  uploadGalleryImage,
  type AdminGalleryInput
} from "@/lib/supabase/admin-gallery";

const MAX_GALLERY_IMAGE_BYTES = 5 * 1024 * 1024;

type ActionResult = {
  ok: boolean;
  message: string;
};

function numberFromFormData(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function booleanFromFormData(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function filesFromFormData(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function parseGalleryInput(formData: FormData): AdminGalleryInput {
  const height = String(formData.get("height") || "medium");

  return {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    altText: String(formData.get("altText") || "").trim(),
    height: height === "short" || height === "tall" ? height : "medium",
    sortOrder: numberFromFormData(formData, "sortOrder"),
    published: booleanFromFormData(formData, "published")
  };
}

function validateGalleryInput(input: AdminGalleryInput, files: File[]) {
  if (!files.length) return "Please select at least one image.";

  for (const file of files) {
    if (!file.type.startsWith("image/")) return "Only image files can be uploaded.";
    if (file.size > MAX_GALLERY_IMAGE_BYTES) return "Each image must be 5MB or smaller.";
  }

  if (input.title.length > 120) return "Title must be 120 characters or fewer.";
  if (input.altText && input.altText.length > 160) return "Alt text must be 160 characters or fewer.";

  return null;
}

export async function getAdminGalleryManagerData() {
  return getAdminGalleryImages();
}

export async function uploadAdminGalleryImages(_: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const input = parseGalleryInput(formData);
    const files = filesFromFormData(formData);
    const validationError = validateGalleryInput(input, files);

    if (validationError) {
      return { ok: false, message: validationError };
    }

    for (const [index, file] of files.entries()) {
      await uploadGalleryImage(file, input, index);
    }

    return { ok: true, message: "Gallery image uploaded successfully." };
  } catch (error) {
    console.error("Supabase admin gallery upload failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gallery image upload failed."
    };
  }
}

export async function deleteAdminGalleryImage(imageId: string): Promise<ActionResult> {
  try {
    await deleteGalleryImage(imageId);
    return { ok: true, message: "Gallery image deleted successfully." };
  } catch (error) {
    console.error("Supabase admin gallery delete failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gallery image could not be deleted."
    };
  }
}
