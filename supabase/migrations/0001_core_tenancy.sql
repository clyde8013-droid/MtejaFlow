-- =========================================================
-- 0001_core_tenancy.sql
-- Businesses and the membership table that ties users to them.
-- Every other table's RLS policy is built on top of
-- `is_business_member(business_id)` defined at the bottom.
-- =========================================================

create extension if not exists "pgcrypto";

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'other',
  country text not null default 'TZ',
  currency text not null default 'TZS',
  phone text,
  email text,
  logo_url text,
  address text,
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business_members (
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'staff')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create index if not exists idx_business_members_user on business_members(user_id);

-- Helper: is the current authenticated user a member of this business?
-- SECURITY DEFINER + a fixed search_path so it can be safely used inside
-- RLS policies on other tables without those tables needing to expose
-- business_members directly.
create or replace function is_business_member(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from business_members
    where business_id = target_business_id
      and user_id = auth.uid()
  );
$$;

alter table businesses enable row level security;
alter table business_members enable row level security;

-- businesses: a user can see/update only businesses they belong to.
-- INSERT is allowed for any authenticated user (this is how onboarding
-- creates the first business); the row only becomes visible to them
-- once the matching business_members row exists.
create policy "businesses_select_own" on businesses
  for select using (is_business_member(id));

create policy "businesses_insert_authenticated" on businesses
  for insert with check (auth.uid() is not null);

create policy "businesses_update_own" on businesses
  for update using (is_business_member(id));

-- business_members: users can see memberships for businesses they belong to,
-- and can insert their own membership row (used once, right after creating
-- a business during onboarding).
create policy "business_members_select_own" on business_members
  for select using (is_business_member(business_id));

create policy "business_members_insert_self" on business_members
  for insert with check (user_id = auth.uid());
