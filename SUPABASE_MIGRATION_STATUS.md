# Supabase Migration Status

## Phase Completed

This phase adds the Supabase foundation without removing Firebase or changing current product, gallery, order, contact, admin, or public UI flows.

Added:

- Supabase browser client utility.
- Supabase cookie-aware server client utility for Next.js App Router.
- Supabase server-only admin client utility using the service role key.
- Supabase environment placeholders in `.env.example`.
- Initial relational SQL schema in `supabase/schema.sql`.
- Row Level Security policies for public storefront reads and admin management.
- Storage setup notes for products, gallery, and banners.

## Not Migrated Yet

The following still use the existing Firebase implementation:

- Product loading and management.
- Gallery loading and management.
- Admin authentication and dashboard access.
- Orders and cart order submission.
- Contact form submission.
- Image upload flows.
- Existing Firebase rules, config, and environment handling.

## Next Recommended Phase

Recommended next phase: connect Supabase Auth/admin lookup without removing Firebase.

Suggested scope:

1. Create the Supabase project and run `supabase/schema.sql`.
2. Create the first auth user in Supabase.
3. Insert that user's id into `admin_users`.
4. Add a small admin-auth proof path or server utility.
5. Keep Firebase data reads active until product/gallery migration is ready.

## Manual Supabase Dashboard Steps

1. Create a Supabase project.
2. Copy Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Copy service role key into `SUPABASE_SERVICE_ROLE_KEY`.
5. Never commit real keys to GitHub.
6. Open SQL Editor and run `supabase/schema.sql`.
7. Create public storage buckets:
   - `products`
   - `gallery`
   - `banners`
8. Create the first admin auth user.
9. Insert the first admin row manually:

```sql
insert into public.admin_users (id, email, role, is_active)
values ('SUPABASE_AUTH_USER_ID', 'admin@example.com', 'owner', true);
```

Replace `SUPABASE_AUTH_USER_ID` with the user's id from Supabase Auth.

## Public Read Migration Phase

Completed in this phase:

- Added Supabase public read adapters for products, featured products, product detail pages, categories, and gallery.
- Updated `lib/data.ts` so public storefront reads prefer Supabase first.
- Kept Firebase as the second fallback while the migration is in progress.
- Kept demo data as the final fallback so public pages still render if Supabase tables are empty.
- Added `supabase/seed-products.sql` as an optional manual seed file.
- Added a narrow Next.js image allow-list entry for the configured Supabase Storage host.

Fallback order for public pages:

1. Supabase published/active public rows.
2. Existing Firebase data, when available.
3. Demo storefront data.

Public reads now use these Supabase tables:

- `products`
- `product_packages`
- `product_images`
- `categories`
- `gallery`

Still not migrated:

- Admin dashboard reads/writes.
- Admin authentication.
- Product/gallery admin upload and management flows.
- Cart order submission.
- Contact form submission.
- Firebase configuration and Firebase fallback files.

Optional seed:

Run `supabase/seed-products.sql` manually in the Supabase SQL Editor if you want a few published products, packages, images, categories, and gallery records for storefront testing.

Next recommended phase:

Migrate admin authentication/session handling to Supabase Auth and verify `admin_users` checks, while keeping Firebase admin dashboard data flows untouched until auth is stable.

## Admin Auth Migration Phase

Completed in this phase:

- Migrated `/admin/login` from Firebase Auth to Supabase Auth email/password sign-in.
- Replaced the dashboard auth provider with a Supabase session provider.
- Dashboard route protection now requires:
  - an authenticated Supabase user
  - a matching active row in `public.admin_users`
  - `admin_users.is_active = true`
- Non-admin Supabase users are signed out and denied access.
- Dashboard logout now signs out through Supabase and redirects to `/admin/login`.
- Added `lib/supabase/admin-auth.ts` for server-side admin checks in future phases.
- Added `/admin` redirect to `/admin/login`.

Routes affected:

- `/admin`
- `/admin/login`
- `/dashboard`
- `/dashboard/products`
- `/dashboard/gallery`
- `/dashboard/orders`
- `/dashboard/contacts`

Still not migrated:

- Admin product CRUD.
- Admin gallery manager.
- Admin orders manager.
- Admin contacts manager.
- Public cart order submission.
- Contact form submission.
- Firebase files and Firebase data fallback paths.

Next recommended phase:

Migrate admin products CRUD to Supabase tables and Supabase Storage while keeping orders, contacts, and gallery management on the current implementation until each area is verified separately.
