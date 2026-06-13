create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'owner')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  base_price numeric(10, 2) not null default 0 check (base_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  featured boolean not null default false,
  published boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_packages (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text,
  weight text not null,
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sort_order integer not null default 0,
  recommended boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  alt_text text,
  height text not null default 'medium' check (height in ('short', 'medium', 'tall')),
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  note text,
  source text not null default 'web',
  subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
  delivery_charge numeric(10, 2) not null default 0 check (delivery_charge >= 0),
  discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0),
  total numeric(10, 2) not null default 0 check (total >= 0),
  payment_method text not null default 'cod',
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_package_id uuid references public.product_packages(id) on delete set null,
  product_slug text,
  product_name text not null,
  image_url text,
  package_weight text,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_users_lookup on public.admin_users (id, is_active);
create index if not exists idx_admin_users_email on public.admin_users (email);
create index if not exists idx_categories_slug on public.categories (slug);
create index if not exists idx_categories_active on public.categories (is_active, sort_order);
create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_published on public.products (published, is_active, sort_order) where published = true and is_active = true;
create index if not exists idx_products_featured on public.products (featured, published, is_active, sort_order) where featured = true and published = true and is_active = true;
create index if not exists idx_product_packages_product_active on public.product_packages (product_id, is_active, sort_order);
create index if not exists idx_product_images_product_active on public.product_images (product_id, is_active, sort_order);
create index if not exists idx_gallery_published on public.gallery (published, sort_order) where published = true;
create index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_contact_messages_created_at on public.contact_messages (created_at desc);

drop trigger if exists set_admin_users_updated_at on public.admin_users;
create trigger set_admin_users_updated_at before update on public.admin_users for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();

drop trigger if exists set_product_packages_updated_at on public.product_packages;
create trigger set_product_packages_updated_at before update on public.product_packages for each row execute function public.set_updated_at();

drop trigger if exists set_product_images_updated_at on public.product_images;
create trigger set_product_images_updated_at before update on public.product_images for each row execute function public.set_updated_at();

drop trigger if exists set_gallery_updated_at on public.gallery;
create trigger set_gallery_updated_at before update on public.gallery for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at before update on public.contact_messages for each row execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and is_active = true
  );
$$;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_packages enable row level security;
alter table public.product_images enable row level security;
alter table public.gallery enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "admin users can manage admin users" on public.admin_users;
create policy "admin users can manage admin users"
on public.admin_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public can read active categories" on public.categories;
create policy "public can read active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "admins can manage categories" on public.categories;
create policy "admins can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public can read published products" on public.products;
create policy "public can read published products"
on public.products
for select
to anon, authenticated
using (published = true and is_active = true);

drop policy if exists "admins can manage products" on public.products;
create policy "admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public can read active packages for published products" on public.product_packages;
create policy "public can read active packages for published products"
on public.product_packages
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.products
    where products.id = product_packages.product_id
      and products.published = true
      and products.is_active = true
  )
);

drop policy if exists "admins can manage product packages" on public.product_packages;
create policy "admins can manage product packages"
on public.product_packages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public can read active images for published products" on public.product_images;
create policy "public can read active images for published products"
on public.product_images
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.published = true
      and products.is_active = true
  )
);

drop policy if exists "admins can manage product images" on public.product_images;
create policy "admins can manage product images"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public can read published gallery" on public.gallery;
create policy "public can read published gallery"
on public.gallery
for select
to anon, authenticated
using (published = true);

drop policy if exists "admins can manage gallery" on public.gallery;
create policy "admins can manage gallery"
on public.gallery
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can manage orders" on public.orders;
create policy "admins can manage orders"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can manage order items" on public.order_items;
create policy "admins can manage order items"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can manage contact messages" on public.contact_messages;
create policy "admins can manage contact messages"
on public.contact_messages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can manage site settings" on public.site_settings;
create policy "admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
