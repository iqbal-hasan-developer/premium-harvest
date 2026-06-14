# Premium Harvest

Modern Bangla organic mango e-commerce site built with Next.js 16 App Router, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add Supabase project URL, anon key, and service role key.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Create public Supabase Storage buckets for products, gallery, and banners.
5. Create the first Supabase Auth admin user and add it to `public.admin_users`.
6. Install and run:

```bash
npm install
npm run dev
```

Public site content is in Bangla. Supabase is the production source of truth. Optional local demo data is available only when `NEXT_PUBLIC_ENABLE_DEMO_DATA=true`.
