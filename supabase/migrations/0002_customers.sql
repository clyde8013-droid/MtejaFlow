-- =========================================================
-- 0002_customers.sql
-- =========================================================

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  full_name text not null,
  company text,
  phone text,
  email text,
  address text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  tags text[] not null default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists idx_customers_business on customers(business_id);
create index if not exists idx_customers_status on customers(business_id, status);

create table if not exists customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  author_id uuid references auth.users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_customer_notes_customer on customer_notes(customer_id);

alter table customers enable row level security;
alter table customer_notes enable row level security;

create policy "customers_all_own_business" on customers
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));

create policy "customer_notes_all_own_business" on customer_notes
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));
