import { supabase } from './supabaseClient';

export async function listFollowUps(businessId, { status = 'pending' } = {}) {
  let query = supabase
    .from('follow_ups')
    .select('id, type, due_at, status, notes, related_type, related_id, customers(id, full_name, phone, company)')
    .eq('business_id', businessId)
    .order('due_at', { ascending: true });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listFollowUpsForCustomer(businessId, customerId) {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('id, type, due_at, status, notes')
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .order('due_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createFollowUp(businessId, { customerId, type, dueAt, notes }, createdBy) {
  const { data, error } = await supabase
    .from('follow_ups')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      type,
      due_at: dueAt,
      notes: notes || null,
      created_by: createdBy,
    })
    .select('*, customers(id, full_name, phone, company)')
    .single();
  if (error) throw error;
  return data;
}

export async function completeFollowUp(businessId, followUpId) {
  const { error } = await supabase
    .from('follow_ups')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('business_id', businessId)
    .eq('id', followUpId);
  if (error) throw error;
}

export async function cancelFollowUp(businessId, followUpId) {
  const { error } = await supabase
    .from('follow_ups')
    .update({ status: 'cancelled' })
    .eq('business_id', businessId)
    .eq('id', followUpId);
  if (error) throw error;
}

export function daysSince(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function isOverdueFollowUp(followUp) {
  return followUp.status === 'pending' && new Date(followUp.due_at) < new Date();
}
