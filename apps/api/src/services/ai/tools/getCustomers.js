import { supabaseAdmin } from '../../supabaseAdmin.js';

/**
 * Returns a lightweight list of the business's customers.
 * Every AI tool takes businessId as its first argument, resolved
 * server-side from the caller's verified session — never from
 * anything the model itself supplies.
 */
export async function getCustomers(businessId, { status = 'active', limit = 50 } = {}) {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('id, full_name, company, phone, email, status, created_at')
    .eq('business_id', businessId)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getCustomers failed: ${error.message}`);
  return data;
}
