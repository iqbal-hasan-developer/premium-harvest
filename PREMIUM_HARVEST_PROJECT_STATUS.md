# Premium Harvest Project Status

Audit date: 2026-06-09

## Executive summary

Premium Harvest is a modern Next.js e-commerce starter for a mango / fresh fruit brand. It already has a public storefront, product listing, product detail pages, gallery, contact form, Firebase-based order submission, and a basic protected admin dashboard for products, gallery, orders, and contact messages.

The project is not production-ready yet. The strongest foundation is already in place: Next.js App Router, TypeScript, Tailwind CSS, Firebase Auth, Firestore, Storage, validation with Zod, and mobile-conscious layouts. The main gaps are production authentication hardening, complete order/cart workflow, richer product data modeling, SEO/content polish, delivery/payment workflow, admin settings/content management, and replacing demo/placeholder assets with real brand content.

Recommended backend direction: continue with Option A, Next.js + Firebase Auth + Firestore + Firebase Storage, because the codebase is already built around Firebase client/admin SDKs, Firestore rules, Storage rules, admin login, image upload, product management, order management, and contact storage.

## Current stack

- Framework: Next.js 16.2.6.
- Routing: Next.js App Router under `app/`.
- UI library: React 19.2.0.
- Language: TypeScript with `strict: true`.
- Package manager: npm, confirmed by `package-lock.json`.
- Styling: Tailwind CSS v4 via `@import "tailwindcss"` in `app/globals.css`, plus hand-written global utility classes.
- Animation: Framer Motion.
- Icons: lucide-react.
- Forms/validation: react-hook-form, Zod, @hookform/resolvers.
- Notifications: sonner.
- Backend/data: Firebase client SDK, Firebase Admin SDK, Firestore, Firebase Storage.
- Deployment/build: standard Next.js commands: `npm run build`, `npm run start`; Firebase rule files also exist.
- WordPress/Laravel/plain HTML: no. This is a React/Next.js project.
- TypeScript: yes.
- Tailwind CSS: yes.
- Database/backend connected: partially yes. Firebase is integrated, but the build currently reports invalid Firebase Admin private key formatting, so server-side Admin SDK is disabled in the current environment and public pages fall back to demo data.

## Current folder structure

```text
actions/             Server actions for contacts and orders
app/                 Next.js App Router routes, metadata, sitemap, robots
components/          Public UI, layout, shop, forms, gallery, admin dashboard
firebase/            Firebase client and admin initialization
hooks/               Auth context hook
lib/                 Site constants, data loaders, demo data, validation schemas
public/              Favicon, Open Graph SVG, brand logo image
types/               Shared TypeScript domain types
utils/               Formatting, slug, WhatsApp helper functions
firestore.rules      Firestore security rules
storage.rules        Firebase Storage security rules
firebase.json        Firebase config
```

Generated/local folders and files also exist: `.next/`, `.npm-cache/`, `node_modules/`, `dev-server.log`, `dev-server.err.log`, `tsconfig.tsbuildinfo`.

## Current pages/routes

| Route | File path | Status | Current behavior | Needs improvement |
| --- | --- | --- | --- | --- |
| `/` | `app/page.tsx` | Partial but working | Renders hero, featured products, specialty/story sections. Products come from Firestore when Admin SDK works, otherwise demo products. | Real brand copy/photos, stronger mobile conversion sections, trust/delivery/payment blocks, production product data. |
| `/shop` | `app/shop/page.tsx` | Partial but working | Lists products with client-side search. | Category filters, sorting, availability labels, real package data, product SEO/content. |
| `/shop/[slug]` | `app/shop/[slug]/page.tsx` | Partial but working | Static product detail pages generated from available products/demo data. Includes gallery, package selection, quantity, order modal, WhatsApp order link. | Complete delivery/payment choices, stock/preorder logic, product structured data, unavailable state, cart integration if needed. |
| `/gallery` | `app/gallery/page.tsx` | Partial but working | Shows gallery images from Firestore or demo images. | Real brand gallery, image captions/alt text, admin-controlled ordering. |
| `/about` | `app/about/page.tsx` | Partial/static | Static story, mission, vision content. | Final company story, trust proof, certifications, farm/origin details. |
| `/contact` | `app/contact/page.tsx` | Partial but working | Contact details plus contact form saved through server action when Firebase Admin works. | Real map embed, stronger validation/anti-spam, final contact data. |
| `/admin/login` | `app/admin/login/page.tsx` | Partial but working | Firebase email/password sign-in. | Must verify admin role, handle already-authenticated state, improve production security messages. |
| `/dashboard` | `app/dashboard/page.tsx` | Partial | Client-side dashboard overview loads products, orders, gallery, contacts. | Server-side authorization, better analytics, revenue/order statuses, empty/error states. |
| `/dashboard/products` | `app/dashboard/products/page.tsx` | Partial but functional | Create/edit/delete products, package pricing, image uploads to Firebase Storage. | Richer product schema, image deletion/ordering, category/variety/origin fields, publish/draft, slug collision handling. |
| `/dashboard/gallery` | `app/dashboard/gallery/page.tsx` | Partial but functional | Upload/delete gallery image records. | Image deletion from Storage, titles/captions, ordering, file validation. |
| `/dashboard/orders` | `app/dashboard/orders/page.tsx` | Partial | View orders and change status among pending/confirmed/delivered. | Payment status, delivery status, filtering, search, order details, export/print, tracking. |
| `/dashboard/contacts` | `app/dashboard/contacts/page.tsx` | Partial | Lists contact messages. | Mark read/replied, delete/archive, spam protection. |
| `/api/health` | `app/api/health/route.ts` | Working utility | Returns JSON service health. | Add environment/backend health only if needed. |
| `/robots.txt` | `app/robots.ts` | Working | Allows public site, disallows `/dashboard`. | Also consider disallowing `/admin/login`. |
| `/sitemap.xml` | `app/sitemap.ts` | Working | Includes static routes and product routes. | Use canonical production URL and stable product update dates. |
| `/_not-found` | `app/not-found.tsx` | Working | Custom 404. | Optional product/search recovery links. |

Missing expected e-commerce routes:

- No `/cart` page.
- No `/checkout` page.
- No `/orders/[id]` or order tracking route.
- No policy pages such as privacy, terms, refund/return, shipping/delivery.
- No blog/content route.
- No category route.

## Current components

| Component | File path | Purpose | Status/reusability | Needs improvement |
| --- | --- | --- | --- | --- |
| Navbar/mobile menu | `components/layout/navbar.tsx` | Sticky public header, desktop nav, mobile drawer, admin login CTA. | Reusable, working. | Hide admin CTA on production public nav if desired, add cart/order CTA, check mobile text overflow. |
| Site chrome | `components/layout/site-chrome.tsx` | Wraps public pages with navbar/footer/WhatsApp, excludes dashboard. | Good. | Also exclude login if a minimal admin login shell is preferred. |
| Footer | `components/layout/footer.tsx` | Brand links, social placeholders, contact details. | Partial. | Replace `#` social links, add policy links, final business info. |
| Floating WhatsApp | `components/layout/floating-whatsapp.tsx` | Floating WhatsApp order/contact button. | Good mobile conversion element. | Confirm real number and avoid overlap with sticky product CTA. |
| Brand logo | `components/layout/brand-logo.tsx` | Shared logo/brand display. | Reusable. | Confirm logo asset dimensions/quality. |
| Hero | `components/sections/hero.tsx` | Homepage full-screen visual hero. | Visually strong. | Real mango/farm image, reduce heavy blur if it hurts image clarity/performance. |
| Featured products | `components/sections/featured-products.tsx` | Shows featured product cards. | Reusable. | Tie to admin `featured` and publish flags. |
| Specialty/story sections | `components/sections/specialty.tsx`, `components/sections/story-slider.tsx` | Brand/trust storytelling. | Static/partial. | Final content and proof points. |
| Product card | `components/shop/product-card.tsx` | Listing card with image, price, CTA. | Reusable and clear. | Stock/preorder labels, package preview, category badge, image fallback. |
| Product search | `components/shop/product-search.tsx` | Client-side text filtering. | Simple/working. | Categories, sorting, debounced search, empty-state CTA. |
| Product gallery | `components/shop/product-gallery.tsx` | Product detail image switcher. | Simple/working. | Alt text per image, fallback, keyboard accessibility. |
| Product order panel | `components/shop/product-order-panel.tsx` | Package selection, quantity, sticky summary, modal order form, WhatsApp CTA. | Core conversion component, partial. | Delivery zones/payment/preorder/stock logic, avoid overlap on small screens, cart support if desired. |
| Order form | `components/forms/order-form.tsx` | Client-side Firestore order submission. | Works if Firestore client rules/config allow creates. | Should reuse server action/Zod validation, add payment/delivery fields and confirmation page. |
| Contact form | `components/forms/contact-form.tsx` | Server action contact submission. | Better pattern than order form. | Anti-spam and final UX states. |
| Dashboard shell | `components/admin/dashboard-shell.tsx` | Admin navigation/sidebar/mobile tabs. | Working. | Role-aware links, active state on mobile, better responsive admin tables. |
| Auth guard | `components/admin/auth-guard.tsx` | Redirects unauthenticated users. | Basic auth only. | Must verify admin role, not just signed-in user. |
| Product manager | `components/admin/product-manager.tsx` | Product CRUD and image upload. | Strong start. | Needs richer schema, validation, image delete/order, publish state, categories. |
| Gallery manager | `components/admin/gallery-manager.tsx` | Gallery upload/delete records. | Working start. | Delete actual Storage files, captions, sorting. |
| Orders manager | `components/admin/orders-manager.tsx` | Order table and status updates. | Partial. | Payment/delivery workflow, filters, order detail view, customer history. |
| Contacts manager | `components/admin/contacts-manager.tsx` | Contact message listing. | Partial. | Read/replied/archive/delete states. |

## Current data/product system

Product data is loaded through `lib/data.ts`.

Current sources:

- Firestore collection: `products`, ordered by `createdAt desc`.
- Demo fallback: `lib/demo-data.ts`.
- Type definitions: `types/index.ts`.
- Product admin writes: `components/admin/product-manager.tsx`.

Current product fields:

- `id`
- `name`
- `slug`
- `price`
- `packages?: { weight, price, recommended }[]`
- `description`
- `shortDescription`
- `featured`
- `images`
- `stock?`
- `createdAt?`

Current image handling:

- Demo/public product images use Unsplash remote URLs.
- Admin product images upload to Firebase Storage under `products/`.
- Product image URLs are stored in Firestore as plain string URLs.
- `next.config.ts` currently allows `images.unsplash.com` only. Firebase Storage domains may need to be added for uploaded images to render through `next/image`.

Current price/package handling:

- Product has a base `price`.
- Package list stores `weight`, `price`, and optional `recommended`.
- `getProductPackages()` creates fallback 5kg/10kg/20kg packages if no package list exists.

Current stock/category handling:

- `stock` exists but is not fully enforced in buying flow.
- No category, variety, origin, publish/draft, sort order, preorder, harvest note, or delivery note fields.
- No category collection or category management UI.

Recommended future product fields:

```ts
{
  id: string;
  title_bn: string;
  title_en: string;
  slug: string;
  category: string;
  variety: string;
  origin: string;
  short_description: string;
  full_description: string;
  price: number;
  compare_at_price?: number;
  package_size: string;
  unit: string;
  images: string[];
  stock_status: "in_stock" | "limited" | "out_of_stock";
  preorder_status: "open" | "closed" | "not_preorder";
  delivery_note?: string;
  harvest_date_note?: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Product data is not fully ready for long-term admin management yet, but the current product manager is a useful starting point.

## Cart/checkout status

Current status: no traditional cart and no checkout route.

What works:

- Product detail page allows package selection.
- Quantity can be increased/decreased.
- Sticky order summary updates price.
- Order modal collects customer name, phone, address, and note.
- Order can be submitted directly to Firestore from the client component.
- WhatsApp order link is generated with selected product/package/quantity/total.

Missing or partial:

- No add-to-cart system.
- No cart persistence in localStorage/session/database.
- No cart page or drawer.
- No multi-product checkout.
- No delivery zone selection.
- No payment method selection.
- No advance payment field.
- No order confirmation page with order ID.
- No customer order tracking route.
- No checkout server-side validation reuse in the current client form.
- No stock enforcement before order submission.
- No phone format normalization.

Before production:

- Decide whether the business needs a cart or direct single-product order flow. For mango preorders, direct order flow may be acceptable at first.
- Move order submission to a single validated path, preferably server action + Firestore Admin SDK or a locked-down client create rule.
- Add delivery zone, payment method, payment status, delivery status, order number, and confirmation UI.

## Admin dashboard status

Current admin features:

- Firebase email/password login page exists.
- Dashboard routes are wrapped with `AuthProvider` and `AuthGuard`.
- Product management can create, edit, delete products and upload images.
- Gallery management can upload images and delete Firestore records.
- Orders can be listed and status can be changed.
- Contact messages can be listed.
- Dashboard overview shows counts and recent orders.

Important security issue:

- `components/admin/auth-guard.tsx` only checks `request.auth != null` at the UI level.
- `firestore.rules` defines `isAdmin()` as any signed-in user. That means any authenticated Firebase user can read/update/delete protected collections unless sign-up is disabled and accounts are manually controlled.
- `storage.rules` has a stronger admin check through `admins/{uid}`, but Firestore rules should match that pattern.

Missing admin features:

- Proper admin role verification against `admins/{uid}`.
- Product categories.
- Homepage banner/content management.
- Product publish/draft state.
- Product image ordering and deletion from Storage.
- Order detail page.
- Payment verification/status.
- Delivery status management beyond simple delivered.
- Customer messages archive/reply state.
- Website settings.
- Admin activity audit log.
- Better dashboard analytics.

Recommended admin architecture:

- Use Firebase Auth for admin users.
- Store admin role documents in `admins/{uid}` with role and status fields.
- Enforce admin checks in Firestore and Storage rules.
- Keep admin dashboard under `/dashboard`.
- Use server actions/API routes for sensitive writes where possible.
- Store products, categories, orders, gallery, banners, messages, and settings as first-class Firestore collections.

## Backend/database status

Current backend:

- Firebase client SDK: `firebase/client.ts`.
- Firebase Admin SDK: `firebase/admin.ts`.
- Firestore collections referenced: `products`, `orders`, `gallery`, `contacts`, `admins`.
- Firebase Storage paths referenced: `products/`, `gallery/`.
- Firestore rules file exists.
- Storage rules file exists.

Current authentication:

- Firebase Auth client state through `hooks/use-auth.tsx`.
- Email/password login through `app/admin/login/page.tsx`.
- No confirmed admin role check in dashboard UI or Firestore rules.

Current order storage:

- `components/forms/order-form.tsx` writes directly to Firestore client collection `orders`.
- `actions/orders.ts` also defines a server action with Zod validation and Admin SDK/REST fallback, but it does not appear to be used by the current order form.

Current image storage:

- Admin product/gallery uploads use Firebase Storage and store download URLs in Firestore.
- Storage security rules are more restrictive than Firestore rules.

Environment variables listed in `.env.example`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Current environment concern:

- `npm run build` reports: `FIREBASE_PRIVATE_KEY is not a valid PEM key. Firebase Admin SDK is disabled.`
- Because Admin SDK is disabled, public server data loaders fall back to demo products/gallery during build.

Recommended backend choice:

- Option A, Next.js + Firebase Auth + Firestore + Firebase Storage.
- Reason: the codebase already uses Firebase throughout and has admin/product/order/gallery concepts wired to Firestore and Storage.
- Supabase would also be viable, but switching now would rewrite existing backend assumptions.

## Mobile-first audit

Current mobile-friendly parts:

- Public navbar has a mobile drawer.
- Product listing uses responsive grid.
- Product detail layout stacks on small screens.
- Product order summary is sticky near the bottom.
- Order modal becomes a bottom sheet on small screens.
- Floating WhatsApp CTA exists.
- Inputs/buttons have comfortable touch sizes in many places.
- Dashboard has mobile top navigation.

Needs improvement:

- Add real mobile checkout/order confirmation flow.
- Ensure sticky WhatsApp and sticky order summary do not overlap on small screens.
- Make admin tables more mobile-friendly; current tables rely on horizontal scroll.
- Product cards need stock/preorder/delivery info visible without crowding.
- Button labels and long Bangla text should be tested on narrow devices.
- Hero is full-height and visually strong, but may delay users from seeing products on small screens.
- Add category chips/filter controls for faster mobile shopping.
- Optimize large remote images and avoid over-blurred hero imagery.

## UI/UX audit

Strengths:

- Visual direction is clean, natural, and premium-leaning.
- Green/natural palette matches mango/fresh fruit positioning.
- CTAs are clear on product pages.
- WhatsApp ordering matches Bangladesh mobile buying behavior.
- Admin dashboard is simple and understandable.
- Framer Motion gives polish without overwhelming the app.

Risks/gaps:

- Most imagery is Unsplash placeholder imagery, not real product/farm/packaging photography.
- Footer social links are placeholders.
- Delivery/payment/trust information is not strong enough for conversion.
- Product cards do not show enough practical purchase information.
- Some public content is static and likely not final.
- Bangla content should be QA-tested in browser. Source files are UTF-8, but terminal output in this audit rendered Bangla as mojibake due shell display encoding.
- The palette leans heavily green; add restrained mango/yellow, warm off-white, and neutral contrast through final design tokens.

Recommended UX additions:

- Trust badges: chemical-free, direct from orchard, safe packaging, COD/advance payment info, delivery coverage.
- Delivery section: Dhaka / outside Dhaka charges, delivery windows, courier notes.
- Product detail proof: harvest origin, variety, package size, freshness note.
- Post-order confirmation: clear next steps and WhatsApp support.

## SEO audit

Current SEO:

- Root metadata exists in `app/layout.tsx`.
- Per-page metadata exists for shop, product details, gallery, about, contact.
- Open Graph root image points to `/og.svg`.
- `robots.ts` exists.
- `sitemap.ts` exists and includes product routes.
- Store JSON-LD exists in root layout.
- Product pages generate metadata from product data.
- `html lang="bn"` is set.

Needs improvement:

- Set production URL to `https://www.premiumharvestbd.com`.
- Replace placeholder `.env.example` URL and ensure `.env.local`/deployment use the final domain.
- Add product structured data for Product/Offer/Availability.
- Add canonical URLs.
- Add richer Open Graph images using real brand/product imagery.
- Add alt text per image, not just product name.
- Add policy pages and include them in footer/sitemap if public.
- Add Bangla and English SEO fields if bilingual SEO matters.
- Add keyword-focused content for:
  - Premium Harvest Ltd
  - fresh mango in Bangladesh
  - chemical-free mango
  - safe fruits
  - Himsagar mango
  - Nag Fazli mango
  - mango delivery Bangladesh
  - fresh fruit e-commerce Bangladesh
- Ensure product slugs include real varieties and stay stable.

## Production readiness audit

Validation commands run:

| Command | Result |
| --- | --- |
| `npm run lint` | Failed. `next lint` is interpreted as project directory `.../Premium Harvest/lint`; likely script is incompatible with the current Next.js version/tooling. |
| `npm run typecheck` | Passed after rerunning outside sandbox due initial local npm.ps1 permission error. |
| `npm run build` | Passed. Next.js generated static pages and SSG product routes from demo/current data. |
| `npm audit --omit=dev` | Failed due 20 moderate vulnerabilities in transitive dependencies; npm reports no fix available for the listed chains. |

Build output route summary:

- Static: `/`, `/about`, `/admin/login`, `/contact`, `/dashboard`, `/dashboard/contacts`, `/dashboard/gallery`, `/dashboard/orders`, `/dashboard/products`, `/gallery`, `/robots.txt`, `/shop`, `/sitemap.xml`, `/_not-found`.
- SSG: `/shop/[slug]` for `gobindobhog-mango`, `himsagar-mango`, `langra-mango`, `fazli-mango`.
- Dynamic: `/api/health`.

Production concerns:

- Firebase Admin private key invalid in current environment.
- Firestore admin security rules are too permissive for signed-in users.
- `next/image` remote patterns only include Unsplash; Firebase Storage image URLs may fail unless configured.
- Lint script is broken.
- No cart/checkout/tracking/policy pages.
- Order submission has duplicated paths: unused server action and current client-side write.
- Contact form says demo success if Admin SDK is unavailable, which can mislead production users.
- Demo data and placeholder imagery still exist in the public experience.
- No clear loading/error states for every product/order/admin action.
- No rate limiting or anti-spam for public forms.
- No real payment verification flow.
- No app-level error boundary found.
- No visible deployment config beyond Next/Firebase rule files.
- Not a Git repository in the audited folder, so version-control safety is unclear.

Package vulnerabilities from `npm audit --omit=dev`:

- 20 moderate severity vulnerabilities.
- Main chains: `next -> postcss`, `firebase/firebase-admin -> protobufjs`, `firebase-admin -> @google-cloud/storage -> uuid`.
- npm reported no fix available for some issues, so this should be reviewed again after dependency updates are available.

## Risks/issues found

1. Firestore admin authorization is currently too broad because any signed-in user is treated as admin.
2. Firebase Admin SDK is disabled in the current environment because the private key is not valid PEM.
3. Public product/gallery pages may silently use demo data when Admin SDK is unavailable.
4. Order submission is client-side and separate from the server action validation path.
5. No production cart/checkout/order tracking workflow.
6. Product data model is too small for a production fruit e-commerce catalog.
7. Uploaded Firebase Storage images may not render through Next Image until remote image config is updated.
8. Lint command is broken.
9. Placeholder images/social links/content remain.
10. Dependency audit reports moderate vulnerabilities with no current automatic fix.

## Recommended final architecture

Frontend:

- Keep Next.js App Router.
- Keep public routes under `app/`.
- Add route groups if the app grows, for example `(public)` and `(admin)`.
- Keep reusable UI under `components/`.
- Add dedicated modules for product, order, category, and settings services.

Backend/database:

- Continue with Firebase.
- Firestore collections:
  - `products`
  - `categories`
  - `orders`
  - `gallery`
  - `banners`
  - `contacts`
  - `settings`
  - `admins`
  - optional `auditLogs`
- Firebase Storage paths:
  - `products/{productId}/...`
  - `gallery/...`
  - `banners/...`

Authentication:

- Firebase Auth email/password for admins.
- `admins/{uid}` document controls role/status.
- Firestore and Storage rules must check admin role, not only signed-in state.
- Public customers do not need accounts in the first production version unless tracking/history is required.

Order model:

```ts
{
  id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    productName: string;
    packageWeight: string;
    packagePrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  customerName: string;
  phone: string;
  address: string;
  deliveryZone: string;
  deliveryCharge: number;
  paymentMethod: "cod" | "bkash" | "nagad" | "bank";
  paymentStatus: "unpaid" | "advance_paid" | "paid" | "refunded";
  orderStatus: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  subtotal: number;
  total: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Deployment:

- Deploy Next.js to Vercel or Firebase App Hosting depending on preferred operations.
- Use Firebase project for Auth/Firestore/Storage.
- Configure production environment variables in deployment platform.
- Deploy Firestore and Storage rules as part of release checklist.
- Use `www.premiumharvestbd.com` as canonical domain.

Scalability:

- Start with direct order workflow for mango season.
- Add cart only if multi-product purchasing becomes important.
- Separate product packages/prices cleanly so admin can update seasonal pricing without code changes.
- Add indexes for order date/status and product publish/sort fields.

## Recommended development roadmap

### Phase 0: Safety cleanup and audit fixes

- Goal: Make current project reliable enough to continue.
- Tasks: Fix lint script, fix Firebase Admin private key formatting, harden Firestore admin rules, configure Firebase Storage image domains, remove misleading demo success paths for production.
- Files likely affected: `package.json`, `.env.local`, `firestore.rules`, `next.config.ts`, `actions/contacts.ts`, `lib/data.ts`.
- Expected result: Build/typecheck/lint pass and real Firebase data can load safely.
- Validation command: `npm run lint`, `npm run typecheck`, `npm run build`.

### Phase 1: Mobile-first UI foundation

- Goal: Polish the storefront for mobile conversion.
- Tasks: Tune header, hero, product cards, sticky CTA, trust/delivery/payment sections, footer policies.
- Files likely affected: `components/layout/*`, `components/sections/*`, `components/shop/*`, `app/page.tsx`, `app/globals.css`.
- Expected result: Mobile homepage/shop/product pages feel production-grade.
- Validation command: `npm run build` plus manual mobile QA.

### Phase 2: Product data model and product pages

- Goal: Replace demo-style product shape with production product/catalog fields.
- Tasks: Add category/variety/origin/publish/preorder/stock/SEO fields, update product pages and admin forms.
- Files likely affected: `types/index.ts`, `lib/data.ts`, `components/admin/product-manager.tsx`, `components/shop/*`, `app/shop/[slug]/page.tsx`.
- Expected result: Admin-managed products support mango package pricing and SEO.
- Validation command: `npm run typecheck`, `npm run build`.

### Phase 3: Cart and checkout

- Goal: Decide and implement production order flow.
- Tasks: Either build single-product direct checkout or cart + checkout; add delivery/payment fields, confirmation page, order number.
- Files likely affected: `components/forms/order-form.tsx`, `actions/orders.ts`, `app/checkout/*`, `app/cart/*`, `types/index.ts`.
- Expected result: Customers can place complete production-ready orders.
- Validation command: `npm run typecheck`, `npm run build`, test Firestore order creation.

### Phase 4: Backend/database integration

- Goal: Make Firebase the real source of truth.
- Tasks: Define Firestore collections/indexes, deploy rules, add seed/initial admin process, remove unsafe fallbacks from production.
- Files likely affected: `firebase/*`, `lib/data.ts`, `firestore.rules`, `storage.rules`.
- Expected result: Public site and admin dashboard consistently read/write production data.
- Validation command: Firebase rules test/deploy checks plus `npm run build`.

### Phase 5: Admin authentication

- Goal: Secure admin access.
- Tasks: Verify `admins/{uid}` role in UI and rules, restrict reads/writes, add logout/session handling, handle non-admin users.
- Files likely affected: `hooks/use-auth.tsx`, `components/admin/auth-guard.tsx`, `firestore.rules`, `storage.rules`.
- Expected result: Only approved admins can access dashboard data and writes.
- Validation command: manual auth QA with admin and non-admin users.

### Phase 6: Admin product management

- Goal: Make products fully manageable from admin.
- Tasks: Add categories, publish/draft, image ordering/deletion, slug uniqueness, richer package/pricing form.
- Files likely affected: `components/admin/product-manager.tsx`, `types/index.ts`, `lib/validations.ts`.
- Expected result: No code changes needed for regular product updates.
- Validation command: create/edit/delete product QA plus `npm run typecheck`.

### Phase 7: Order management

- Goal: Make admin order operations practical.
- Tasks: Add order detail view, filtering, payment status, delivery status, search, print/export.
- Files likely affected: `components/admin/orders-manager.tsx`, `app/dashboard/orders/*`, `types/index.ts`.
- Expected result: Admin can process real orders confidently.
- Validation command: create sample order, update statuses, verify Firestore.

### Phase 8: Payment/delivery workflow

- Goal: Support Bangladesh delivery/payment reality.
- Tasks: Add delivery zones, delivery charges, COD/advance payment, bKash/Nagad references, payment verification.
- Files likely affected: order form/actions, dashboard orders, settings collection.
- Expected result: Order data contains everything needed to fulfill and verify orders.
- Validation command: end-to-end order placement and admin verification.

### Phase 9: SEO and production polish

- Goal: Prepare for launch and search visibility.
- Tasks: Final metadata, product schema, canonical URLs, sitemap, robots, policy pages, real OG image, alt text, performance pass.
- Files likely affected: `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, product pages, policy routes.
- Expected result: Search/social sharing and compliance basics are ready.
- Validation command: `npm run build`, Lighthouse/manual SEO checks.

### Phase 10: Deployment and final QA

- Goal: Launch safely.
- Tasks: Configure environment variables, domain, Firebase rules, deployment platform, smoke tests, mobile QA, order test, admin test.
- Files likely affected: deployment settings, `.env.example`, Firebase config/rules.
- Expected result: Production-ready Premium Harvest site at `www.premiumharvestbd.com`.
- Validation command: production smoke test checklist.

## Immediate next steps

1. Fix the broken lint script for Next.js 16.
2. Fix Firebase Admin private key formatting in deployment/local environment.
3. Harden Firestore rules so admin access checks `admins/{uid}`.
4. Add Firebase Storage remote image domain to `next.config.ts`.
5. Decide direct order flow vs cart/checkout for the first production release.
6. Expand the product/order data models before doing major UI/admin work.
7. Replace placeholder images/social links/content with real Premium Harvest assets and business details.

## Validation result

Requested report created: `PREMIUM_HARVEST_PROJECT_STATUS.md`.

No app rewrite, UI redesign, backend migration, package installation, or file deletion was performed.

