# Supabase Storage Notes

Recommended buckets for Premium Harvest:

- `products`
- `gallery`
- `banners`

## Recommended Setup

Create these buckets as public buckets because product, gallery, and banner images are meant to be displayed on public storefront pages.

Public read access is acceptable for these image buckets. Upload, update, and delete flows should be built later through admin/server-side code paths that verify the current user is an admin.

Do not use `SUPABASE_SERVICE_ROLE_KEY` in browser upload logic. The service role key bypasses Row Level Security and must remain server-only.

## Later Upload Flow Recommendation

In a later migration phase:

1. Keep admin image uploads behind authenticated admin-only UI.
2. Route uploads through server actions or route handlers.
3. Validate file type, file size, and destination bucket.
4. Store public image URLs in `product_images`, `gallery`, or `site_settings`.
5. Keep bucket naming stable so image URLs remain predictable across production deployments.
