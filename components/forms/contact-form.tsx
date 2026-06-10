"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createContactMessage } from "@/actions/contacts";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState = { ok: false, message: "" };

export function ContactForm() {
  const [state, formAction] = useActionState(createContactMessage, initialState);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="rounded-3xl border border-[#CFE3C7] bg-white p-5 shadow-xl shadow-green-950/10 sm:p-7">
      <div className="mb-5 text-center lg:text-left">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D99600]">Premium Harvest</p>
        <h2 className="mt-2 text-2xl font-black text-[#17351a]">বার্তা পাঠান</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">আপনার তথ্য লিখে পাঠান, আমাদের টিম দ্রুত যোগাযোগ করবে।</p>
      </div>
      <div className="grid gap-4">
        <input
          name="name"
          required
          placeholder="আপনার নাম"
          className="min-h-12 rounded-2xl border border-[#CFE3C7] bg-[#FBFFF8] px-4 py-3 text-sm font-semibold text-[#17351a] outline-none transition placeholder:text-neutral-400 focus:border-[#2E7D32] focus:bg-white focus:ring-4 focus:ring-[#E8F5E9]"
        />
        <input
          name="phone"
          required
          placeholder="ফোন নম্বর"
          className="min-h-12 rounded-2xl border border-[#CFE3C7] bg-[#FBFFF8] px-4 py-3 text-sm font-semibold text-[#17351a] outline-none transition placeholder:text-neutral-400 focus:border-[#2E7D32] focus:bg-white focus:ring-4 focus:ring-[#E8F5E9]"
        />
        <input
          name="email"
          required
          type="email"
          placeholder="ইমেইল"
          className="min-h-12 rounded-2xl border border-[#CFE3C7] bg-[#FBFFF8] px-4 py-3 text-sm font-semibold text-[#17351a] outline-none transition placeholder:text-neutral-400 focus:border-[#2E7D32] focus:bg-white focus:ring-4 focus:ring-[#E8F5E9]"
        />
        <textarea
          name="message"
          required
          placeholder="আপনার বার্তা"
          rows={5}
          className="min-h-36 resize-none rounded-2xl border border-[#CFE3C7] bg-[#FBFFF8] px-4 py-3 text-sm font-semibold text-[#17351a] outline-none transition placeholder:text-neutral-400 focus:border-[#2E7D32] focus:bg-white focus:ring-4 focus:ring-[#E8F5E9]"
        />
        <SubmitButton>বার্তা পাঠান</SubmitButton>
      </div>
    </form>
  );
}
