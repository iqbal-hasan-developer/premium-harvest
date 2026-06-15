import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "প্রশ্নোত্তর",
  description: "Premium Harvest Ltd আম অর্ডার, ডেলিভারি, পেমেন্ট, প্যাকেজ, ট্র্যাকিং ও সাপোর্ট সম্পর্কিত সাধারণ প্রশ্নোত্তর।",
  path: "/faq"
});

const faqs = [
  {
    question: "কীভাবে অর্ডার করব?",
    answer:
      "শপ পেজ থেকে পছন্দের আম, প্যাকেজ সাইজ ও পরিমাণ নির্বাচন করে কার্টে যোগ করুন। এরপর নাম, ফোন নম্বর ও ঠিকানা দিয়ে অর্ডার সাবমিট করুন। চাইলে পণ্যের বিস্তারিত পেজ থেকেও সরাসরি অর্ডার করা যায়।"
  },
  {
    question: "ডেলিভারি কত দিনে হবে?",
    answer:
      "ঢাকার ভিতরে সাধারণত ১-৩ কর্মদিবস এবং ঢাকার বাইরে সাধারণত ২-৫ কর্মদিবস সময় লাগতে পারে। আবহাওয়া, কুরিয়ার চাপ বা মৌসুমি কারণে সময় কিছুটা পরিবর্তিত হতে পারে।"
  },
  {
    question: "পেমেন্ট কীভাবে করব?",
    answer:
      "বর্তমানে অর্ডারের সময় প্রদর্শিত পেমেন্ট পদ্ধতি অনুসরণ করতে হবে। ক্যাশ অন ডেলিভারি থাকলে পণ্য গ্রহণের সময় মূল্য পরিশোধ করা যাবে।"
  },
  {
    question: "আম কি রাসায়নিকমুক্ত?",
    answer:
      "আমরা নির্বাচিত বাগান থেকে নিরাপদ ও যত্নসহকারে উৎপাদিত আম সংগ্রহ করি এবং রাসায়নিকমুক্ত পরিচর্যার প্রতি গুরুত্ব দিই। ফলের মান, উৎস ও প্যাকেজিং যতটা সম্ভব স্বচ্ছ রাখার চেষ্টা করি।"
  },
  {
    question: "প্যাকেজ সাইজ কী কী?",
    answer:
      "প্রতিটি পণ্যের পেজে উপলব্ধ প্যাকেজ সাইজ ও মূল্য দেখা যাবে। মৌসুম ও স্টক অনুযায়ী প্যাকেজ সাইজ পরিবর্তিত হতে পারে।"
  },
  {
    question: "অর্ডার ট্র্যাক করব কীভাবে?",
    answer:
      "অর্ডার সাবমিট করার পর পাওয়া অর্ডার নম্বর এবং অর্ডারে দেওয়া ফোন নম্বর দিয়ে ট্র্যাক অর্ডার পেজে বর্তমান স্ট্যাটাস দেখা যাবে।"
  },
  {
    question: "আম নষ্ট হলে কী করব?",
    answer:
      "ডেলিভারির পর দ্রুত আমাদের জানান। পণ্য ও প্যাকেজিংয়ের ছবি/ভিডিও, অর্ডার নম্বর এবং সমস্যার বিবরণ পাঠালে আমরা রিপ্লেসমেন্ট বা সমাধানের সম্ভাবনা যাচাই করব।"
  },
  {
    question: "কোথায় যোগাযোগ করব?",
    answer: `অর্ডার বা সাপোর্টের জন্য ${siteConfig.phoneDisplay} নম্বরে কল করতে পারেন অথবা যোগাযোগ পেজ থেকে বার্তা পাঠাতে পারেন।`
  }
];

export default function FaqPage() {
  return (
    <main className="bg-gradient-to-b from-white via-[#FBFFF8] to-[#F7FBF7] py-10 sm:py-14">
      <section className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#CFE3C7] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#D99600] shadow-sm">
            FAQ
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight text-[#17351a] sm:text-5xl">প্রশ্নোত্তর</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-neutral-600">
            Premium Harvest Ltd থেকে আম অর্ডার, ডেলিভারি, পেমেন্ট ও সাপোর্ট সম্পর্কে সাধারণ প্রশ্নের উত্তর।
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-3xl border border-[#E8F5E9] bg-white p-5 shadow-sm shadow-green-950/5 sm:p-6">
              <h2 className="text-lg font-black leading-7 text-[#17351a]">{faq.question}</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-neutral-600">{faq.answer}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-[#CFE3C7] bg-[#E8F5E9] p-5 text-center shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-[#17351a]">আরও প্রশ্ন আছে?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-7 text-neutral-700">
            আমাদের সাপোর্ট টিম অর্ডার, ডেলিভারি ও পণ্য সম্পর্কে সাহায্য করতে প্রস্তুত।
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-[#2E7D32] px-6 text-sm font-black text-white transition hover:bg-[#1B5E20]"
          >
            যোগাযোগ করুন
          </Link>
        </div>
      </section>
    </main>
  );
}
