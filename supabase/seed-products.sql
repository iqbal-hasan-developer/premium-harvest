begin;

delete from public.gallery
where id in (
  '90000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000002',
  '90000000-0000-0000-0000-000000000003'
);

delete from public.products
where slug in ('gobindobhog-mango', 'himsagar-mango', 'langra-mango');

delete from public.categories
where slug = 'premium-mango';

insert into public.categories (id, name, slug, description, sort_order, is_active)
values (
  '10000000-0000-0000-0000-000000000001',
  'Premium Mango',
  'premium-mango',
  'Premium Harvest seasonal mango collection.',
  1,
  true
);

insert into public.products (
  id,
  category_id,
  name,
  slug,
  short_description,
  description,
  base_price,
  stock_quantity,
  featured,
  published,
  is_active,
  sort_order
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Gobindobhog Mango',
    'gobindobhog-mango',
    'Sweet, aromatic early-season premium mango.',
    'Selected Gobindobhog mangoes collected from trusted orchards and packed safely for delivery.',
    540,
    80,
    true,
    true,
    true,
    1
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Himsagar Mango',
    'himsagar-mango',
    'Rich sweetness with smooth, low-fiber texture.',
    'Premium grade Himsagar mangoes selected for color, aroma, and natural ripeness.',
    620,
    64,
    true,
    true,
    true,
    2
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'Langra Mango',
    'langra-mango',
    'Classic mango flavor with strong aroma.',
    'Naturally cared Langra mangoes with fast delivery support across Bangladesh.',
    580,
    100,
    true,
    true,
    true,
    3
  );

insert into public.product_packages (product_id, weight, price, recommended, is_active, sort_order)
values
  ('20000000-0000-0000-0000-000000000001', '5 kg', 540, false, true, 1),
  ('20000000-0000-0000-0000-000000000001', '10 kg', 850, true, true, 2),
  ('20000000-0000-0000-0000-000000000001', '20 kg', 1600, false, true, 3),
  ('20000000-0000-0000-0000-000000000002', '5 kg', 620, false, true, 1),
  ('20000000-0000-0000-0000-000000000002', '10 kg', 980, true, true, 2),
  ('20000000-0000-0000-0000-000000000002', '20 kg', 1880, false, true, 3),
  ('20000000-0000-0000-0000-000000000003', '5 kg', 580, false, true, 1),
  ('20000000-0000-0000-0000-000000000003', '10 kg', 920, true, true, 2),
  ('20000000-0000-0000-0000-000000000003', '20 kg', 1760, false, true, 3);

insert into public.product_images (product_id, image_url, alt_text, is_primary, is_active, sort_order)
values
  ('20000000-0000-0000-0000-000000000001', '/shop-banner.webp', 'Premium mango arrangement', true, true, 1),
  ('20000000-0000-0000-0000-000000000002', '/hero-banner.webp', 'Fresh mango basket', true, true, 1),
  ('20000000-0000-0000-0000-000000000003', '/gallery-banner.webp', 'Mango orchard and basket', true, true, 1);

insert into public.gallery (id, title, image_url, alt_text, height, published, sort_order)
values
  (
    '90000000-0000-0000-0000-000000000001',
    'Premium mango shop banner',
    '/shop-banner.webp',
    'Premium mango banner',
    'medium',
    true,
    1
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    'Mango orchard gallery',
    '/gallery-banner.webp',
    'Mango orchard gallery banner',
    'tall',
    true,
    2
  ),
  (
    '90000000-0000-0000-0000-000000000003',
    'Premium Harvest story',
    '/about-banner.webp',
    'Premium Harvest orchard story',
    'medium',
    true,
    3
  );

commit;
