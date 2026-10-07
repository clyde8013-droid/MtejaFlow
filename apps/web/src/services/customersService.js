import { supabase } from './supabaseClient';

/**
 * All queries here are automatically scoped by Postgres RLS to the
 * caller's business — but we still filter by business_id explicitly
 * so query intent is clear and index usage is predictable.
 */

export async function listCustomers(businessId, { search = '', status = 'active' } = {}) {
  let query = supabase
    .from('customers')
    .select('id, full_name, company, phone, email, status, tags, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }
  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`full_name.ilike.${term},company.ilike.${term},phone.ilike.${term},email.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCustomer(businessId, customerId) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', customerId)
    .single();
  if (error) throw error;
  return data;
}

export async function createCustomer(businessId, payload) {
  const { data, error } = await supabase
    .from('customers')
    .insert({ ...payload, business_id: businessId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(businessId, customerId, payload) {
  const { data, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('business_id', businessId)
    .eq('id', customerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Soft-delete: sets status to 'archived' rather than removing the row. */
export async function archiveCustomer(businessId, customerId) {
  const { error } = await supabase
    .from('customers')
    .update({ status: 'archived', archived_at: new Date().toISOString() })
    .eq('business_id', businessId)
    .eq('id', customerId);
  if (error) throw error;
}

export async function restoreCustomer(businessId, customerId) {
  const { error } = await supabase
    .from('customers')
    .update({ status: 'active', archived_at: null })
    .eq('business_id', businessId)
    .eq('id', customerId);
  if (error) throw error;
}

export async function listCustomerNotes(businessId, customerId) {
  const { data, error } = await supabase
    .from('customer_notes')
    .select('id, body, created_at, author_id')
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addCustomerNote(businessId, customerId, body, authorId) {
  const { data, error } = await supabase
    .from('customer_notes')
    .insert({ business_id: businessId, customer_id: customerId, body, author_id: authorId })
    .select()
    .single();
  if (error) throw error;
  return data;
}
