"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/firebase/client";
import type { ContactMessage } from "@/types";

export function ContactsManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const snapshot = await getDocs(query(collection(db, "contacts"), orderBy("createdAt", "desc")));
        setMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ContactMessage));
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    void loadMessages();
  }, []);

  return (
    <div className="grid gap-4">
      {loading ? <p className="text-neutral-500">লোড হচ্ছে...</p> : null}
      {!loading && !messages.length ? (
        <div className="rounded-2xl bg-white p-8 text-center text-neutral-500 shadow-sm">কোনো মেসেজ নেই।</div>
      ) : null}
      {messages.map((message) => (
        <article key={message.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div>
              <h2 className="text-lg font-bold text-[#17351a]">{message.name}</h2>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-neutral-600">
                <span className="flex items-center gap-1"><Phone className="size-4 text-[#2E7D32]" /> {message.phone}</span>
                <span className="flex items-center gap-1"><Mail className="size-4 text-[#2E7D32]" /> {message.email}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 leading-7 text-neutral-700">{message.message}</p>
        </article>
      ))}
    </div>
  );
}
