"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/utils/format";

type FloatingWhatsAppProps = {
  message?: string;
  tooltip?: string;
};

export function FloatingWhatsApp({
  message = "আমি Premium Harvest থেকে অর্গানিক আম অর্ডার করতে চাই।",
  tooltip = "WhatsApp এ অর্ডার করুন"
}: FloatingWhatsAppProps) {
  return (
    <motion.a
      href={whatsappLink(message)}
      target="_blank"
      rel="noreferrer"
      aria-label={tooltip}
      data-tooltip={tooltip}
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
      className="whatsapp-floating-link fixed bottom-28 right-5 z-50 grid size-14 place-items-center rounded-full bg-[#2E7D32] text-white shadow-xl shadow-green-950/25 outline-none ring-1 ring-white/25 backdrop-blur-sm focus-visible:ring-4 focus-visible:ring-[#2E7D32]/25 sm:bottom-28 sm:right-6 lg:bottom-6"
    >
      <span className="whatsapp-floating-pulse" aria-hidden="true" />
      <MessageCircle className="size-6" />
    </motion.a>
  );
}
