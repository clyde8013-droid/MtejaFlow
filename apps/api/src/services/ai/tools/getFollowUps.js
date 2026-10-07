import { supabaseAdmin } from '../../supabaseAdmin.js';

export async function getFollowUps(businessId, { status = 'pending', limit = 50 } = {}) {
  const { data, error } = await supabaseAdmin
    .from('follow_ups')
    .select('id, customer_id, type, due_at, status, notes, customers(full_name)')
    .eq('business_id', businessId)
    .eq('status', status)
    .order('due_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`getFollowUps failed: ${error.message}`);
  return data;
}
