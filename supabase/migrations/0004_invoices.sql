-- =========================================================
-- 0004_invoices.sql
-- =========================================================

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  quote_id uuid references quotes(id) on delete set null,
  invoice_number text not null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'partially_paid', 'paid', 'overdue')),
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  amount_paid numeric(14,2) not null default 0,
  currency text not null default 'TZS',
  notes text,
  due_date date,
  sent_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, invoice_number)
);

create index if not exists idx_invoices_business on invoices(business_id);
create index if not exists idx_invoices_customer on invoices(customer_id);
create index if not exists idx_invoices_status on invoices(business_id, status);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0,
  sort_order int not null default 0
);

create index if not exists idx_invoice_items_invoice on invoice_items(invoice_id);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  amount numeric(14,2) not null,
  method text not null default 'other' check (method in ('cash', 'bank_transfer', 'mobile_money', 'card', 'other')),
  paid_at timestamptz not null default now(),
  recorded_by uuid references auth.users(id),
  notes text
);

create index if not exists idx_payments_invoice on payments(invoice_id);

alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;

create policy "invoices_all_own_business" on invoices
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));

create policy "invoice_items_all_own_business" on invoice_items
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));

create policy "payments_all_own_business" on payments
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));
