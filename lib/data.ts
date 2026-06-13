import type { DocumentData } from "firebase-admin/firestore";
import { getAdminDb, isDemoFallbackAllowed } from "@/firebase/admin";
import { demoGallery, demoProducts } from "@/lib/demo-data";
import { getSupabaseGalleryImages } from "@/lib/supabase/gallery";
import {
  getSupabaseFeaturedProducts,
  getSupabaseProductBySlug,
  getSupabaseProducts
} from "@/lib/supabase/products";
import type { ContactMessage, CustomerOrder, GalleryImage, Product } from "@/types";

function serialize<T extends { id: string }>(id: string, data: DocumentData): T {
  const createdAt = data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt ?? "";
  return { id, ...data, createdAt } as unknown as T;
}

async function getFirebaseProducts() {
  const db = getAdminDb();
  if (!db) return [];

  try {
    const snapshot = await db.collection("products").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => serialize<Product>(doc.id, doc.data()));
  } catch (error) {
    console.warn("Firebase products fallback read failed:", error);
    return [];
  }
}

async function getFirebaseGalleryImages() {
  const db = getAdminDb();
  if (!db) return [];

  try {
    const snapshot = await db.collection("gallery").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => serialize<GalleryImage>(doc.id, doc.data()));
  } catch (error) {
    console.warn("Firebase gallery fallback read failed:", error);
    return [];
  }
}

function finalProductFallback() {
  return demoProducts;
}

function finalGalleryFallback() {
  return demoGallery;
}

export async function getProducts() {
  const supabaseProducts = await getSupabaseProducts();
  if (supabaseProducts.length) return supabaseProducts;

  const firebaseProducts = await getFirebaseProducts();
  if (firebaseProducts.length) return firebaseProducts;

  if (!isDemoFallbackAllowed()) {
    console.warn("No Supabase or Firebase products found. Using demo product fallback during migration.");
  }

  return finalProductFallback();
}

export async function getFeaturedProducts() {
  const supabaseProducts = await getSupabaseFeaturedProducts();
  if (supabaseProducts.length) return supabaseProducts;

  const firebaseProducts = await getFirebaseProducts();
  const firebaseFeatured = firebaseProducts.filter((product) => product.featured).slice(0, 3);
  if (firebaseFeatured.length) return firebaseFeatured;

  if (!isDemoFallbackAllowed()) {
    console.warn("No Supabase or Firebase featured products found. Using demo featured fallback during migration.");
  }

  return demoProducts.filter((product) => product.featured).slice(0, 3);
}

export async function getProductBySlug(slug: string) {
  const supabaseProduct = await getSupabaseProductBySlug(slug);
  if (supabaseProduct) return supabaseProduct;

  const firebaseProducts = await getFirebaseProducts();
  const firebaseProduct = firebaseProducts.find((product) => product.slug === slug);
  if (firebaseProduct) return firebaseProduct;

  return finalProductFallback().find((product) => product.slug === slug) ?? null;
}

export async function getGalleryImages() {
  const supabaseGallery = await getSupabaseGalleryImages();
  if (supabaseGallery.length) return supabaseGallery;

  const firebaseGallery = await getFirebaseGalleryImages();
  if (firebaseGallery.length) return firebaseGallery;

  if (!isDemoFallbackAllowed()) {
    console.warn("No Supabase or Firebase gallery images found. Using demo gallery fallback during migration.");
  }

  return finalGalleryFallback();
}

export async function getDashboardSnapshot() {
  const db = getAdminDb();
  if (!db) {
    return {
      products: demoProducts,
      orders: [] as CustomerOrder[],
      gallery: demoGallery,
      contacts: [] as ContactMessage[]
    };
  }

  const [products, orders, gallery, contacts] = await Promise.all([
    db.collection("products").get(),
    db.collection("orders").orderBy("createdAt", "desc").limit(12).get(),
    db.collection("gallery").get(),
    db.collection("contacts").orderBy("createdAt", "desc").limit(12).get()
  ]);

  return {
    products: products.docs.map((doc) => serialize<Product>(doc.id, doc.data())),
    orders: orders.docs.map((doc) => serialize<CustomerOrder>(doc.id, doc.data())),
    gallery: gallery.docs.map((doc) => serialize<GalleryImage>(doc.id, doc.data())),
    contacts: contacts.docs.map((doc) => serialize<ContactMessage>(doc.id, doc.data()))
  };
}
