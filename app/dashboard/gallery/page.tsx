import { GalleryManager } from "@/components/admin/gallery-manager";

export default function DashboardGalleryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#17351a]">গ্যালারি ব্যবস্থাপনা</h1>
      <p className="mt-2 text-sm text-neutral-600">Firebase Storage-এ ছবি আপলোড ও Firestore-এ গ্যালারি সংরক্ষণ করুন।</p>
      <div className="mt-6">
        <GalleryManager />
      </div>
    </div>
  );
}
