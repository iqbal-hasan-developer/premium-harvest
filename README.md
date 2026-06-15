# Premium Harvest

Premium Harvest is a Bangla mango e-commerce site built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

Supabase is the production source of truth for storefront products, gallery images, orders, order tracking, contact messages, storage uploads, and admin authentication.

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in the values for your Supabase project and public site settings.

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=8801700000000
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET=products
NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET=gallery
NEXT_PUBLIC_SUPABASE_BANNERS_BUCKET=banners
NEXT_PUBLIC_ENABLE_DEMO_DATA=false
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not expose it in client code, browser bundles, GitHub, or public logs.

`NEXT_PUBLIC_ENABLE_DEMO_DATA` is optional and should stay `false` in production.

`NEXT_PUBLIC_META_PIXEL_ID` is optional. Leave it blank to disable Meta Pixel without breaking local development or production builds.

## Meta Pixel Tracking

Client-side Meta Pixel tracking is enabled only when `NEXT_PUBLIC_META_PIXEL_ID` is set.

Tracked events:

- `PageView` on initial public page load and public route changes.
- `ViewContent` on product detail pages.
- `AddToCart` after a package is added to the cart.
- `InitiateCheckout` when the cart checkout form opens.
- `Purchase` only after Supabase order creation succeeds.
- `Lead` after a contact form submission succeeds.

To test, set `NEXT_PUBLIC_META_PIXEL_ID` in `.env.local`, run the app, then verify events with the Meta Pixel Helper browser extension. Leave the variable blank to confirm the site has no Pixel errors when tracking is disabled.

Meta Conversions API is not included in this phase. It can be added later for stronger server-side tracking and event deduplication.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Create public storage buckets:
   - `products`
   - `gallery`
   - `banners`
4. Confirm RLS policies from the schema are enabled.
5. Add products, product packages, product images, gallery rows, and admin users through Supabase or the admin panel.

## Create The First Admin User

1. In Supabase Auth, create an email/password user for the admin.
2. Copy the user's UUID from Supabase Auth.
3. Insert a matching active row in `public.admin_users`:

```sql
insert into public.admin_users (id, email, role, is_active)
values ('SUPABASE_AUTH_USER_ID', 'admin@example.com', 'owner', true);
```

Only authenticated users with an active `admin_users` row can access `/dashboard`.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks before shipping:

```bash
npm run lint
npm run typecheck
npm run build
npm audit
```

## Deploy To Vercel

1. Connect the repository to Vercel.
2. Add the required environment variables in the Vercel project settings.
3. Keep `NEXT_PUBLIC_ENABLE_DEMO_DATA=false`.
4. Deploy with the normal Vercel Next.js build.
5. After deployment, verify storefront, checkout, tracking, contact, and admin flows against production Supabase data.

## Production QA Checklist

- Home page loads.
- Shop page loads real Supabase products.
- Product detail page works.
- Add to cart works.
- Cart order submission works.
- Direct order works.
- Order appears in admin.
- Order tracking works with the correct phone and order number.
- Wrong phone number does not reveal an order.
- Contact form submits.
- Contact message appears in admin.
- Product create, edit, and delete work.
- Gallery upload works.
- Admin logout works.
- Live Vercel deployment works.
