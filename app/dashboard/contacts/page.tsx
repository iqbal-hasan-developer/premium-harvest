import { ContactsManager } from "@/components/admin/contacts-manager";

export default function DashboardContactsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#17351a]">কন্টাক্ট মেসেজ</h1>
      <p className="mt-2 text-sm text-neutral-600">ওয়েবসাইট থেকে জমা দেওয়া বার্তাগুলো দেখুন।</p>
      <div className="mt-6">
        <ContactsManager />
      </div>
    </div>
  );
}
