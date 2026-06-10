import { z } from "zod";

export const orderSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  selectedPackage: z.string().min(1, "প্যাকেজ নির্বাচন করুন"),
  packageWeight: z.string().min(1, "প্যাকেজ ওজন পাওয়া যায়নি"),
  packagePrice: z.coerce.number().int().min(1),
  customerName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে"),
  phone: z.string().min(8, "সঠিক ফোন নম্বর দিন"),
  address: z.string().min(8, "পূর্ণ ঠিকানা লিখুন"),
  quantity: z.coerce.number().int().min(1).max(50),
  deliveryCharge: z.coerce.number().int().min(0).default(0),
  totalPrice: z.coerce.number().int().min(1),
  note: z.string().max(300).optional()
});

export const cartOrderItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  image: z.string().optional(),
  selectedPackageWeight: z.string().min(1),
  selectedPackagePrice: z.coerce.number().int().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
  lineTotal: z.coerce.number().int().min(1)
});

export const cartOrderSchema = z.object({
  items: z.array(cartOrderItemSchema).min(1, "কার্ট খালি"),
  customerName: z.string().min(2, "আপনার নাম লিখুন"),
  phone: z.string().min(8, "সঠিক ফোন নম্বর দিন"),
  address: z.string().min(8, "সম্পূর্ণ ঠিকানা লিখুন"),
  paymentMethod: z.enum(["cod"]).default("cod"),
  subtotal: z.coerce.number().int().min(1),
  total: z.coerce.number().int().min(1),
  note: z.string().max(300).optional()
});

export const contactSchema = z.object({
  name: z.string().min(2, "নাম লিখুন"),
  phone: z.string().min(8, "সঠিক ফোন নম্বর দিন"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  message: z.string().min(10, "বার্তা একটু বিস্তারিত লিখুন")
});

export type OrderInput = z.infer<typeof orderSchema>;
export type CartOrderInput = z.infer<typeof cartOrderSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
