import { SupabaseOrdersManager } from "@/components/admin/supabase-orders-manager";

export default function DashboardOrdersPage() {
  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-[#17351a]">অর্ডার ব্যবস্থাপনা</h1>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        কাস্টমার তথ্য দেখুন এবং অর্ডার স্ট্যাটাস পরিবর্তন করুন।
      </p>
      <div className="mt-6">
        <SupabaseOrdersManager />
      </div>
    </div>
  );
}
