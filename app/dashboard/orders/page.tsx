import { OrdersManager } from "@/components/admin/orders-manager";

export default function DashboardOrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#17351a]">অর্ডার ব্যবস্থাপনা</h1>
      <p className="mt-2 text-sm text-neutral-600">কাস্টমার তথ্য দেখুন এবং অর্ডার স্ট্যাটাস পরিবর্তন করুন।</p>
      <div className="mt-6">
        <OrdersManager />
      </div>
    </div>
  );
}
