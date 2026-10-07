import { supabase } from './supabaseClient';

export async function listQuotes(businessId, { search = '', status = 'all' } = {}) {
  let query = supabase
    .from('quotes')
    .select('id, quote_number, status, total, currency, expires_at, created_at, customers(id, full_name, company)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    return data.filter(
      (q) =>
        q.quote_number.toLowerCase().includes(term) ||
        q.customers?.full_name?.toLowerCase().includes(term) ||
        q.customers?.company?.toLowerCase().includes(term)
    );
  }
  return data;
}

export async function listQuotesForCustomer(businessId, customerId) {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, quote_number, status, total, currency, expires_at, created_at')
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getQuote(businessId, quoteId) {
  const { data: quote, error } = await supabase
    .from('quotes')
    .select('*, customers(id, full_name, company, phone, email)')
    .eq('business_id', businessId)
    .eq('id', quoteId)
    .single();
  if (error) throw error;

  const { data: items, error: itemsError } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quoteId)
    .order('sort_order', { ascending: true });
  if (itemsError) throw itemsError;

  return { ...quote, items };
}

/**
 * Generates the next sequential quote number for the business.
 * Simple count-based approach — acceptable for MVP single-user-at-a-time
 * usage. A concurrent-safe version would use a Postgres sequence or the
 * create_business_with_owner-style RPC pattern if this becomes a race
 * condition in practice.
 */
async function getNextQuoteNumber(businessId) {
  const { count, error } = await supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId);
  if (error) throw error;
  return `Q-${String((count || 0) + 1).padStart(4, '0')}`;
}

function computeTotals(items, discount, tax) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  const total = subtotal - Number(discount || 0) + Number(tax || 0);
  return { subtotal, total };
}

/** Creates a quote and its line items together. */
export async function createQuote(businessId, { customerId, currency, notes, expiresAt, discount, tax, items, status = 'draft' }, createdBy) {
  const quoteNumber = await getNextQuoteNumber(businessId);
  const { subtotal, total } = computeTotals(items, discount, tax);

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      quote_number: quoteNumber,
      status,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      total,
      currency,
      notes,
      expires_at: expiresAt || null,
      created_by: createdBy,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;

  await insertItems(businessId, quote.id, items);
  return quote;
}

/** Updates a quote's fields and fully replaces its line items. */
export async function updateQuote(businessId, quoteId, { customerId, currency, notes, expiresAt, discount, tax, items, status }) {
  const { subtotal, total } = computeTotals(items, discount, tax);

  const patch = {
    customer_id: customerId,
    subtotal,
    discount: discount || 0,
    tax: tax || 0,
    total,
    currency,
    notes,
    expires_at: expiresAt || null,
  };
  if (status) patch.status = status;
  if (status === 'sent') patch.sent_at = new Date().toISOString();

  const { data: quote, error } = await supabase
    .from('quotes')
    .update(patch)
    .eq('business_id', businessId)
    .eq('id', quoteId)
    .select()
    .single();
  if (error) throw error;

  const { error: deleteError } = await supabase.from('quote_items').delete().eq('quote_id', quoteId);
  if (deleteError) throw deleteError;
  await insertItems(businessId, quoteId, items);

  return quote;
}

async function insertItems(businessId, quoteId, items) {
  const rows = items.map((item, index) => ({
    quote_id: quoteId,
    business_id: businessId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: Number(item.quantity) * Number(item.unit_price),
    sort_order: index,
  }));
  const { error } = await supabase.from('quote_items').insert(rows);
  if (error) throw error;
}

export async function updateQuoteStatus(businessId, quoteId, status) {
  const patch = { status };
  if (status === 'sent') patch.sent_at = new Date().toISOString();
  if (status === 'viewed') patch.viewed_at = new Date().toISOString();
  if (status === 'accepted' || status === 'rejected') patch.responded_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('quotes')
    .update(patch)
    .eq('business_id', businessId)
    .eq('id', quoteId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Only draft quotes can be deleted outright — anything sent has real history. */
export async function deleteDraftQuote(businessId, quoteId) {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('business_id', businessId)
    .eq('id', quoteId)
    .eq('status', 'draft');
  if (error) throw error;
}
