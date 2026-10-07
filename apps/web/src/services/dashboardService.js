import { supabase } from './supabaseClient';

/**
 * Pulls the most recent handful of records across customers, quotes,
 * invoices, and completed follow-ups, and merges them into a single
 * chronological activity feed. Simple client-side merge — fine at MVP
 * scale; a dedicated activity_log table would be the move if this needs
 * to scale to thousands of events or support pagination later.
 */
export async function getRecentActivity(businessId, limit = 8) {
  const [customersRes, quotesRes, invoicesRes, followUpsRes] = await Promise.all([
    supabase
      .from('customers')
      .select('id, full_name, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('quotes')
      .select('id, quote_number, status, created_at, customers(full_name)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('invoices')
      .select('id, invoice_number, status, created_at, customers(full_name)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('follow_ups')
      .select('id, type, status, completed_at, customers(full_name)')
      .eq('business_id', businessId)
      .eq('status', 'done')
      .order('completed_at', { ascending: false })
      .limit(limit),
  ]);

  const events = [
    ...(customersRes.data || []).map((c) => ({
      id: `customer-${c.id}`,
      type: 'customer',
      timestamp: c.created_at,
      text: `${c.full_name} added as a customer`,
    })),
    ...(quotesRes.data || []).map((q) => ({
      id: `quote-${q.id}`,
      type: 'quote',
      timestamp: q.created_at,
      text: `Quote ${q.quote_number} ${q.status === 'draft' ? 'created' : q.status} for ${q.customers?.full_name || 'a customer'}`,
      link: `/app/quotes/${q.id}`,
    })),
    ...(invoicesRes.data || []).map((inv) => ({
      id: `invoice-${inv.id}`,
      type: 'invoice',
      timestamp: inv.created_at,
      text: `Invoice ${inv.invoice_number} ${inv.status === 'draft' ? 'created' : inv.status.replace('_', ' ')} for ${inv.customers?.full_name || 'a customer'}`,
      link: `/app/invoices/${inv.id}`,
    })),
    ...(followUpsRes.data || []).map((f) => ({
      id: `followup-${f.id}`,
      type: 'followup',
      timestamp: f.completed_at,
      text: `Follow-up with ${f.customers?.full_name || 'a customer'} completed`,
    })),
  ];

  return events
    .filter((e) => e.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}
