"use client";

import { collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/firebase/client";
import type { CustomerOrder, OrderStatus } from "@/types";
import { formatBanglaNumber, formatCurrency } from "@/utils/format";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  cancelled: "Cancelled",
  delivered: "Delivered"
};

export function OrdersManager() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
      setOrders(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as CustomerOrder));
    } catch (error) {
      setOrders([]);
      setError("অর্ডার লোড করা যায়নি। Firebase rules-এ এই অ্যাডমিন ইউজারের read permission আছে কিনা দেখুন।");
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function changeStatus(order: CustomerOrder, status: OrderStatus) {
    try {
      await updateDoc(doc(db, "orders", order.id), { status });
      toast.success("অর্ডার স্ট্যাটাস আপডেট হয়েছে");
      await loadOrders();
    } catch {
      toast.error("স্ট্যাটাস আপডেট করা যায়নি");
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-neutral-500">
            <tr>
              <th className="py-3">কাস্টমার</th>
              <th>ফোন</th>
              <th>পণ্য</th>
              <th>প্যাকেজ</th>
              <th>মোট</th>
              <th>ঠিকানা</th>
              <th>নোট</th>
              <th>স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-8 text-center text-neutral-500">লোড হচ্ছে...</td></tr>
            ) : null}
            {!loading && !orders.length ? (
              <tr>
                <td colSpan={8} className={`py-8 text-center ${error ? "text-red-600" : "text-neutral-500"}`}>
                  {error || "কোনো অর্ডার নেই।"}
                </td>
              </tr>
            ) : null}
            {orders.map((order) => (
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
                <td className="max-w-xs">{order.note || "-"}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(event) => changeStatus(order, event.target.value as OrderStatus)}
                    className="rounded-full border border-[#E8F5E9] bg-[#F7FBF7] px-3 py-2 text-sm outline-none"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
