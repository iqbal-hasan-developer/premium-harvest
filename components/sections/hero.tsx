"use client";

import { ArrowRight, Leaf, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

const heroBanner = "/hero-banner.webp";

const trustPills: { label: string; icon: LucideIcon }[] = [
  { label: "রাসায়নিকমুক্ত", icon: Leaf },
  { label: "নিরাপদ প্যাকেজিং", icon: ShieldCheck },
  { label: "দ্রুত ডেলিভারি", icon: Truck }
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 }
};

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F3F8F1]">
      <Image
        src={heroBanner}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[72%_center] md:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7FBF2]/86 via-[#F7FBF2]/58 to-[#F3F8F1]/20 md:bg-gradient-to-r md:from-[#F7FBF2]/20 md:via-[#F7FBF2]/14 md:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#F3F8F1]/5" />

      <div className="container-page relative z-10 flex min-h-[580px] items-center justify-center py-12 text-center sm:min-h-[620px] sm:py-14 lg:min-h-[660px] lg:justify-start lg:text-left">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.09 }}
          className="mx-auto w-full max-w-[620px] rounded-[1.75rem] bg-[#F7FBF2]/72 p-5 shadow-xl shadow-green-950/10 ring-1 ring-white/60 backdrop-blur-[1px] sm:bg-transparent sm:p-0 sm:shadow-none sm:ring-0 sm:backdrop-blur-none lg:mx-0 lg:ml-[4vw]"
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mx-auto inline-flex max-w-full items-center justify-center rounded-full border border-[#BFD8B8] bg-white/90 px-4 py-2 text-xs font-bold text-[#1B5E20] shadow-sm backdrop-blur sm:text-sm lg:mx-0"
          >
            রাসায়নিকমুক্ত • বাগান থেকে সরাসরি
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-6 text-balance text-4xl font-black leading-tight text-[#17351a] sm:text-5xl lg:text-6xl"
          >
            বাগান থেকে সরাসরি প্রিমিয়াম আম
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-3 text-xl font-black text-[#D99600] sm:text-2xl"
          >
            ঘরে বসেই অর্ডার করুন সহজে
          </motion.p>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#40543A] sm:text-lg lg:mx-0"
          >
            নিরাপদ, তাজা ও প্রাকৃতিকভাবে পাকা আম — দ্রুত ডেলিভারির সুবিধাসহ।
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <ButtonLink
              href="/shop"
              className="min-h-13 px-7 text-base font-black shadow-lg shadow-green-950/15 transition hover:-translate-y-0.5"
            >
              এখনই অর্ডার করুন
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/shop"
              variant="ghost"
              className="min-h-13 border border-[#BFD8B8] bg-white/95 px-7 text-base font-black text-[#1B5E20] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ECF6E9]"
            >
              আমের ধরন দেখুন
            </ButtonLink>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start"
          >
            {trustPills.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.45 + index * 0.07 }}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#CFE3C7] bg-white/88 px-3.5 py-2 text-xs font-bold text-[#17351a] shadow-sm backdrop-blur sm:text-sm"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                  <item.icon className="size-3.5" />
                </span>
                {item.label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
