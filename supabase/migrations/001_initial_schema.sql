create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  sku text unique not null,
  name text not null,
  name_ar text,
  collection text not null check (collection in ('gold', 'silver', 'gems')),
  category text not null,
  material text not null,
  gender text not null default 'Both' check (gender in ('Her', 'Him', 'Both')),
  price numeric(12, 2) not null default 1,
  weight text not null default '',
  making_fee numeric(12, 2) not null default 0,
  badge text,
  art text,
  image text,
  description text,
  description_ar text,
  in_stock boolean not null default true,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  status text not null default 'new',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  city text not null,
  address text not null,
  payment_method text not null,
  notes text,
  subtotal numeric(12, 2) not null default 0,
  shipping numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  deposit_due numeric(12, 2) not null default 0,
  balance_due numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  name text not null,
  quantity integer not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.metal_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  gold24_jod_gram numeric(12, 4),
  silver_jod_gram numeric(12, 4),
  xau_usd_oz numeric(12, 4),
  xau_usd_raw_oz numeric(12, 4),
  xag_usd_oz numeric(12, 4),
  xau_source text,
  xag_source text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.metal_price_snapshots enable row level security;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
on public.products for select
using (true);

drop policy if exists "Orders are service-role managed" on public.orders;
create policy "Orders are service-role managed"
on public.orders for all
using (false)
with check (false);

drop policy if exists "Order items are service-role managed" on public.order_items;
create policy "Order items are service-role managed"
on public.order_items for all
using (false)
with check (false);

drop policy if exists "Metal snapshots are publicly readable" on public.metal_price_snapshots;
create policy "Metal snapshots are publicly readable"
on public.metal_price_snapshots for select
using (true);
