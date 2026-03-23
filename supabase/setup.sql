-- ═══════════════════════════════════════════════════════════════
-- DermIQ Supabase Setup Script
-- Paste this into: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

-- ── 1. VENDORS TABLE ────────────────────────────────────────────
create table if not exists dermiq_vendors (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  brand_name text not null,
  tagline text,
  story text,
  website text,
  instagram text,
  founded text,
  verified boolean default false,
  kyc_status text default 'pending',   -- pending | verified | rejected
  gst text,
  pan text,
  bank_holder text,
  bank_account text,
  bank_ifsc text,
  bank_name text,
  upi text,
  created_at timestamptz default now()
);

-- ── 2. PRODUCTS TABLE ───────────────────────────────────────────
create table if not exists dermiq_products (
  id bigserial primary key,
  vendor_email text references dermiq_vendors(email) on delete cascade,
  name text not null,
  category text not null,
  price numeric not null,
  mrp numeric not null,
  stock integer default 0,
  rating numeric default 0,
  active boolean default true,
  emoji text default '✨',
  image text,
  size text,
  description text,
  concerns text[] default '{}',   -- AI mapping: skin concerns
  skin_types text[] default '{}',
  ingredients text[] default '{}',
  how_to_use text,
  benefits text[] default '{}',
  badge text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── 3. ORDERS TABLE ─────────────────────────────────────────────
create table if not exists dermiq_orders (
  id text primary key default ('ORD-' || floor(random()*90000+10000)::text),
  vendor_email text references dermiq_vendors(email) on delete cascade,
  product_id bigint references dermiq_products(id) on delete set null,
  product_name text not null,
  customer_name text not null,
  customer_email text,
  customer_address text,
  qty integer not null default 1,
  amount numeric not null,
  status text default 'new',   -- new | processing | shipped | delivered | cancelled
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── 4. COUPONS TABLE ────────────────────────────────────────────
create table if not exists dermiq_coupons (
  id bigserial primary key,
  vendor_email text references dermiq_vendors(email) on delete cascade,
  code text not null,
  type text not null default 'percent',   -- percent | flat
  value numeric not null,
  min_order numeric default 0,
  uses integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- ── 5. REVIEWS TABLE ────────────────────────────────────────────
create table if not exists dermiq_reviews (
  id bigserial primary key,
  product_id bigint references dermiq_products(id) on delete cascade,
  vendor_email text,
  customer_name text not null,
  customer_email text,
  rating integer check (rating between 1 and 5),
  comment text,
  reply text,
  verified boolean default false,
  helpful integer default 0,
  created_at timestamptz default now()
);

-- ── 6. ROW LEVEL SECURITY ────────────────────────────────────────
-- Allow authenticated vendors to read/write only their own data
alter table dermiq_vendors enable row level security;
alter table dermiq_products enable row level security;
alter table dermiq_orders enable row level security;
alter table dermiq_coupons enable row level security;
alter table dermiq_reviews enable row level security;

-- Vendors: only see own row
create policy "vendor_own" on dermiq_vendors
  for all using (auth.email() = email);

-- Products: vendor sees own products; public can read active ones
create policy "vendor_products_own" on dermiq_products
  for all using (auth.email() = vendor_email);

create policy "public_read_active_products" on dermiq_products
  for select using (active = true);

-- Orders: vendor sees own orders
create policy "vendor_orders_own" on dermiq_orders
  for all using (auth.email() = vendor_email);

-- Coupons: vendor manages own coupons
create policy "vendor_coupons_own" on dermiq_coupons
  for all using (auth.email() = vendor_email);

-- Reviews: public can read; vendor can update reply field
create policy "public_read_reviews" on dermiq_reviews
  for select using (true);

create policy "vendor_reply_reviews" on dermiq_reviews
  for update using (auth.email() = vendor_email);

-- ── 7. SEED: Demo Vendor ─────────────────────────────────────────
-- Run this AFTER creating a user in Auth → Users with email: vendor@minimalist.in
insert into dermiq_vendors (email, brand_name, tagline, verified, kyc_status)
values (
  'vendor@minimalist.in',
  'The Minimalist',
  'Science-backed skincare for everyone',
  true,
  'verified'
) on conflict (email) do update set brand_name = excluded.brand_name;

-- ── 8. SEED: Demo Products ───────────────────────────────────────
insert into dermiq_products (vendor_email, name, category, price, mrp, stock, rating, active, emoji, size, description, concerns, skin_types, badge)
values
(
  'vendor@minimalist.in', '10% Niacinamide + Zinc Serum', 'Serum',
  399, 699, 142, 4.6, true, '✨', '30ml',
  'Controls sebum production, minimises pore appearance, and reduces blemishes.',
  ARRAY['Acne & Breakouts','Oily Skin','Pigmentation & Dark Spots'],
  ARRAY['Oily','Combination','Normal'],
  'Bestseller'
),
(
  'vendor@minimalist.in', 'Moisturizing Face Cream SPF 50', 'Moisturiser',
  549, 849, 8, 4.4, true, '☀️', '50g',
  'Lightweight daily moisturiser with broad-spectrum SPF 50 protection.',
  ARRAY['Dryness & Dehydration','Aging & Fine Lines'],
  ARRAY['All Skin Types'],
  null
),
(
  'vendor@minimalist.in', 'AHA BHA 25% Peeling Solution', 'Treatment',
  649, 999, 56, 4.7, true, '🔬', '30ml',
  'Exfoliating peel to resurface and brighten skin texture.',
  ARRAY['Dullness','Uneven Texture','Pores'],
  ARRAY['Normal','Combination','Oily'],
  'New'
),
(
  'vendor@minimalist.in', 'Hyaluronic Acid 2% + B5 Serum', 'Serum',
  299, 499, 210, 4.5, true, '💧', '30ml',
  'Multi-depth hydration serum for plump, bouncy skin.',
  ARRAY['Dryness & Dehydration','Aging & Fine Lines'],
  ARRAY['All Skin Types'],
  null
)
on conflict do nothing;
