import type { Metadata } from "next";
import { OrderTrackingForm } from "@/components/orders/order-tracking-form";

export const metadata: Metadata = {
  title: "অর্ডার ট্র্যাক করুন",
  description: "অর্ডার নম্বর ও ফোন নম্বর দিয়ে Premium Harvest অর্ডারের স্ট্যাটাস দেখুন।"
};

type TrackOrderPageProps = {
  searchParams: Promise<{ orderNumber?: string }>;
};

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const params = await searchParams;
  const defaultOrderNumber = typeof params.orderNumber === "string" ? params.orderNumber : "";

  return (
    <main className="bg-gradient-to-b from-white via-[#FBFFF8] to-[#F7FBF7] py-10 sm:py-14">
      <section className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#CFE3C7] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#D99600] shadow-sm">
            Premium Harvest
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight text-[#17351a] sm:text-5xl">
            অর্ডার ট্র্যাক করুন
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-neutral-600">
            আপনার অর্ডার নম্বর ও অর্ডারে দেওয়া ফোন নম্বর লিখে বর্তমান স্ট্যাটাস দেখুন।
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-5xl">
          <OrderTrackingForm defaultOrderNumber={defaultOrderNumber} />
        </div>
      </section>
    </main>
  );
}
