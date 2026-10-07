import { supabase } from './supabaseClient';

export async function listInvoices(businessId, { search = '', status = 'all' } = {}) {
  let query = supabase
    .from('invoices')
    .select('id, invoice_number, status, total, amount_paid, currency, due_date, created_at, customers(id, full_name, company)')
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
      (inv) =>
        inv.invoice_number.toLowerCase().includes(term) ||
        inv.customers?.full_name?.toLowerCase().includes(term) ||
        inv.customers?.company?.toLowerCase().includes(term)
    );
  }
  return data;
}

export async function listInvoicesForCustomer(businessId, customerId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, amount_paid, currency, due_date, created_at')
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getInvoice(businessId, invoiceId) {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, customers(id, full_name, company, phone, email), quotes(id, quote_number)')
    .eq('business_id', businessId)
    .eq('id', invoiceId)
    .single();
  if (error) throw error;

  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('sort_order', { ascending: true });
  if (itemsError) throw itemsError;

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('paid_at', { ascending: false });
  if (paymentsError) throw paymentsError;

  return { ...invoice, items, payments };
}

/** Loads a quote's data shaped for pre-filling the invoice builder. */
export async function getQuoteForConversion(businessId, quoteId) {
  const { data: quote, error } = await supabase
    .from('quotes')
    .select('*, customers(id, full_name, company)')
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

async function getNextInvoiceNumber(businessId) {
  const { count, error } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId);
  if (error) throw error;
  return `INV-${String((count || 0) + 1).padStart(4, '0')}`;
}

function computeTotals(items, discount, tax) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  const total = subtotal - Number(discount || 0) + Number(tax || 0);
  return { subtotal, total };
}

export async function createInvoice(
  businessId,
  { customerId, quoteId, currency, notes, dueDate, discount, tax, items, status = 'draft' },
  createdBy
) {
  const invoiceNumber = await getNextInvoiceNumber(businessId);
  const { subtotal, total } = computeTotals(items, discount, tax);

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      quote_id: quoteId || null,
      invoice_number: invoiceNumber,
      status,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      total,
      amount_paid: 0,
      currency,
      notes,
      due_date: dueDate || null,
      created_by: createdBy,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;

  await insertItems(businessId, invoice.id, items);
  return invoice;
}

export async function updateInvoice(businessId, invoiceId, { customerId, currency, notes, dueDate, discount, tax, items, status }) {
  const { subtotal, total } = computeTotals(items, discount, tax);

  const patch = {
    customer_id: customerId,
    subtotal,
    discount: discount || 0,
    tax: tax || 0,
    total,
    currency,
    notes,
    due_date: dueDate || null,
  };
  if (status) patch.status = status;
  if (status === 'sent') patch.sent_at = new Date().toISOString();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update(patch)
    .eq('business_id', businessId)
    .eq('id', invoiceId)
    .select()
    .single();
  if (error) throw error;

  const { error: deleteError } = await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
  if (deleteError) throw deleteError;
  await insertItems(businessId, invoiceId, items);

  return invoice;
}

async function insertItems(businessId, invoiceId, items) {
  const rows = items.map((item, index) => ({
    invoice_id: invoiceId,
    business_id: businessId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: Number(item.quantity) * Number(item.unit_price),
    sort_order: index,
  }));
  const { error } = await supabase.from('invoice_items').insert(rows);
  if (error) throw error;
}

export async function markInvoiceSent(businessId, invoiceId) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('business_id', businessId)
    .eq('id', invoiceId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Records a payment against an invoice and updates amount_paid + status
 * accordingly. Not wrapped in a DB transaction/RPC for MVP — acceptable
 * since this is a single user recording their own payment, not a
 * high-concurrency path.
 */
export async function recordPayment(businessId, invoiceId, { amount, method, paidAt, notes }, recordedBy) {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('total, amount_paid')
    .eq('business_id', businessId)
    .eq('id', invoiceId)
    .single();
  if (invoiceError) throw invoiceError;

  const { error: paymentError } = await supabase.from('payments').insert({
    business_id: businessId,
    invoice_id: invoiceId,
    amount,
    method,
    paid_at: paidAt || new Date().toISOString(),
    notes,
    recorded_by: recordedBy,
  });
  if (paymentError) throw paymentError;

  const newAmountPaid = Number(invoice.amount_paid) + Number(amount);
  const newStatus = newAmountPaid >= Number(invoice.total) ? 'paid' : 'partially_paid';

  const { data: updated, error: updateError } = await supabase
    .from('invoices')
    .update({ amount_paid: newAmountPaid, status: newStatus })
    .eq('business_id', businessId)
    .eq('id', invoiceId)
    .select()
    .single();
  if (updateError) throw updateError;

  return updated;
}

/**
 * Display-only overdue detection — doesn't mutate the stored status.
 * A real overdue sweep (e.g. a daily job that flips status to
 * 'overdue' and fires a notification) is a good Phase 5+/automation
 * candidate; for now this keeps the UI honest without needing a
 * background job.
 */
export function isOverdue(invoice) {
  if (!invoice.due_date) return false;
  if (!['sent', 'partially_paid'].includes(invoice.status)) return false;
  return new Date(invoice.due_date) < new Date(new Date().toDateString());
}
