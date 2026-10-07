import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';
import LoadingState from '../ui/LoadingState';

/** Only reachable when logged in. Redirects to /login otherwise. */
export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Only reachable once the user has an authenticated session AND finished onboarding. */
export function RequireBusiness() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();

  if (authLoading || businessLoading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (!business) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

/** Only reachable when logged out — keeps logged-in users off /login, /signup, etc. */
export function RequireGuest() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (user) return <Navigate to="/app" replace />;
  return <Outlet />;
}
