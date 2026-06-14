"use client";

import { Archive, CheckCircle2, Clock3, Loader2, Mail, Phone, RotateCcw } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getAdminContactManagerData,
  updateAdminContactMessageStatus
} from "@/actions/admin-contacts";
import type { AdminContactMessage, ContactMessageStatus } from "@/lib/supabase/admin-contacts";

const statusLabels: Record<ContactMessageStatus, string> = {
  unread: "অপঠিত",
  read: "পঠিত",
  archived: "আর্কাইভড"
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function statusClass(status: ContactMessageStatus) {
  if (status === "unread") return "bg-[#FFF8E1] text-[#8A5A00]";
  if (status === "read") return "bg-[#E8F5E9] text-[#1B5E20]";
  return "bg-neutral-100 text-neutral-600";
}

export function ContactsManager() {
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function loadMessages() {
    setLoading(true);
    setError("");
    try {
      setMessages(await getAdminContactManagerData());
    } catch (error) {
      const message = error instanceof Error ? error.message : "মেসেজ লোড করা যায়নি।";
      setError(message);
      toast.error(message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  function changeStatus(message: AdminContactMessage, status: ContactMessageStatus) {
    startTransition(async () => {
      const result = await updateAdminContactMessageStatus(message.id, status);
      if (result.ok) {
        toast.success(result.message);
        await loadMessages();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="grid min-w-0 gap-4">
      {error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#E8F5E9] bg-white px-5 py-8 text-center text-neutral-500 shadow-sm">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            লোড হচ্ছে...
          </span>
        </div>
      ) : null}

      {!loading && !messages.length ? (
        <div className="rounded-2xl border border-[#E8F5E9] bg-white p-8 text-center shadow-sm">
          <p className="text-base font-black text-[#17351a]">এখনও কোনো মেসেজ নেই।</p>
          <p className="mt-2 text-sm text-neutral-500">ওয়েবসাইট থেকে নতুন মেসেজ এলে এখানে দেখা যাবে।</p>
        </div>
      ) : null}

      {!loading && messages.length > 0 ? (
        <div className="hidden min-w-0 gap-4 md:grid">
          {messages.map((message) => (
            <article
              key={message.id}
              className="rounded-2xl border border-[#DDEEDD] bg-white p-5 shadow-[0_14px_34px_rgba(23,53,26,0.07)] transition hover:border-[#CFE3C7] hover:shadow-[0_18px_42px_rgba(23,53,26,0.1)]"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-lg font-black text-[#17351a]">{message.name}</h2>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClass(message.status)}`}>
                      {statusLabels[message.status]}
                    </span>
                    {message.status === "unread" ? (
                      <span className="inline-flex rounded-full bg-[#FFF8E1] px-3 py-1 text-xs font-black text-[#8A5A00]">
                        নতুন মেসেজ
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#E8F5E9] bg-[#F7FBF7] px-3 py-1.5 text-sm font-semibold text-neutral-700">
                      <Phone className="size-4 shrink-0 text-[#2E7D32]" />
                      <span className="break-words">{message.phone}</span>
                    </span>
                    {message.email ? (
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#E8F5E9] bg-[#F7FBF7] px-3 py-1.5 text-sm font-semibold text-neutral-700">
                        <Mail className="size-4 shrink-0 text-[#2E7D32]" />
                        <span className="break-all">{message.email}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="shrink-0 text-right text-sm font-semibold text-neutral-500">
                  {formatDate(message.createdAt)}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-[#E8F5E9] bg-[#FBFDFB] px-4 py-3">
                <p className="line-clamp-3 break-words text-sm leading-7 text-neutral-700">
                  {message.message}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                {message.status === "unread" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(message, "read")}
                    disabled={pending}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#E8F5E9] px-4 text-sm font-bold text-[#1B5E20] transition hover:bg-[#d6edd8] disabled:opacity-60"
                  >
                    <CheckCircle2 className="size-4" />
                    পঠিত
                  </button>
                ) : null}
                {message.status !== "archived" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(message, "archived")}
                    disabled={pending}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-neutral-100 px-4 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-60"
                  >
                    <Archive className="size-4" />
                    আর্কাইভ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => changeStatus(message, "unread")}
                    disabled={pending}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#FFF8E1] px-4 text-sm font-bold text-[#8A5A00] transition hover:bg-[#fff0bf] disabled:opacity-60"
                  >
                    <RotateCcw className="size-4" />
                    ফিরিয়ে আনুন
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && messages.length > 0 ? (
        <div className="grid gap-3 md:hidden">
        {messages.map((message) => (
          <article
            key={message.id}
            className="rounded-2xl border border-[#DDEEDD] bg-white p-4 shadow-[0_14px_34px_rgba(23,53,26,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-black text-[#17351a]">{message.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                  <Clock3 className="size-3.5" />
                  {formatDate(message.createdAt)}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusClass(message.status)}`}>
                {statusLabels[message.status]}
              </span>
            </div>

            <div className="mt-4 grid gap-2 rounded-2xl bg-[#F7FBF7] p-3 text-sm text-neutral-700">
              <span className="flex min-w-0 items-center gap-2">
                <Phone className="size-4 shrink-0 text-[#2E7D32]" />
                <span className="break-words font-semibold">{message.phone}</span>
              </span>
              {message.email ? (
                <span className="flex min-w-0 items-center gap-2">
                  <Mail className="size-4 shrink-0 text-[#2E7D32]" />
                  <span className="break-words font-semibold">{message.email}</span>
                </span>
              ) : null}
            </div>

            <p className="mt-4 break-words rounded-2xl border border-[#E8F5E9] bg-[#FBFDFB] p-3 text-sm leading-7 text-neutral-700">
              {message.message}
            </p>

            <div className="mt-4 grid gap-2 min-[390px]:grid-cols-2">
              {message.status === "unread" ? (
                <button
                  type="button"
                  onClick={() => changeStatus(message, "read")}
                  disabled={pending}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E8F5E9] px-4 text-sm font-bold text-[#1B5E20] disabled:opacity-60"
                >
                  <CheckCircle2 className="size-4" />
                  পঠিত করুন
                </button>
              ) : null}
              {message.status !== "archived" ? (
                <button
                  type="button"
                  onClick={() => changeStatus(message, "archived")}
                  disabled={pending}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-neutral-100 px-4 text-sm font-bold text-neutral-700 disabled:opacity-60"
                >
                  <Archive className="size-4" />
                  আর্কাইভ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => changeStatus(message, "unread")}
                  disabled={pending}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#FFF8E1] px-4 text-sm font-bold text-[#8A5A00] disabled:opacity-60"
                >
                  <RotateCcw className="size-4" />
                  ফিরিয়ে আনুন
                </button>
              )}
            </div>
          </article>
        ))}
        </div>
      ) : null}
    </div>
  );
}
