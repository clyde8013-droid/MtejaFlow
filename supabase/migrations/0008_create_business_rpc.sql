-- =========================================================
-- 0008_create_business_rpc.sql
-- Fixes a chicken-and-egg RLS problem in onboarding: a client-side
-- insert into `businesses` followed by a separate insert into
-- `business_members` means the business row is briefly unreadable
-- (is_business_member() is still false) between the two calls, which
-- breaks any .select() chained onto the first insert.
--
-- This RPC does both inserts in a single, atomic, SECURITY DEFINER
-- transaction, and returns the finished row.
-- =========================================================

create or replace function create_business_with_owner(
  business_name text,
  business_type text,
  business_country text,
  business_currency text,
  business_phone text,
  business_address text,
  business_language text,
  business_email text
)
returns businesses
language plpgsql
security definer
set search_path = public
as $$
declare
  new_business businesses;
begin
  if auth.uid() is null then
    raise exception 'Must be authenticated to create a business.';
  end if;

  insert into businesses (name, type, country, currency, phone, address, preferred_language, email)
  values (business_name, business_type, business_country, business_currency, business_phone, business_address, business_language, business_email)
  returning * into new_business;

  insert into business_members (business_id, user_id, role)
  values (new_business.id, auth.uid(), 'owner');

  return new_business;
end;
$$;

-- Only logged-in users may call this — it enforces auth.uid() internally too.
grant execute on function create_business_with_owner(text, text, text, text, text, text, text, text) to authenticated;
