"use server";

import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getAdminCategories,
  getAdminProducts,
  setPrimaryProductImage,
  updateProduct,
  type AdminProductInput
} from "@/lib/supabase/admin-products";
import { slugify } from "@/utils/format";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

function parseProductInput(formData: FormData): AdminProductInput {
  const packages = JSON.parse(String(formData.get("packages") || "[]")) as AdminProductInput["packages"];

  return {
    categoryId: String(formData.get("categoryId") || "") || null,
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    shortDescription: String(formData.get("shortDescription") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    basePrice: numberFromFormData(formData, "basePrice"),
    stockQuantity: numberFromFormData(formData, "stockQuantity"),
    featured: booleanFromFormData(formData, "featured"),
    published: booleanFromFormData(formData, "published"),
    isActive: booleanFromFormData(formData, "isActive"),
    sortOrder: numberFromFormData(formData, "sortOrder"),
    packages
  };
}

function validateProductInput(input: AdminProductInput, files: File[]) {
  if (input.name.length < 2) return "পণ্যের নাম লিখুন";
  if (!input.slug) return "slug লিখুন";
  if (input.shortDescription.length < 4) return "সংক্ষিপ্ত বিবরণ লিখুন";
  if (input.description.length < 8) return "বিস্তারিত বিবরণ লিখুন";
  if (input.basePrice < 0) return "base price সঠিক নয়";

  for (const item of input.packages) {
    if (!item.weight?.trim()) return "প্যাকেজের ওজন লিখুন";
    if (item.price < 0) return "প্যাকেজের দাম সঠিক নয়";
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) return "শুধু image file আপলোড করুন";
    if (file.size > MAX_IMAGE_BYTES) return "প্রতিটি ছবির সাইজ ৫MB এর কম হতে হবে";
  }

  return null;
}

export async function getAdminProductManagerData() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  return { products, categories };
}

export async function saveAdminProduct(_: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const productId = String(formData.get("productId") || "");
    const input = parseProductInput(formData);
    input.slug = slugify(input.slug || input.name);
    const files = filesFromFormData(formData);
    const validationError = validateProductInput(input, files);

    if (validationError) {
      return { ok: false, message: validationError };
    }

    if (productId) {
      await updateProduct(productId, input, files);
      return { ok: true, message: "পণ্য আপডেট হয়েছে" };
    }

    await createProduct(input, files);
    return { ok: true, message: "নতুন পণ্য যোগ হয়েছে" };
  } catch (error) {
    console.error("Supabase admin product save failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "পণ্য সংরক্ষণ করা যায়নি"
    };
  }
}

export async function deleteAdminProduct(productId: string): Promise<ActionResult> {
  try {
    await deleteProduct(productId);
    return { ok: true, message: "পণ্য inactive করা হয়েছে" };
  } catch (error) {
    console.error("Supabase admin product delete failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "পণ্য মুছে ফেলা যায়নি"
    };
  }
}

export async function deleteAdminProductImage(imageId: string): Promise<ActionResult> {
  try {
    await deleteProductImage(imageId);
    return { ok: true, message: "ছবি মুছে ফেলা হয়েছে" };
  } catch (error) {
    console.error("Supabase admin product image delete failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "ছবি মুছে ফেলা যায়নি"
    };
  }
}

export async function setPrimaryAdminProductImage(imageId: string, productId: string): Promise<ActionResult> {
  try {
    await setPrimaryProductImage(imageId, productId);
    return { ok: true, message: "Primary image আপডেট হয়েছে" };
  } catch (error) {
    console.error("Supabase admin product primary image update failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Primary image আপডেট করা যায়নি"
    };
  }
}
