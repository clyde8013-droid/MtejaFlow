-- =========================================================
-- 0007_touch_updated_at.sql
-- Generic trigger that keeps updated_at current on every UPDATE.
-- =========================================================

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_businesses_updated_at
  before update on businesses
  for each row execute function touch_updated_at();

create trigger trg_customers_updated_at
  before update on customers
  for each row execute function touch_updated_at();

create trigger trg_quotes_updated_at
  before update on quotes
  for each row execute function touch_updated_at();

create trigger trg_invoices_updated_at
  before update on invoices
  for each row execute function touch_updated_at();

create trigger trg_ai_conversations_updated_at
  before update on ai_conversations
  for each row execute function touch_updated_at();
