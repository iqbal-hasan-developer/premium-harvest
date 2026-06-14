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

## Admin Product CRUD Migration Phase

Completed in this phase:

- Migrated admin product management from Firebase client CRUD to Supabase-backed server actions.
- Added server-only product management helpers in `lib/supabase/admin-products.ts`.
- Added `actions/admin-products.ts` for client-to-server admin product operations.
- Product manager now loads Supabase products, packages, images, and categories.
- Product create/update now writes to Supabase.
- Product delete is soft behavior: products are marked `is_active = false` and `published = false`.
- Product packages are stored in `product_packages`.
- Removed packages from the UI are marked `is_active = false`.
- Product images upload to Supabase Storage bucket `products`.
- Uploaded image metadata is stored in `product_images`.
- First uploaded image becomes primary if no active primary image exists.
- Admin can mark a product image as primary.
- Admin can deactivate image rows; storage cleanup is attempted when the URL belongs to the Supabase `products` bucket.

Tables used:

- `products`
- `product_packages`
- `product_images`
- `categories`

Storage bucket used:

- `products`

Product fields currently supported in admin UI:

- name
- slug
- category
- short description
- description
- base price
- stock quantity
- sort order
- featured
- published
- active/inactive
- multiple packages
- image upload
- primary image selection

Still not migrated:

- Admin gallery manager.
- Admin orders manager.
- Admin contacts manager.
- Public cart order submission.
- Contact form submission.
- Firebase files and remaining Firebase dashboard data flows outside products.

Next recommended phase:

Migrate the admin gallery manager to Supabase tables and Supabase Storage bucket `gallery`.

## Admin Product CRUD Fix Phase

Fixed after initial product CRUD migration:

- Product slugs are now normalized to URL-safe ASCII on the server before create/update.
- Bangla or non-Latin product names now get a safe fallback slug such as `premium-mango-...`.
- Duplicate slugs no longer hard-fail by default; the server appends a numeric suffix.
- Public product reads now load products first, then active packages/images by product id.
- Public products no longer disappear because of fragile embedded package/image filters.
- Public product mapper now provides a fallback image when no active product image exists.
- Product deactivate now sets:
  - `products.is_active = false`
  - `products.published = false`
  - related `product_packages.is_active = false`
  - related `product_images.is_active = false`
- Server actions now log Supabase product save/delete/image errors server-side.
- Admin slug field now sanitizes on blur and can be left blank for server-generated slug behavior.

Delete behavior:

- Delete in the admin UI means deactivate.
- Products are not hard-deleted, preserving future order references.

Remaining limitations:

- Existing product detail URLs with an old slug stop working after changing the slug.
- Image storage cleanup is still best-effort when deactivating individual image rows.
- Admin gallery, orders, and contacts remain on their current Firebase flows.

## Admin Gallery Upload Fix Phase

Completed in this phase:

- Added a Supabase-backed admin gallery data layer in `lib/supabase/admin-gallery.ts`.
- Added admin gallery server actions in `actions/admin-gallery.ts`.
- Dashboard gallery management now uses Supabase Storage bucket `gallery`.
- Gallery uploads now insert rows into `public.gallery`.
- Admin gallery list now reads Supabase gallery records, including drafts.
- Published gallery records continue to appear on the public `/gallery` page through the existing public Supabase read path.
- Upload validation now rejects non-image files and files larger than 5MB.
- Upload and delete loading states now reset through client-side `finally` blocks.
- Errors from Supabase upload, insert, read, and delete are returned to the admin UI.
- Delete removes the `public.gallery` row and attempts storage cleanup when the public URL belongs to the Supabase `gallery` bucket.

Upload method used:

- Browser admin UI submits files to server actions.
- Server actions verify active admin access through `requireAdmin`.
- Server-only Supabase admin client uploads with the service role key.
- `SUPABASE_SERVICE_ROLE_KEY` remains server-only and is not imported by client components.

Storage bucket and path:

- Bucket: `gallery`
- Path convention: `gallery/YYYY-MM-DD/{timestamp}-{index}-{safe-file-name}`

Table fields used:

- `title`
- `description`
- `image_url`
- `alt_text`
- `height`
- `sort_order`
- `published`

No additional SQL is required for this implementation because storage cleanup derives the object path from the Supabase public URL.

Still not migrated:

- Admin orders manager.
- Admin contacts manager.
- Public cart order submission.
- Contact form submission.
- Remaining Firebase files and fallback flows outside the migrated admin product/gallery areas.

## Orders Migration Phase

Completed in this phase:

- Migrated cart checkout order submission from Firebase/Firestore to Supabase.
- Migrated direct product order submission from Firebase/Firestore to Supabase.
- Added server-only order helpers in `lib/supabase/admin-orders.ts`.
- Replaced `actions/orders.ts` with Supabase-backed server actions.
- Added admin order actions in `actions/admin-orders.ts`.
- Dashboard order management now reads from Supabase `orders` and `order_items`.
- Admins can update `order_status`.
- Admins can update `payment_status`.
- Admin order management includes search by order number, phone, customer, and item text.
- Admin order detail view shows customer info, address, note, item lines, subtotal, delivery, discount, total, payment method, order status, and payment status.

Tables used:

- `orders`
- `order_items`

Order number behavior:

- New orders use `PH-YYYYMMDD-XXXX`.
- The server checks for collisions before insert and falls back to a timestamp suffix if needed.

Security behavior:

- Public checkout uses server actions and the server-only Supabase admin client.
- Admin order reads and updates require active Supabase admin access through `requireAdmin`.
- `SUPABASE_SERVICE_ROLE_KEY` remains server-only and is not imported by client components.

Remaining limitations:

- Public customer order tracking is not added yet.
- Order items currently store submitted package weight and unit price; product package IDs are not linked until the cart/direct order UI carries package record IDs.
- Dashboard overview may still use existing Firebase snapshot data until that screen is migrated separately.
- Contact form and contacts manager still use the existing Firebase/current flow.

Next recommended phase:

Add customer order tracking by order number and phone, then migrate contact form/contact management to Supabase.

## Dashboard Overview Supabase Fix Phase

Completed in this phase:

- Dashboard overview now reads Supabase dashboard data instead of browser-side Firebase/Firestore.
- Overview order count now uses `public.orders`, matching the admin orders page.
- Recent orders on the overview now use the same Supabase order mapping as order management.
- Overview stat cards now use Supabase counts for:
  - products
  - orders
  - gallery
  - contact messages
- Count query failures now surface as admin-visible errors instead of silently showing zero.
- Recent orders now show order number, customer, phone, item summary, total, payment status, order status, and created date.
- Added a link from overview recent orders to the full orders page.
- Lightly polished the admin orders page table with stronger order/customer hierarchy and compact item chips.

Security behavior:

- Overview dashboard reads require active Supabase admin access through `requireAdmin`.
- Supabase service role usage remains server-only.
- Client components call server actions and do not import the service role key.

Remaining limitations:

- Contact form and contacts manager still need their dedicated Supabase migration.
- Dashboard overview contact counts read Supabase `contact_messages`; if contact migration has not run yet, those counts may be lower than legacy Firebase contact data.
- Dashboard overview product/gallery counts read Supabase tables and no longer count legacy Firebase-only records.

## Contact Messages Migration Phase

Completed in this phase:

- Migrated public contact form submission from Firebase/Firestore to Supabase.
- Contact form submissions now insert into `public.contact_messages`.
- New contact messages are created with `status = 'unread'`.
- Email is optional; name, phone, and message are validated server-side.
- The form now clears only after a successful database insert.
- Contact submission failures now return a visible error instead of fake/demo success.
- Added server-only contact helpers in `lib/supabase/admin-contacts.ts`.
- Added admin contact server actions in `actions/admin-contacts.ts`.
- Dashboard contact messages now read real Supabase `contact_messages` rows.
- Removed the Firebase `contacts` read path from the admin contacts manager.
- Admins can mark messages as read, archive messages, and restore archived messages to unread.
- Empty state now shows: `এখনও কোনো মেসেজ নেই।`
- Admin contact message list is responsive with a desktop table and mobile cards.
- Dashboard overview contact counts already read Supabase `contact_messages`; unread count is based on `status = 'unread'`.

Tables used:

- `contact_messages`

Security behavior:

- Public contact form uses a server action and the server-only Supabase admin client.
- Public users are not granted select/update/delete access to contact messages.
- No anon insert RLS policy is required because inserts go through the server-only service role after validation.
- Admin contact reads and status updates require active Supabase admin access through `requireAdmin`.
- `SUPABASE_SERVICE_ROLE_KEY` remains server-only and is not imported by client components.

Remaining Firebase usage:

- Firebase packages/config remain in the project while migration continues.
- Legacy Firebase contact storage is no longer used by the public contact form or admin contacts manager.
- Any remaining Firebase usage should be reviewed by feature area before removal.

Next recommended phase:

Audit remaining Firebase imports and migrate or remove them feature by feature once Supabase parity is confirmed.

## Firebase Production Cleanup Audit

Current audit result:

- Firebase is not safe to remove yet.
- Production-facing writes and admin management are now Supabase-backed for products, gallery, orders, and contact messages.
- Public storefront reads are Supabase-first, but `lib/data.ts` still keeps Firebase fallback reads for products and gallery before falling back to demo data.
- Build/static generation can still print `Firebase Admin SDK is not configured. Using local demo data fallback.` when the Firebase fallback path is reached locally.

Fully migrated to Supabase:

- Supabase Auth/admin access for dashboard routes.
- Admin dashboard overview counts and recent orders.
- Admin product CRUD and product image management.
- Admin gallery upload/list/delete.
- Public gallery reads, as the primary data source.
- Cart checkout and direct product order submission.
- Admin order management and order/payment status updates.
- Public contact form submission.
- Admin contact message management and message status updates.

Still Firebase-dependent or Firebase-referencing:

- `lib/data.ts`
  - imports `firebase-admin/firestore`
  - imports `@/firebase/admin`
  - uses Firebase fallback reads for `products` and `gallery`
  - exports legacy `getDashboardSnapshot`, which still reads Firebase collections but is not currently imported by dashboard pages
- `firebase/admin.ts`
  - server-only Firebase Admin SDK helper for fallback reads and demo-fallback gating
- `firebase/client.ts`
  - Firebase browser client helper used by legacy manager components
- `components/admin/gallery-manager.tsx`
  - legacy Firebase gallery manager, not used by the active dashboard gallery route
- `components/admin/orders-manager.tsx`
  - legacy Firebase orders manager, not used by the active dashboard orders route
- `next.config.ts`
  - still allows Firebase Storage image hosts so legacy Firebase image URLs can render
- `.env.example`
  - still documents Firebase browser and Admin SDK variables
- `firebase.json`, `firestore.rules`, and `storage.rules`
  - still exist for the legacy Firebase project setup
- `package.json`
  - still includes `firebase` and `firebase-admin`

Safe to remove later after confirmation:

- Legacy unused admin components:
  - `components/admin/gallery-manager.tsx`
  - `components/admin/orders-manager.tsx`
- Legacy `getDashboardSnapshot` from `lib/data.ts`, if no external code imports it.
- Firebase setup docs and rule files, once all fallbacks are removed and legacy Firebase data/images are no longer needed.

Risky to remove now:

- `firebase` and `firebase-admin` packages, because current source files still import them.
- `firebase/admin.ts`, because `lib/data.ts` still imports it.
- Firebase Storage image host allow-list, if any old product/gallery image URLs still point to Firebase Storage.
- Firebase env references, while the fallback path remains in source.

Recommended cleanup path:

1. Confirm Supabase contains all production product and gallery records, including image URLs.
2. Decide whether demo data should remain as the only non-Supabase fallback.
3. Remove Firebase fallback reads from `lib/data.ts`.
4. Delete legacy unused Firebase admin manager components.
5. Delete `firebase/admin.ts` and `firebase/client.ts`.
6. Remove Firebase env examples, Firebase rule files, and Firebase image host allow-list.
7. Uninstall `firebase` and `firebase-admin`, then rebuild.

## Customer Order Tracking Phase

Completed in this phase:

- Added public `/track-order` route.
- Customers can track an order with order number and phone number.
- Tracking uses Supabase `orders` and `order_items`.
- Tracking lookup requires both exact `order_number` and matching `phone`.
- Public tracking does not list or expose unrelated orders.
- Added server action in `actions/track-order.ts`.
- Added public tracking helper in `lib/supabase/admin-orders.ts`.
- Tracking results show order number, customer name, phone, safe address summary, order status, payment status, items, package weight, quantity, subtotal, delivery charge, total, and created date.
- Added WhatsApp support CTA: `সাপোর্টে কথা বলুন`.
- Added public nav/footer link through `siteConfig.navItems`.
- Direct product order success now shows order number and a tracking button.
- Cart order success now shows order number and a tracking button.

Security behavior:

- Public tracking uses a server action and the server-only Supabase admin client.
- `SUPABASE_SERVICE_ROLE_KEY` is not imported by client components.
- A user only receives order details when both submitted fields match the same order row.

## Firebase Removal Phase

Completed in this phase:

- Removed Firebase fallback reads from `lib/data.ts`.
- Public product and gallery reads now use Supabase as the production source of truth.
- Demo storefront data is no longer used by default.
- Optional local demo data is available only when `NEXT_PUBLIC_ENABLE_DEMO_DATA=true`.
- Removed legacy unused Firebase admin managers:
  - `components/admin/gallery-manager.tsx`
  - `components/admin/orders-manager.tsx`
- Removed Firebase helper files:
  - `firebase/admin.ts`
  - `firebase/client.ts`
- Removed Firebase project/rules files:
  - `firebase.json`
  - `firestore.rules`
  - `storage.rules`
- Removed Firebase environment examples from `.env.example`.
- Removed Firebase Storage image host allow-list entries from `next.config.ts`.
- Removed `firebase` and `firebase-admin` from `package.json`.
- Updated `package-lock.json` after package removal.
- Updated README setup instructions to Supabase-only.

Current production data behavior:

- Supabase is now the source of truth for products, product images, gallery, orders, order items, customer order tracking, contact messages, and admin data.
- If Supabase products/gallery are empty in production, the public pages show their existing empty states instead of silently using Firebase or demo data.
- Local demo data requires the explicit `NEXT_PUBLIC_ENABLE_DEMO_DATA=true` flag.

Remaining Firebase references:

- No Firebase imports remain in application source.
- No Firebase packages remain in `package.json`.
- Historical migration notes may still mention Firebase to document previous phases.

Remaining production tasks:

- Confirm production Supabase has all required product, package, image, gallery, admin, and settings data.
- Confirm deployed environment variables contain only Supabase/site values.
- Run manual QA for storefront, checkout, tracking, contact, and admin flows on the production deployment.
- Remove any stale Firebase variables from hosting provider settings if they still exist there.
