import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit2,
  FiArchive,
  FiRotateCcw,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFileText,
  FiCreditCard,
  FiClock,
  FiPlus,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomerFormModal from '../../components/customers/CustomerFormModal';
import FollowUpFormModal from '../../components/followups/FollowUpFormModal';
import StatusBadge from '../../components/customers/StatusBadge';
import QuoteStatusBadge from '../../components/quotes/QuoteStatusBadge';
import { useToast } from '../../components/ui/ToastProvider';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../hooks/useAuth';
import {
  getCustomer,
  updateCustomer,
  archiveCustomer,
  restoreCustomer,
  listCustomerNotes,
  addCustomerNote,
} from '../../services/customersService';
import { listQuotesForCustomer } from '../../services/quotesService';
import { listInvoicesForCustomer } from '../../services/invoicesService';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import { listFollowUpsForCustomer, createFollowUp } from '../../services/followupsService';
import followUpTypeLabel from '../../components/followups/followUpTypeLabel';
import { formatDate, formatMoney } from '../../utils/format';
import styles from './CustomerProfilePage.module.css';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'notes', label: 'Notes' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'followups', label: 'Follow-ups' },
];

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business } = useBusiness();
  const { user } = useAuth();
  const { notify } = useToast();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  const [followUpFormOpen, setFollowUpFormOpen] = useState(false);
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const data = await getCustomer(business.id, id);
      setCustomer(data);
    } catch (err) {
      notify(err.message || 'Could not load this customer.', { type: 'error' });
      navigate('/app/customers');
    } finally {
      setLoading(false);
    }
  }, [business, id, notify, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const loadNotes = useCallback(async () => {
    if (!business) return;
    setNotesLoading(true);
    try {
      const data = await listCustomerNotes(business.id, id);
      setNotes(data);
    } catch (err) {
      notify(err.message || 'Could not load notes.', { type: 'error' });
    } finally {
      setNotesLoading(false);
    }
  }, [business, id, notify]);

  useEffect(() => {
    if (activeTab === 'notes' && notes.length === 0) loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'quotes' && business) {
      setQuotesLoading(true);
      listQuotesForCustomer(business.id, id)
        .then(setQuotes)
        .catch((err) => notify(err.message || 'Could not load quotes.', { type: 'error' }))
        .finally(() => setQuotesLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'invoices' && business) {
      setInvoicesLoading(true);
      listInvoicesForCustomer(business.id, id)
        .then(setInvoices)
        .catch((err) => notify(err.message || 'Could not load invoices.', { type: 'error' }))
        .finally(() => setInvoicesLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'followups' && business) {
      setFollowUpsLoading(true);
      listFollowUpsForCustomer(business.id, id)
        .then(setFollowUps)
        .catch((err) => notify(err.message || 'Could not load follow-ups.', { type: 'error' }))
        .finally(() => setFollowUpsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function handleEditSubmit(payload) {
    setSaving(true);
    try {
      const updated = await updateCustomer(business.id, id, payload);
      setCustomer(updated);
      setEditOpen(false);
      notify('Customer updated.', { type: 'success' });
    } catch (err) {
      notify(err.message || 'Could not save changes.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveToggle() {
    setConfirmLoading(true);
    try {
      if (customer.status === 'archived') {
        await restoreCustomer(business.id, id);
        notify('Customer restored.', { type: 'success' });
      } else {
        await archiveCustomer(business.id, id);
        notify('Customer archived.', { type: 'success' });
      }
      setConfirmOpen(false);
      load();
    } catch (err) {
      notify(err.message || 'Something went wrong.', { type: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleScheduleFollowUp(payload) {
    setSavingFollowUp(true);
    try {
      await createFollowUp(business.id, payload, user.id);
      notify('Follow-up scheduled.', { type: 'success' });
      setFollowUpFormOpen(false);
      const data = await listFollowUpsForCustomer(business.id, id);
      setFollowUps(data);
    } catch (err) {
      notify(err.message || 'Could not schedule follow-up.', { type: 'error' });
    } finally {
      setSavingFollowUp(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const note = await addCustomerNote(business.id, id, newNote.trim(), user.id);
      setNotes((prev) => [note, ...prev]);
      setNewNote('');
    } catch (err) {
      notify(err.message || 'Could not add note.', { type: 'error' });
    } finally {
      setAddingNote(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!customer) return null;

  const isArchived = customer.status === 'archived';

  return (
    <div className={styles.wrap}>
      <button className={styles.backLink} onClick={() => navigate('/app/customers')}>
        <FiArrowLeft aria-hidden="true" /> Back to customers
      </button>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.avatarLg}>{customer.full_name.charAt(0).toUpperCase()}</span>
          <div>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{customer.full_name}</h1>
              <StatusBadge status={customer.status} />
            </div>
            {customer.company && <p className={styles.company}>{customer.company}</p>}
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" icon={FiEdit2} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button
            variant={isArchived ? 'secondary' : 'ghost'}
            icon={isArchived ? FiRotateCcw : FiArchive}
            onClick={() => setConfirmOpen(true)}
          >
            {isArchived ? 'Restore' : 'Archive'}
          </Button>
        </div>
      </div>

      <div className={styles.contactRow}>
        {customer.phone && (
          <span className={styles.contactItem}>
            <FiPhone aria-hidden="true" /> {customer.phone}
          </span>
        )}
        {customer.email && (
          <span className={styles.contactItem}>
            <FiMail aria-hidden="true" /> {customer.email}
          </span>
        )}
        {customer.address && (
          <span className={styles.contactItem}>
            <FiMapPin aria-hidden="true" /> {customer.address}
          </span>
        )}
      </div>

      {customer.tags?.length > 0 && (
        <div className={styles.tagRow}>
          {customer.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <h3 className={styles.overviewLabel}>Customer since</h3>
              <p className="figure">{formatDate(customer.created_at)}</p>
            </div>
            <div className={styles.overviewCard}>
              <h3 className={styles.overviewLabel}>Notes on file</h3>
              <p>{customer.notes || 'No notes yet.'}</p>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className={styles.notesWrap}>
            <form className={styles.noteForm} onSubmit={handleAddNote}>
              <textarea
                className={styles.noteTextarea}
                placeholder="Add a note about this customer…"
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button type="submit" size="sm" icon={FiPlus} loading={addingNote}>
                Add note
              </Button>
            </form>

            {notesLoading ? (
              <LoadingState />
            ) : notes.length === 0 ? (
              <EmptyState title="No notes yet" description="Notes you add about this customer will show up here." />
            ) : (
              <ul className={styles.noteList}>
                {notes.map((note) => (
                  <li key={note.id} className={styles.noteItem}>
                    <p className={styles.noteBody}>{note.body}</p>
                    <p className={styles.noteDate}>{formatDate(note.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className={styles.notesWrap}>
            <div className={styles.tabHeaderRow}>
              <Button size="sm" icon={FiPlus} onClick={() => navigate(`/app/quotes/new?customer=${id}`)}>
                New quotation
              </Button>
            </div>
            {quotesLoading ? (
              <LoadingState />
            ) : quotes.length === 0 ? (
              <EmptyState
                icon={FiFileText}
                title="No quotes yet"
                description="Quotations sent to this customer will show up here."
              />
            ) : (
              <ul className={styles.noteList}>
                {quotes.map((q) => (
                  <li
                    key={q.id}
                    className={`${styles.noteItem} ${styles.clickableItem}`}
                    onClick={() => navigate(`/app/quotes/${q.id}`)}
                  >
                    <div className={styles.quoteRow}>
                      <span className={`${styles.quoteNumber} figure`}>{q.quote_number}</span>
                      <QuoteStatusBadge status={q.status} />
                    </div>
                    <div className={styles.quoteRow}>
                      <span className="figure">{formatMoney(q.total, q.currency)}</span>
                      <span className={styles.noteDate}>{formatDate(q.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {activeTab === 'invoices' && (
          <div className={styles.notesWrap}>
            <div className={styles.tabHeaderRow}>
              <Button size="sm" icon={FiPlus} onClick={() => navigate('/app/invoices/new')}>
                New invoice
              </Button>
            </div>
            {invoicesLoading ? (
              <LoadingState />
            ) : invoices.length === 0 ? (
              <EmptyState
                icon={FiCreditCard}
                title="No invoices yet"
                description="Invoices raised for this customer will show up here."
              />
            ) : (
              <ul className={styles.noteList}>
                {invoices.map((inv) => (
                  <li
                    key={inv.id}
                    className={`${styles.noteItem} ${styles.clickableItem}`}
                    onClick={() => navigate(`/app/invoices/${inv.id}`)}
                  >
                    <div className={styles.quoteRow}>
                      <span className={`${styles.quoteNumber} figure`}>{inv.invoice_number}</span>
                      <InvoiceStatusBadge invoice={inv} />
                    </div>
                    <div className={styles.quoteRow}>
                      <span className="figure">{formatMoney(inv.total, inv.currency)}</span>
                      <span className={styles.noteDate}>{formatDate(inv.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {activeTab === 'followups' && (
          <div className={styles.notesWrap}>
            <div className={styles.tabHeaderRow}>
              <Button size="sm" icon={FiPlus} onClick={() => setFollowUpFormOpen(true)}>
                Schedule follow-up
              </Button>
            </div>
            {followUpsLoading ? (
              <LoadingState />
            ) : followUps.length === 0 ? (
              <EmptyState
                icon={FiClock}
                title="No follow-ups yet"
                description="Scheduled follow-ups with this customer will show up here."
              />
            ) : (
              <ul className={styles.noteList}>
                {followUps.map((f) => (
                  <li key={f.id} className={styles.noteItem}>
                    <div className={styles.quoteRow}>
                      <span className={styles.quoteNumber}>{followUpTypeLabel(f.type)}</span>
                      <span className={styles.noteDate}>{new Date(f.due_at).toLocaleString()}</span>
                    </div>
                    {f.notes && <p className={styles.noteBody}>{f.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <FollowUpFormModal
        open={followUpFormOpen}
        onClose={() => setFollowUpFormOpen(false)}
        onSubmit={handleScheduleFollowUp}
        businessId={business?.id}
        loading={savingFollowUp}
        defaultCustomerId={id}
      />

      <CustomerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        customer={customer}
        loading={saving}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={isArchived ? 'Restore customer?' : 'Archive customer?'}
        message={
          isArchived
            ? `${customer.full_name} will be marked Active again.`
            : `${customer.full_name} will be moved to Archived. You can restore them anytime.`
        }
        confirmLabel={isArchived ? 'Restore' : 'Archive'}
        danger={!isArchived}
        loading={confirmLoading}
        onConfirm={handleArchiveToggle}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
