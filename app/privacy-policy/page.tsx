import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/policy-page";
import { siteConfig } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "প্রাইভেসি পলিসি",
  description: "Premium Harvest Ltd কী তথ্য সংগ্রহ করে, কেন ব্যবহার করে এবং কীভাবে গ্রাহকের তথ্য নিরাপদ রাখে।",
  path: "/privacy-policy"
});

const sections = [
  {
    title: "আমরা কী তথ্য সংগ্রহ করি",
    items: [
      "অর্ডারের জন্য নাম, ফোন নম্বর, ডেলিভারি ঠিকানা ও অর্ডার বিস্তারিত।",
      "যোগাযোগ ফর্ম ব্যবহার করলে নাম, ফোন নম্বর, ইমেইল এবং বার্তা।",
      "অর্ডার ট্র্যাকিং ও সাপোর্টের জন্য অর্ডার নম্বর, পেমেন্ট ও ডেলিভারি স্ট্যাটাস।"
    ]
  },
  {
    title: "কেন তথ্য সংগ্রহ করা হয়",
    description:
      "অর্ডার প্রসেসিং, ডেলিভারি, গ্রাহক সহায়তা, অর্ডার ট্র্যাকিং এবং প্রয়োজনীয় যোগাযোগের জন্য এই তথ্য ব্যবহার করা হয়। ভুল বা অসম্পূর্ণ তথ্য থাকলে অর্ডার ডেলিভারি বিলম্বিত হতে পারে।"
  },
  {
    title: "তথ্য বিক্রি করা হয় না",
    description:
      `${siteConfig.name} গ্রাহকের ব্যক্তিগত তথ্য বিক্রি করে না। অর্ডার সম্পন্ন করা, ডেলিভারি দেওয়া বা সাপোর্ট দেওয়ার জন্য প্রয়োজনীয় সীমার মধ্যে তথ্য ব্যবহার করা হয়।`
  },
  {
    title: "তৃতীয় পক্ষের সেবা",
    description:
      "ওয়েবসাইট, ডাটাবেস, হোস্টিং ও ডেলিভারি ব্যবস্থাপনার জন্য Supabase, Vercel এবং প্রয়োজনীয় ডেলিভারি/কুরিয়ার পার্টনারের মতো সেবা ব্যবহার করা হতে পারে। এসব সেবা কেবল প্রয়োজনীয় কার্যক্রম সম্পন্ন করার জন্য ব্যবহৃত হয়।"
  },
  {
    title: "যোগাযোগ ফর্ম ও অর্ডার ডেটা",
    description:
      "যোগাযোগ ফর্মের বার্তা এবং অর্ডার সম্পর্কিত তথ্য আমাদের সাপোর্ট ও অপারেশন টিম অর্ডার/প্রশ্ন সমাধানের জন্য ব্যবহার করে। অপ্রয়োজনীয় মার্কেটিং বা অননুমোদিত শেয়ারিংয়ের জন্য এগুলো ব্যবহার করা হয় না।"
  },
  {
    title: "যোগাযোগ",
    description: `প্রাইভেসি সম্পর্কিত কোনো প্রশ্ন থাকলে আমাদের ইমেইল করুন: ${siteConfig.email}`
  },
  {
    title: "Analytics and advertising cookies",
    description:
      `${siteConfig.name} may use Meta Pixel and similar analytics cookies to understand website visits, product interest, cart activity, completed orders, and contact form leads. These tools help improve the website and measure Facebook/Instagram advertising.`
  }
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="প্রাইভেসি পলিসি"
      description="আপনার ব্যক্তিগত তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সংরক্ষণ করা হয়, তার স্বচ্ছ ব্যাখ্যা।"
      updatedAt="জুন ২০২৬"
      sections={sections}
    />
  );
}
