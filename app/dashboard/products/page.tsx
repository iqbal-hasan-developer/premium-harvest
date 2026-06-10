import { ProductManager } from "@/components/admin/product-manager";

export default function DashboardProductsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#17351a]">পণ্য ব্যবস্থাপনা</h1>
      <p className="mt-2 text-sm text-neutral-600">পণ্য যোগ, এডিট, ডিলিট এবং ছবি আপলোড করুন।</p>
      <div className="mt-6">
        <ProductManager />
      </div>
    </div>
  );
}
