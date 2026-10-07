import { supabaseAdmin } from '../../supabaseAdmin.js';

export async function getInvoices(businessId, { status, limit = 50 } = {}) {
  let query = supabaseAdmin
    .from('invoices')
    .select('id, invoice_number, customer_id, status, total, amount_paid, due_date, created_at, customers(full_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(`getInvoices failed: ${error.message}`);
  return data;
}

export async function getOutstandingInvoices(businessId, { limit = 50 } = {}) {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('id, invoice_number, customer_id, status, total, amount_paid, due_date, customers(full_name)')
    .eq('business_id', businessId)
    .in('status', ['sent', 'partially_paid', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`getOutstandingInvoices failed: ${error.message}`);
  return data.map((inv) => ({ ...inv, balance: Number(inv.total) - Number(inv.amount_paid || 0) }));
}
