import type { DocumentData } from "firebase-admin/firestore";
import { getAdminDb, isDemoFallbackAllowed } from "@/firebase/admin";
import { demoGallery, demoProducts } from "@/lib/demo-data";
import type { ContactMessage, CustomerOrder, GalleryImage, Product } from "@/types";

function serialize<T extends { id: string }>(id: string, data: DocumentData): T {
  const createdAt = data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt ?? "";
  return { id, ...data, createdAt } as unknown as T;
}

export async function getProducts() {
  const db = getAdminDb();
  if (!db) return demoProducts;

  const snapshot = await db.collection("products").orderBy("createdAt", "desc").get();
  if (snapshot.empty) return isDemoFallbackAllowed() ? demoProducts : [];
  return snapshot.docs.map((doc) => serialize<Product>(doc.id, doc.data()));
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter((product) => product.featured).slice(0, 3);
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getGalleryImages() {
  const db = getAdminDb();
  if (!db) return demoGallery;

  const snapshot = await db.collection("gallery").orderBy("createdAt", "desc").get();
  if (snapshot.empty) return isDemoFallbackAllowed() ? demoGallery : [];
  return snapshot.docs.map((doc) => serialize<GalleryImage>(doc.id, doc.data()));
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
