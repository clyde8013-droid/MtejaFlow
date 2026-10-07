-- =========================================================
-- 0005_followups_notifications.sql
-- =========================================================

create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  related_type text check (related_type in ('quote', 'invoice', 'general')),
  related_id uuid,
  type text not null default 'general'
    check (type in ('quote_followup', 'payment_reminder', 'check_in', 'sales_followup', 'general')),
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'cancelled')),
  notes text,
  -- Reserved for later channel integrations (whatsapp/email); null for MVP.
  channel text check (channel in ('in_app', 'whatsapp', 'email')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_followups_business on follow_ups(business_id);
create index if not exists idx_followups_due on follow_ups(business_id, status, due_at);
create index if not exists idx_followups_customer on follow_ups(customer_id);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_business on notifications(business_id);
create index if not exists idx_notifications_user_unread on notifications(user_id) where read_at is null;

alter table follow_ups enable row level security;
alter table notifications enable row level security;

create policy "followups_all_own_business" on follow_ups
  for all using (is_business_member(business_id))
  with check (is_business_member(business_id));

-- Notifications are business-scoped but personal: a member can only see
-- notifications addressed to them (user_id) within their business.
create policy "notifications_select_own" on notifications
  for select using (is_business_member(business_id) and user_id = auth.uid());

create policy "notifications_update_own" on notifications
  for update using (is_business_member(business_id) and user_id = auth.uid());

create policy "notifications_insert_own_business" on notifications
  for insert with check (is_business_member(business_id));
