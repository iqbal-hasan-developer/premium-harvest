"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { BrandLogo } from "@/components/layout/brand-logo";
import { auth } from "@/firebase/client";

const loginSchema = z.object({
  email: z.string().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর")
});

type LoginInput = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("স্বাগতম, অ্যাডমিন");
      router.replace(next);
    } catch {
      toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-18rem)] place-items-center bg-[#F7FBF7] px-4 py-12">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-green-900/10">
        <Link href="/" className="mx-auto mb-6 block w-fit" aria-label="হোমে যান">
          <BrandLogo size="lg" />
        </Link>
        <h1 className="text-center text-2xl font-bold text-[#17351a]">অ্যাডমিন লগইন</h1>
        <p className="mt-2 text-center text-sm text-neutral-600">পণ্য, অর্ডার ও গ্যালারি পরিচালনার জন্য লগইন করুন।</p>
        <div className="mt-6 grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-[#17351a]">
            ইমেইল
            <input {...register("email")} type="email" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
            {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
          </label>
          <label className="grid gap-1 text-sm font-semibold text-[#17351a]">
            পাসওয়ার্ড
            <input {...register("password")} type="password" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
            {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
          </label>
          <button disabled={isSubmitting} className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-5 font-semibold text-white transition hover:bg-[#1B5E20] disabled:opacity-70 cursor-pointer">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            লগইন করুন
          </button>
        </div>
      </form>
    </main>
  );
}
