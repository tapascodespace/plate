-- Plate Supabase migration scaffold (cutover-ready)
-- Core auth-backed tables with RLS policies for onboarding/building flows.

create table if not exists buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  pincode text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  building_id uuid references buildings(id),
  flat_number text,
  floor_number int,
  bio text,
  onboarding_completed boolean default false,
  is_cook boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table buildings enable row level security;
alter table profiles enable row level security;

drop policy if exists "profiles_select_same_building" on profiles;
create policy "profiles_select_same_building"
on profiles
for select
using (
  building_id is not null
  and building_id = (
    select building_id from profiles where id = auth.uid()
  )
);

drop policy if exists "profiles_insert_self" on profiles;
create policy "profiles_insert_self"
on profiles
for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self"
on profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "buildings_select_own" on buildings;
create policy "buildings_select_own"
on buildings
for select
using (
  id in (
    select building_id from profiles where id = auth.uid()
  )
);

drop policy if exists "buildings_insert_auth" on buildings;
create policy "buildings_insert_auth"
on buildings
for insert
to authenticated
with check (true);

create table if not exists app_buildings (
  id text primary key,
  name text not null,
  address text not null,
  city text not null,
  pincode text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table if not exists app_profiles (
  id text primary key,
  full_name text,
  email text,
  phone text,
  flat_number text,
  floor_number int,
  bio text,
  building_id text references app_buildings(id),
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists app_cook_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null,
  bio text,
  specialties text,
  neighborhood text,
  city text,
  kitchen text,
  cover_image text,
  accepting_orders boolean default true,
  delivery_radius numeric default 5,
  prep_time_min int default 30,
  rating numeric default 0,
  total_reviews int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists app_dishes (
  id uuid primary key default gen_random_uuid(),
  cook_profile_id uuid references app_cook_profiles(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null,
  image text,
  cuisine text,
  category text,
  prep_time_min int default 30,
  is_vegetarian boolean default false,
  is_vegan boolean default false,
  spice_level int default 0,
  serving_size text,
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists app_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id text not null,
  cook_profile_id uuid references app_cook_profiles(id) on delete cascade,
  status text not null default 'PENDING',
  subtotal numeric not null,
  delivery_fee numeric not null default 0,
  total numeric not null,
  delivery_address text,
  delivery_notes text,
  confirmed_at timestamptz,
  prepared_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists app_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references app_orders(id) on delete cascade,
  dish_id uuid references app_dishes(id),
  quantity int not null,
  price numeric not null,
  notes text
);

create table if not exists app_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references app_orders(id) on delete cascade,
  user_id text not null,
  rating int not null,
  comment text,
  created_at timestamptz default now()
);

alter table app_buildings enable row level security;
alter table app_profiles enable row level security;
alter table app_cook_profiles enable row level security;
alter table app_dishes enable row level security;
alter table app_orders enable row level security;
alter table app_order_items enable row level security;
alter table app_reviews enable row level security;

-- Client-side access blocked by default in hybrid mode.
-- Service-role key (server-only) bypasses RLS and performs mirror writes.

drop policy if exists "app_buildings_no_client_access" on app_buildings;
create policy "app_buildings_no_client_access"
on app_buildings
for all
to authenticated, anon
using (false)
with check (false);

drop policy if exists "app_profiles_no_client_access" on app_profiles;
create policy "app_profiles_no_client_access"
on app_profiles
for all
to authenticated, anon
using (false)
with check (false);

drop policy if exists "app_cook_profiles_no_client_access" on app_cook_profiles;
create policy "app_cook_profiles_no_client_access"
on app_cook_profiles
for all
to authenticated, anon
using (false)
with check (false);

drop policy if exists "app_dishes_no_client_access" on app_dishes;
create policy "app_dishes_no_client_access"
on app_dishes
for all
to authenticated, anon
using (false)
with check (false);

drop policy if exists "app_orders_no_client_access" on app_orders;
create policy "app_orders_no_client_access"
on app_orders
for all
to authenticated, anon
using (false)
with check (false);

drop policy if exists "app_order_items_no_client_access" on app_order_items;
create policy "app_order_items_no_client_access"
on app_order_items
for all
to authenticated, anon
using (false)
with check (false);

drop policy if exists "app_reviews_no_client_access" on app_reviews;
create policy "app_reviews_no_client_access"
on app_reviews
for all
to authenticated, anon
using (false)
with check (false);
