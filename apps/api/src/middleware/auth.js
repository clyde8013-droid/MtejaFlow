import { supabaseAdmin } from '../services/supabaseAdmin.js';

/**
 * Verifies the bearer token against Supabase Auth, then resolves the
 * caller's business via business_members. Attaches req.user and
 * req.businessId. Never trusts a business_id supplied by the client —
 * it is always looked up server-side from the verified user id.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Missing bearer token.' });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('business_members')
      .select('business_id, role')
      .eq('user_id', userData.user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      return res.status(500).json({ message: 'Failed to resolve business.' });
    }
    if (!membership) {
      return res.status(403).json({ message: 'No business associated with this account yet.' });
    }

    req.user = userData.user;
    req.businessId = membership.business_id;
    req.role = membership.role;
    next();
  } catch (err) {
    next(err);
  }
}
