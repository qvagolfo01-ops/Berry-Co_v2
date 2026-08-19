-- ==========================================================
-- BerryCo Supabase schema for the app's database-backed features
-- ==========================================================

create extension if not exists "pgcrypto";

-- 1) profiles: customer + admin profiles linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('super_admin','admin','staff','customer')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);

-- 2) categories: flat categories table to support three-level nesting
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  level smallint not null check (level in (0,1,2)),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create index if not exists categories_parent_idx on public.categories(parent_id);
create index if not exists categories_level_idx on public.categories(level);
create index if not exists categories_name_idx on public.categories(name);

-- 3) products: catalog and stock data used by admin dashboard and storefront
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  price numeric(12,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  category_id uuid references public.categories(id) on delete set null,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_stock_idx on public.products(stock);
create index if not exists products_name_idx on public.products(name);

-- 4) orders: core order records used by admin order pages and reports
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text,
  total_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','refunded')),
  shipping_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- 5) order_items: line items for each order
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);

-- 6) order_refunds: refund journal entries for order credits/refunds
create table if not exists public.order_refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  reason text,
  created_at timestamptz not null default now()
);

alter table public.order_refunds enable row level security;

create index if not exists order_refunds_order_idx on public.order_refunds(order_id);

-- 7) carts + wishlist tables for the storefront data layer
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.carts enable row level security;

create index if not exists carts_user_idx on public.carts(user_id);
create index if not exists carts_session_idx on public.carts(session_token);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unit_price_snapshot numeric(12,2) not null check (unit_price_snapshot >= 0),
  added_at timestamptz not null default now()
);

alter table public.cart_items enable row level security;

create index if not exists cart_items_cart_idx on public.cart_items(cart_id);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.wishlists enable row level security;

create index if not exists wishlists_user_idx on public.wishlists(user_id);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.wishlist_items enable row level security;

create index if not exists wishlist_items_wishlist_idx on public.wishlist_items(wishlist_id);

-- ==========================================================
-- Trigger: when a user signs up in auth.users, create a matching row
-- in public.profiles. This supports the admin account flows used by
-- the app and keeps profile access consistent.
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url, role, status, created_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    'active',
    now()
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    role = coalesce(excluded.role, public.profiles.role),
    status = coalesce(excluded.status, public.profiles.status);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ==========================================================
-- Helper: update timestamp at every product/order change
-- ==========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

create trigger orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

-- ==========================================================
-- Row Level Security policies
-- ==========================================================

-- profiles
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
)
with check (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

-- categories
create policy "categories_read_all"
on public.categories
for select
using (true);

create policy "categories_admin_write"
on public.categories
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

-- products
create policy "products_read_all"
on public.products
for select
using (true);

create policy "products_admin_write"
on public.products
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

-- orders
create policy "orders_select_own_or_admin"
on public.orders
for select
using (
  auth.uid() = customer_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

create policy "orders_modify_admin"
on public.orders
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

-- order_items
create policy "order_items_select_own_or_admin"
on public.order_items
for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (
        o.customer_id = auth.uid()
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
        )
      )
  )
);

create policy "order_items_modify_admin"
on public.order_items
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

-- order_refunds
create policy "order_refunds_select_own_or_admin"
on public.order_refunds
for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_refunds.order_id
      and (
        o.customer_id = auth.uid()
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
        )
      )
  )
);

create policy "order_refunds_modify_admin"
on public.order_refunds
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

-- carts and wishlist default to owner access, and admins can manage too
create policy "carts_select_own_or_admin"
on public.carts
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

create policy "carts_manage_own_or_admin"
on public.carts
for all
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

create policy "cart_items_select_own_or_admin"
on public.cart_items
for select
using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
      ))
  )
);

create policy "cart_items_manage_own_or_admin"
on public.cart_items
for all
using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
      ))
  )
)
with check (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
      ))
  )
);

create policy "wishlists_select_own_or_admin"
on public.wishlists
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

create policy "wishlists_manage_own_or_admin"
on public.wishlists
for all
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
  )
);

create policy "wishlist_items_select_own_or_admin"
on public.wishlist_items
for select
using (
  exists (
    select 1 from public.wishlists w
    where w.id = wishlist_items.wishlist_id
      and (w.user_id = auth.uid() or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
      ))
  )
);

create policy "wishlist_items_manage_own_or_admin"
on public.wishlist_items
for all
using (
  exists (
    select 1 from public.wishlists w
    where w.id = wishlist_items.wishlist_id
      and (w.user_id = auth.uid() or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
      ))
  )
)
with check (
  exists (
    select 1 from public.wishlists w
    where w.id = wishlist_items.wishlist_id
      and (w.user_id = auth.uid() or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('super_admin','admin','staff')
      ))
  )
);

-- ==========================================================
-- Example seed rows to give the dashboard a working catalog
-- ==========================================================
insert into public.categories (id, name, slug, parent_id, level)
values
  (gen_random_uuid(), 'Gaming', 'gaming', null, 0),
  (gen_random_uuid(), 'Accessories', 'accessories', null, 0)
on conflict do nothing;

-- This seed is intentionally minimal; add more rows from the admin UI.
