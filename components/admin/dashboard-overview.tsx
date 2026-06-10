"use client";

import { ClipboardList, ImageIcon, Package, ShoppingBag } from "lucide-react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/firebase/client";
import type { ContactMessage, CustomerOrder, GalleryImage, Product } from "@/types";
import { formatBanglaNumber, formatCurrency } from "@/utils/format";

type DashboardSnapshot = {
  products: Product[];
  orders: CustomerOrder[];
  gallery: GalleryImage[];
  contacts: ContactMessage[];
};

const emptySnapshot: DashboardSnapshot = {
  products: [],
  orders: [],
  gallery: [],
  contacts: []
};

export function DashboardOverview() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [products, orders, gallery, contacts] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(8))),
          getDocs(collection(db, "gallery")),
          getDocs(query(collection(db, "contacts"), orderBy("createdAt", "desc"), limit(8)))
        ]);

        setSnapshot({
          products: products.docs.map((item) => ({ id: item.id, ...item.data() }) as Product),
          orders: orders.docs.map((item) => ({ id: item.id, ...item.data() }) as CustomerOrder),
          gallery: gallery.docs.map((item) => ({ id: item.id, ...item.data() }) as GalleryImage),
          contacts: contacts.docs.map((item) => ({ id: item.id, ...item.data() }) as ContactMessage)
        });
      } catch (error) {
        console.error("Failed to load dashboard overview", error);
        setError("ড্যাশবোর্ড ডেটা লোড করা যায়নি। Firebase rules deploy করা আছে কিনা যাচাই করুন।");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const stats = [
    { label: "মোট পণ্য", value: snapshot.products.length, icon: Package },
    { label: "মোট অর্ডার", value: snapshot.orders.length, icon: ShoppingBag },
    { label: "গ্যালারি ছবি", value: snapshot.gallery.length, icon: ImageIcon },
    { label: "কন্টাক্ট মেসেজ", value: snapshot.contacts.length, icon: ClipboardList }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#17351a]">ড্যাশবোর্ড ওভারভিউ</h1>
      <p className="mt-2 text-sm text-neutral-600">Premium Harvest-এর সাম্প্রতিক কার্যক্রম।</p>
      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-[#1B5E20]">{loading ? "..." : stat.value}</p>
              </div>
              <div className="grid size-12 place-items-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                <stat.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#17351a]">সাম্প্রতিক অর্ডার</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="py-3">কাস্টমার</th>
                <th>ফোন</th>
                <th>পণ্য</th>
                <th>প্যাকেজ</th>
                <th>মোট</th>
                <th>ঠিকানা</th>
                <th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">লোড হচ্ছে...</td>
                </tr>
              ) : null}
              {!loading && snapshot.orders.length ? (
                snapshot.orders.map((order) => (
                  <tr key={order.id} className="border-t border-[#E8F5E9] align-top">
                    <td className="py-3 font-semibold">{order.customerName}</td>
                    <td>{order.phone}</td>
                    <td>{order.productName}</td>
                    <td>
                      <div className="font-semibold text-[#17351a]">{order.packageWeight || order.selectedPackage || "-"}</div>
                      <div className="text-xs text-neutral-500">{formatBanglaNumber(order.quantity)} টি</div>
                    </td>
                    <td>{order.totalPrice ? formatCurrency(order.totalPrice) : "-"}</td>
                    <td className="max-w-xs">{order.address}</td>
                    <td className="capitalize">{order.status}</td>
                  </tr>
                ))
              ) : null}
              {!loading && !snapshot.orders.length ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    এখনও কোনো অর্ডার নেই।
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
