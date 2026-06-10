import { Leaf, PackageCheck, Truck, Waves } from "lucide-react";
import { FadeUp } from "@/components/motion-shell";
import { SectionHeading } from "@/components/ui/section-heading";

const items = [
  { title: "সতেজ আম", text: "অর্ডারের পরে বাছাই ও প্যাক করা হয়।", icon: Waves },
  { title: "ফার্ম থেকে সরাসরি", text: "মধ্যস্বত্বভোগী ছাড়া স্বচ্ছ উৎস।", icon: Leaf },
  { title: "রাসায়নিকমুক্ত", text: "নিরাপদ পরিচর্যা ও প্রাকৃতিক পরিপক্বতা।", icon: PackageCheck },
  { title: "দ্রুত ডেলিভারি", text: "ঢাকা ও সারাদেশে পরিকল্পিত শিপমেন্ট।", icon: Truck }
];

export function Specialty() {
  return (
    <section className="bg-[#F7FBF7] py-16">
      <div className="container-page">
        <SectionHeading
          eyebrow="আমাদের বিশেষত্ব"
          title="প্রতিটি ধাপে সতেজতা ও আস্থার যত্ন"
          description="বাগান নির্বাচন থেকে প্যাকেজিং পর্যন্ত আমরা গুণগত মানকে সবচেয়ে বেশি গুরুত্ব দিই।"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <FadeUp key={item.title} delay={index * 0.06}>
              <div className="h-full rounded-2xl border border-[#E8F5E9] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="grid size-12 place-items-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#17351a]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{item.text}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
