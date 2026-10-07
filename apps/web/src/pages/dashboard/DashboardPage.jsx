import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiActivity,
  FiUserPlus,
  FiCreditCard,
} from 'react-icons/fi';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import { supabase } from '../../services/supabaseClient';
import { apiClient } from '../../services/apiClient';
import { getRecentActivity } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';
import { formatMoney, formatDate } from '../../utils/format';
import styles from './DashboardPage.module.css';

const EMPTY_STATS = {
  revenueThisMonth: 0,
  outstandingTotal: 0,
  customerCount: 0,
  quotesSent: 0,
  quotesAccepted: 0,
};

const ACTIVITY_ICONS = {
  customer: FiUserPlus,
  quote: FiFileText,
  invoice: FiCreditCard,
  followup: FiCheckCircle,
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { business } = useBusiness();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [followUps, setFollowUps] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const [aiInsights, setAiInsights] = useState(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(true);
  const [aiInsightsFailed, setAiInsightsFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!business) return;
      setLoading(true);

      const [customersRes, quotesRes, invoicesRes, followUpsRes, activityData] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
        supabase.from('quotes').select('status, total').eq('business_id', business.id),
        supabase.from('invoices').select('status, total, created_at').eq('business_id', business.id),
        supabase
          .from('follow_ups')
          .select('id, due_at, notes, type, customers(full_name)')
          .eq('business_id', business.id)
          .eq('status', 'pending')
          .order('due_at', { ascending: true })
          .limit(5),
        getRecentActivity(business.id).catch(() => []),
      ]);

      if (cancelled) return;

      const quotes = quotesRes.data || [];
      const invoices = invoicesRes.data || [];
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const revenueThisMonth = invoices
        .filter((inv) => inv.status === 'paid' && new Date(inv.created_at) >= monthStart)
        .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

      const outstandingTotal = invoices
        .filter((inv) => ['sent', 'partially_paid', 'overdue'].includes(inv.status))
        .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

      setStats({
        revenueThisMonth,
        outstandingTotal,
        customerCount: customersRes.count || 0,
        quotesSent: quotes.filter((q) => q.status !== 'draft').length,
        quotesAccepted: quotes.filter((q) => q.status === 'accepted').length,
      });
      setFollowUps(followUpsRes.data || []);
      setActivity(activityData);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [business]);

  const loadAiInsights = useCallback(async () => {
    setAiInsightsLoading(true);
    setAiInsightsFailed(false);
    try {
      const res = await apiClient.getInsights();
      setAiInsights(res.insights);
    } catch {
      // API server may not be running, or the Gemini key isn't set yet —
      // fall back to simple heuristic insights rather than showing nothing.
      setAiInsightsFailed(true);
    } finally {
      setAiInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (business) loadAiInsights();
  }, [business, loadAiInsights]);

  const fallbackInsights = useMemo(() => {
    const list = [];
    if (stats.customerCount === 0) {
      list.push('Add your first customer to start creating quotes and invoices.');
      return list;
    }
    if (stats.outstandingTotal > 0) {
      list.push(`You have ${formatMoney(stats.outstandingTotal, business?.currency)} in outstanding invoices.`);
    }
    if (followUps.length > 0) {
      list.push(`${followUps.length} customer${followUps.length > 1 ? 's' : ''} need follow-up.`);
    }
    if (stats.revenueThisMonth > 0) {
      list.push(`Your business generated ${formatMoney(stats.revenueThisMonth, business?.currency)} this month.`);
    }
    if (list.length === 0) {
      list.push("You're all caught up — nothing urgent right now.");
    }
    return list;
  }, [stats, followUps, business]);

  const displayedInsights = aiInsightsFailed || !aiInsights ? fallbackInsights : aiInsights;

  const conversionRate = useMemo(() => {
    if (!stats.quotesSent) return 0;
    return Math.round((stats.quotesAccepted / stats.quotesSent) * 100);
  }, [stats]);

  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }, []);

  const displayName = user?.email?.split('@')[0] || '';

  if (loading) return <LoadingState />;

  return (
    <div className={styles.wrap}>
      <p className={styles.greeting}>
        {t('dashboard.greeting', { timeOfDay: t(`dashboard.timeOfDay.${timeOfDay}`, timeOfDay), name: displayName })}
      </p>

      <div className={styles.statsGrid}>
        <StatCard
          icon={FiTrendingUp}
          label={t('dashboard.revenueThisMonth')}
          value={formatMoney(stats.revenueThisMonth, business?.currency)}
          tone="success"
        />
        <StatCard
          icon={FiFileText}
          label={t('dashboard.outstandingInvoices')}
          value={formatMoney(stats.outstandingTotal, business?.currency)}
          tone="warning"
        />
        <StatCard icon={FiUsers} label={t('dashboard.totalCustomers')} value={stats.customerCount} />
        <StatCard icon={FiFileText} label={t('dashboard.quotesSent')} value={stats.quotesSent} />
        <StatCard icon={FiCheckCircle} label={t('dashboard.quotesAccepted')} value={stats.quotesAccepted} tone="success" />
        <StatCard icon={FiClock} label={t('dashboard.conversionRate')} value={`${conversionRate}%`} />
      </div>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <FiCpu aria-hidden="true" />
            <h3>{t('dashboard.aiInsights')}</h3>
          </div>
          {aiInsightsLoading ? (
            <p className={styles.insightLoading}>Thinking…</p>
          ) : (
            <>
              <ul className={styles.insightList}>
                {displayedInsights.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {aiInsightsFailed && (
                <p className={styles.insightFallbackNote}>
                  Showing basic insights — the AI assistant couldn't be reached.
                </p>
              )}
            </>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <FiClock aria-hidden="true" />
            <h3>{t('dashboard.upcomingFollowUps')}</h3>
          </div>
          {followUps.length === 0 ? (
            <EmptyState
              icon={FiClock}
              title="No follow-ups scheduled"
              description="When you schedule a follow-up with a customer, it'll show up here."
            />
          ) : (
            <ul className={styles.followUpList}>
              {followUps.map((f) => (
                <li key={f.id} className={styles.followUpItem}>
                  <div>
                    <p className={styles.followUpName}>{f.customers?.full_name || 'Customer'}</p>
                    <p className={styles.followUpNote}>{f.notes || f.type}</p>
                  </div>
                  <span className={`${styles.followUpDate} figure`}>
                    {new Date(f.due_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <FiActivity aria-hidden="true" />
          <h3>{t('dashboard.recentActivity')}</h3>
        </div>
        {activity.length === 0 ? (
          <EmptyState
            icon={FiActivity}
            title="No activity yet"
            description={t('dashboard.noActivity')}
          />
        ) : (
          <ul className={styles.activityList}>
            {activity.map((event) => {
              const Icon = ACTIVITY_ICONS[event.type] || FiActivity;
              const content = (
                <>
                  <span className={styles.activityIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className={styles.activityText}>{event.text}</span>
                  <span className={styles.activityDate}>{formatDate(event.timestamp)}</span>
                </>
              );
              return (
                <li key={event.id} className={styles.activityItem}>
                  {event.link ? (
                    <Link to={event.link} className={styles.activityLink}>
                      {content}
                    </Link>
                  ) : (
                    <div className={styles.activityLink}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
