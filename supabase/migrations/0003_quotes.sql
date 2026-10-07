-- =========================================================
-- 0003_quotes.sql
-- =========================================================

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  quote_number text not null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  currency text not null default 'TZS',
  notes text,
  expires_at date,
  sent_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, quote_number)
);

create index if not exists idx_quotes_business on quotes(business_id);
create index if not exists idx_quotes_customer on quotes(customer_id);
create index if not exists idx_quotes_status on quotes(business_id, status);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0,
  sort_order int not null default 0
);

create index if not exists idx_quote_items_quote on quote_items(quote_id);

alter table quotes enable row level security;
alter table quote_items enable row level security;

create policy "quotes_all_own_business" on quotes
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));

create policy "quote_items_all_own_business" on quote_items
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));
