import { supabaseAdmin } from '../../supabaseAdmin.js';

export async function getQuotes(businessId, { status, limit = 50 } = {}) {
  let query = supabaseAdmin
    .from('quotes')
    .select('id, quote_number, customer_id, status, total, expires_at, created_at, customers(full_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(`getQuotes failed: ${error.message}`);
  return data;
}
