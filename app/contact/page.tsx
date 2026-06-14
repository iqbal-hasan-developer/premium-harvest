import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import { ContactForm } from "@/components/forms/contact-form";
import { siteConfig } from "@/lib/constants";
import { whatsappLink } from "@/utils/format";

export const metadata: Metadata = {
  title: "যোগাযোগ",
  description: "Premium Harvest অর্ডার, পাইকারি বা যেকোনো প্রশ্নের জন্য যোগাযোগ করুন।"
};

const contactItems = [
  { label: "Phone", value: siteConfig.phoneDisplay, href: siteConfig.phoneHref, icon: Phone },
  { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}`, icon: Mail },
  { label: "Location", value: siteConfig.address, icon: MapPin }
];

const supportCards = [
  {
    title: "অর্ডার সাপোর্ট",
    description: "ফোন বা WhatsApp-এ দ্রুত সহায়তা।",
    icon: ShoppingBag
  },
  {
    title: "ডেলিভারি তথ্য",
    description: "সময় ও চার্জ জানতে যোগাযোগ করুন।",
    icon: Truck
  },
  {
    title: "পণ্য জানতে",
    description: "আমের ধরন ও প্যাকেজ সম্পর্কে জানুন।",
    icon: MessageCircle
  }
];

export default function ContactPage() {
  const whatsappHref = whatsappLink("অর্ডার, ডেলিভারি বা পণ্যের তথ্য জানতে চাই।");

  return (
    <>
      <section className="relative isolate grid min-h-[240px] overflow-hidden bg-[#17351a] py-14 text-white sm:min-h-[320px] sm:py-20">
        <Image
          src="/contact-banner.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0F2F16]/72 via-[#1B5E20]/48 to-[#D99600]/16" />
        <div className="absolute inset-0 -z-10 bg-radial-[ellipse_at_center] from-[#17351a]/52 via-transparent to-transparent" />
        <div className="container-page m-auto max-w-4xl text-center">
          <h1 className="text-3xl font-black leading-tight text-white drop-shadow-md sm:text-5xl">
            যোগাযোগ করুন
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-white/90 drop-shadow-sm sm:text-lg sm:leading-8">
            অর্ডার, ডেলিভারি বা যেকোনো প্রশ্নের জন্য Premium Harvest Ltd টিমের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </section>
      {/* <PageHero
        title="আমাদের সঙ্গে যোগাযোগ করুন"
        description="অর্ডার, কর্পোরেট গিফটিং বা যেকোনো সহায়তার জন্য বার্তা পাঠান।"
        image={imageUrls.hero}
      /> */}
      <section className="bg-gradient-to-b from-white via-[#FBFFF8] to-[#F7FBF7] py-12 lg:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-[#CFE3C7] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#D99600] shadow-sm">
              Premium Harvest Ltd
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#17351a] sm:text-4xl">আমাদের সাথে কথা বলুন</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-neutral-600">
              অর্ডার, ডেলিভারি, পেমেন্ট বা পণ্যের যেকোনো তথ্যের জন্য Premium Harvest Ltd টিমের সাথে সরাসরি যোগাযোগ করুন।
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <div className="grid gap-5">
              <div className="rounded-3xl border border-[#CFE3C7] bg-white p-5 shadow-xl shadow-green-950/10 sm:p-6">
                <h3 className="text-center text-xl font-black text-[#17351a] sm:text-left">যোগাযোগের তথ্য</h3>
                <div className="mt-5 grid gap-3">
                  {contactItems.map((item) => {
                    const content = (
                      <>
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                          <item.icon className="size-5" />
                        </span>
                        <span className="min-w-0 break-words text-sm font-bold text-[#17351a]">{item.value}</span>
                      </>
                    );

                    const className =
                      "flex min-h-16 items-center justify-center gap-3 rounded-2xl border border-[#E8F5E9] bg-[#FBFFF8] px-4 py-3 text-center transition hover:border-[#CFE3C7] hover:bg-white sm:justify-start sm:text-left";

                    return item.href ? (
                      <a key={item.label} href={item.href} className={className}>
                        {content}
                      </a>
                    ) : (
                      <div key={item.label} className={className}>
                        {content}
                      </div>
                    );
                  })}
                </div>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-5 text-sm font-black text-white shadow-sm shadow-green-950/15 transition hover:-translate-y-0.5 hover:bg-[#1B5E20] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20"
                >
                  <MessageCircle className="size-5" />
                  WhatsApp-এ কথা বলুন
                </a>
              </div>

              <div className="grid gap-3 min-[390px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-2">
                {supportCards.map((item, index) => (
                  <article
                    key={item.title}
                    className={`flex items-start gap-3 rounded-2xl border border-[#E8F5E9] bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#CFE3C7] hover:shadow-md hover:shadow-green-950/10 ${
                      index === 2 ? "min-[390px]:col-span-2 sm:col-span-1 lg:col-span-2" : ""
                    }`}
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FFF8E1] text-[#8A5A00]">
                      <item.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black leading-5 text-[#17351a]">{item.title}</h3>
                      <p className="mt-1 text-[13px] font-medium leading-5 text-neutral-600">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
