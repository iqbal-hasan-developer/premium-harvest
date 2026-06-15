import Link from "next/link";
import { siteConfig } from "@/lib/constants";

type PolicySection = {
  title: string;
  description?: string;
  items?: string[];
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt?: string;
  sections: PolicySection[];
};

export function PolicyPage({ eyebrow, title, description, updatedAt, sections }: PolicyPageProps) {
  return (
    <main className="bg-gradient-to-b from-white via-[#FBFFF8] to-[#F7FBF7] py-10 sm:py-14">
      <section className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#CFE3C7] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#D99600] shadow-sm">
            {eyebrow}
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight text-[#17351a] sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-neutral-600">{description}</p>
          {updatedAt ? <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">সর্বশেষ আপডেট: {updatedAt}</p> : null}
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-[#E8F5E9] bg-white p-5 shadow-sm shadow-green-950/5 sm:p-6">
              <h2 className="text-xl font-black leading-8 text-[#17351a]">{section.title}</h2>
              {section.description ? <p className="mt-3 text-sm font-medium leading-7 text-neutral-600">{section.description}</p> : null}
              {section.items?.length ? (
                <ul className="mt-4 grid gap-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="rounded-2xl bg-[#F7FBF7] px-4 py-3 text-sm font-semibold leading-7 text-neutral-700">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-[#CFE3C7] bg-[#E8F5E9] p-5 text-center shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-[#17351a]">আরও সহায়তা দরকার?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-7 text-neutral-700">
            অর্ডার, ডেলিভারি বা পলিসি সম্পর্কে কোনো প্রশ্ন থাকলে {siteConfig.name} টিমের সাথে যোগাযোগ করুন।
          </p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={siteConfig.phoneHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2E7D32] px-5 text-sm font-black text-white transition hover:bg-[#1B5E20]"
            >
              {siteConfig.phoneDisplay}
            </a>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#CFE3C7] bg-white px-5 text-sm font-black text-[#1B5E20] transition hover:border-[#A9D39F]"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
