import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiClock, FiMessageSquare, FiCheck, FiX } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import FollowUpFormModal from '../../components/followups/FollowUpFormModal';
import MessageGeneratorModal from '../../components/shared/MessageGeneratorModal';
import followUpTypeLabel from '../../components/followups/followUpTypeLabel';
import { useToast } from '../../components/ui/ToastProvider';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../hooks/useAuth';
import {
  listFollowUps,
  createFollowUp,
  completeFollowUp,
  cancelFollowUp,
  daysSince,
  isOverdueFollowUp,
} from '../../services/followupsService';
import styles from './FollowUpsPage.module.css';

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function FollowUpsPage() {
  const { business } = useBusiness();
  const { user } = useAuth();
  const { notify } = useToast();

  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pending'); // pending | all
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null); // { customerName, situation }

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const data = await listFollowUps(business.id, { status: view === 'all' ? 'all' : 'pending' });
      setFollowUps(data);
    } catch (err) {
      notify(err.message || 'Could not load follow-ups.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [business, view, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const { todayItems, overdueItems, upcomingItems } = useMemo(() => {
    const today = [];
    const overdue = [];
    const upcoming = [];
    for (const f of followUps) {
      if (f.status !== 'pending') continue;
      if (isOverdueFollowUp(f)) overdue.push(f);
      else if (isToday(f.due_at)) today.push(f);
      else upcoming.push(f);
    }
    return { todayItems: today, overdueItems: overdue, upcomingItems: upcoming };
  }, [followUps]);

  async function handleCreate(payload) {
    setSaving(true);
    try {
      await createFollowUp(business.id, payload, user.id);
      notify('Follow-up scheduled.', { type: 'success' });
      setFormOpen(false);
      load();
    } catch (err) {
      notify(err.message || 'Could not schedule follow-up.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(id) {
    setActioningId(id);
    try {
      await completeFollowUp(business.id, id);
      notify('Marked as done.', { type: 'success' });
      load();
    } catch (err) {
      notify(err.message || 'Something went wrong.', { type: 'error' });
    } finally {
      setActioningId(null);
    }
  }

  async function handleCancel(id) {
    setActioningId(id);
    try {
      await cancelFollowUp(business.id, id);
      notify('Follow-up cancelled.', { type: 'success' });
      load();
    } catch (err) {
      notify(err.message || 'Something went wrong.', { type: 'error' });
    } finally {
      setActioningId(null);
    }
  }

  function openMessageDraft(followUp) {
    const days = daysSince(followUp.due_at);
    const situation = followUp.notes
      ? followUp.notes
      : `${followUpTypeLabel(followUp.type)}, ${days} day${days === 1 ? '' : 's'} since it was due.`;
    setMessageTarget({ customerName: followUp.customers?.full_name || 'the customer', situation });
  }

  function renderFollowUpCard(f) {
    return (
      <div key={f.id} className={styles.card}>
        <div className={styles.cardMain}>
          <Link to={`/app/customers/${f.customers?.id}`} className={styles.customerName}>
            {f.customers?.full_name || 'Customer'}
          </Link>
          <p className={styles.typeLabel}>{followUpTypeLabel(f.type)}</p>
          {f.notes && <p className={styles.notes}>{f.notes}</p>}
          {f.customers?.phone && <p className={styles.phone}>{f.customers.phone}</p>}
        </div>
        <div className={styles.cardActions}>
          <Button size="sm" icon={FiMessageSquare} onClick={() => openMessageDraft(f)}>
            Draft message
          </Button>
          <Button size="sm" variant="secondary" icon={FiCheck} loading={actioningId === f.id} onClick={() => handleComplete(f.id)}>
            Done
          </Button>
          <button className={styles.cancelBtn} onClick={() => handleCancel(f.id)} aria-label="Cancel follow-up">
            <FiX />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${view === 'pending' ? styles.tabActive : ''}`} onClick={() => setView('pending')}>
            Pending
          </button>
          <button className={`${styles.tab} ${view === 'all' ? styles.tabActive : ''}`} onClick={() => setView('all')}>
            All
          </button>
        </div>
        <Button icon={FiPlus} onClick={() => setFormOpen(true)}>
          Schedule follow-up
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : view === 'all' ? (
        followUps.length === 0 ? (
          <EmptyState icon={FiClock} title="No follow-ups yet" description="Follow-ups you schedule will show up here." />
        ) : (
          <div className={styles.section}>{followUps.map(renderFollowUpCard)}</div>
        )
      ) : (
        <div className={styles.sections}>
          {overdueItems.length > 0 && (
            <div className={styles.sectionBlock}>
              <h2 className={`${styles.sectionTitle} ${styles.sectionTitleDanger}`}>Overdue</h2>
              <div className={styles.section}>{overdueItems.map(renderFollowUpCard)}</div>
            </div>
          )}

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Today's follow-ups</h2>
            {todayItems.length === 0 ? (
              <EmptyState icon={FiClock} title="Nothing due today" description="You're all caught up for today." />
            ) : (
              <div className={styles.section}>{todayItems.map(renderFollowUpCard)}</div>
            )}
          </div>

          {upcomingItems.length > 0 && (
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Upcoming</h2>
              <div className={styles.section}>{upcomingItems.map(renderFollowUpCard)}</div>
            </div>
          )}
        </div>
      )}

      <FollowUpFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        businessId={business?.id}
        loading={saving}
      />

      <MessageGeneratorModal
        open={!!messageTarget}
        onClose={() => setMessageTarget(null)}
        customerName={messageTarget?.customerName}
        situation={messageTarget?.situation}
      />
    </div>
  );
}
