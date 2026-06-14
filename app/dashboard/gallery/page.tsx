import { SupabaseGalleryManager } from "@/components/admin/supabase-gallery-manager";

export default function DashboardGalleryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#17351a]">গ্যালারি ব্যবস্থাপনা</h1>
      <p className="mt-2 text-sm text-neutral-600">Supabase Storage-এ ছবি আপলোড করে পাবলিক গ্যালারিতে প্রকাশ করুন।</p>
      <div className="mt-6">
        <SupabaseGalleryManager />
      </div>
    </div>
  );
}
