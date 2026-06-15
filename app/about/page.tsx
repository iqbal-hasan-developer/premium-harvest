import type { Metadata } from "next";
import { CheckCircle2, Leaf, Target } from "lucide-react";
import Image from "next/image";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "আমাদের গল্প",
  description:
    "Premium Harvest Ltd-এর ব্র্যান্ড গল্প, নিরাপদ আম সংগ্রহ, বাগান থেকে ঘরে ডেলিভারি এবং প্রিমিয়াম কৃষিপণ্যের অঙ্গীকার।",
  path: "/about"
});

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate grid min-h-60 overflow-hidden bg-[#17351a] py-14 text-white sm:min-h-80 sm:py-20">
        <Image
          src="/about-banner.webp"
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
            আমাদের গল্প
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-white/90 drop-shadow-sm sm:text-lg sm:leading-8">
            বাগান থেকে ঘরে — নিরাপদ, তাজা ও প্রিমিয়াম আম পৌঁছে দেওয়ার অঙ্গীকার।
          </p>
        </div>
      </section>
      {/* <PageHero
        title="মাটির কাছাকাছি একটি প্রিমিয়াম ব্র্যান্ড"
        description="Premium Harvest তৈরি হয়েছে নিরাপদ, সতেজ ও সম্মানজনক কৃষিপণ্যের অভিজ্ঞতা দিতে।"
        image={imageUrls.farm}
      /> */}
      <section className="container-page grid gap-8 py-14 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E8F5E9]">
          <Image
            src="/about-poster.webp"
            alt="Premium mango basket"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2E7D32]">
            ব্র্যান্ড স্টোরি
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-[#17351a]">
            কৃষকের পরিশ্রমকে প্রিমিয়াম অভিজ্ঞতায় পৌঁছে দেওয়া
          </h2>
          <p className="mt-4 leading-8 text-neutral-600">
            আমরা বিশ্বাস করি, ভালো আম শুধু মিষ্টি হলেই যথেষ্ট নয়; একটি আমের
            প্রকৃত মান নির্ভর করে তার উৎস, বাগানের পরিচর্যা, প্রাকৃতিকভাবে
            পরিপক্ব হওয়ার সময়, সংগ্রহের পদ্ধতি, প্যাকেজিং এবং ক্রেতার হাতে
            পৌঁছানোর প্রতিটি ধাপের উপর। Premium Harvest Ltd এই প্রতিটি ধাপকে
            গুরুত্বের সঙ্গে বিবেচনা করে, যেন আপনার পরিবারের জন্য পৌঁছে দেওয়া
            প্রতিটি আম হয় নিরাপদ, তাজা এবং আস্থার যোগ্য। আমাদের যাত্রা শুরু হয়
            নির্বাচিত বাগান থেকে। মৌসুম অনুযায়ী সেরা মানের আম সংগ্রহ, যত্নশীল
            বাছাই, পরিষ্কার-পরিচ্ছন্ন প্যাকিং এবং দ্রুত ডেলিভারির মাধ্যমে আমরা
            চেষ্টা করি বাগানের সতেজতা সরাসরি আপনার ঘরে পৌঁছে দিতে। Premium
            Harvest-এর কাছে আম শুধু একটি ফল নয়; এটি কৃষকের পরিশ্রম, প্রকৃতির
            উপহার এবং পরিবারের আনন্দ ভাগ করে নেওয়ার একটি বিশ্বস্ত মাধ্যম।
          </p>
          <div className="mt-6 grid gap-3">
            {[
              "নির্বাচিত বাগান ও মৌসুমি সংগ্রহ",
              "রাসায়নিকমুক্ত পরিচর্যার প্রতি অঙ্গীকার",
              "নিরাপদ প্যাকেজিং ও দ্রুত ডেলিভারি",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-[#E8F5E9] p-3 text-sm font-semibold text-[#1B5E20]"
              >
                <CheckCircle2 className="size-5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#F7FBF7] py-14">
        <div className="container-page grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <Leaf className="size-8 text-[#2E7D32]" />
            <h3 className="mt-4 text-xl font-bold">আমাদের মিশন</h3>
            <p className="mt-3 leading-7 text-neutral-600">
              নিরাপদ ও উচ্চমানের দেশি আমকে শহুরে পরিবারের কাছে সহজ, স্বচ্ছ ও
              সুন্দরভাবে পৌঁছে দেওয়া।
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <Target className="size-8 text-[#2E7D32]" />
            <h3 className="mt-4 text-xl font-bold">আমাদের ভিশন</h3>
            <p className="mt-3 leading-7 text-neutral-600">
              বাংলাদেশের ফার্ম-ফ্রেশ ফলকে প্রিমিয়াম ব্র্যান্ড অভিজ্ঞতায় উন্নীত
              করা।
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
