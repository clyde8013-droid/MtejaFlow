import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // business_members -> businesses, scoped by RLS to rows the user belongs to.
    const { data, error } = await supabase
      .from('business_members')
      .select('role, businesses(*)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load business:', error.message);
      setBusiness(null);
    } else {
      setBusiness(data?.businesses ?? null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <BusinessContext.Provider value={{ business, loading, refresh, hasBusiness: !!business }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}
