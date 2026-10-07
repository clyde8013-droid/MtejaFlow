import { supabaseAdmin } from '../../supabaseAdmin.js';

/**
 * Sums paid invoices within an optional date range.
 * Defaults to the current calendar month.
 */
export async function getRevenue(businessId, { from, to } = {}) {
  const now = new Date();
  const rangeFrom = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeTo = to ? new Date(to) : now;

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('total, created_at, status')
    .eq('business_id', businessId)
    .eq('status', 'paid')
    .gte('created_at', rangeFrom.toISOString())
    .lte('created_at', rangeTo.toISOString());

  if (error) throw new Error(`getRevenue failed: ${error.message}`);

  const total = data.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  return { total, invoiceCount: data.length, from: rangeFrom.toISOString(), to: rangeTo.toISOString() };
}
