import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiFileText } from 'react-icons/fi';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import QuoteStatusBadge from '../../components/quotes/QuoteStatusBadge';
import { useToast } from '../../components/ui/ToastProvider';
import { useBusiness } from '../../hooks/useBusiness';
import { listQuotes } from '../../services/quotesService';
import { formatDate, formatMoney } from '../../utils/format';
import styles from './QuotesPage.module.css';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

export default function QuotesPage() {
  const { business } = useBusiness();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const data = await listQuotes(business.id, { search, status: statusTab });
      setQuotes(data);
    } catch (err) {
      notify(err.message || 'Could not load quotes.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [business, search, statusTab, notify]);

  useEffect(() => {
    const debounce = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [load, search]);

  const columns = [
    { key: 'quote_number', label: 'Quote #', render: (row) => <span className="figure">{row.quote_number}</span> },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div>
          <p className={styles.customerName}>{row.customers?.full_name || '—'}</p>
          {row.customers?.company && <p className={styles.customerCompany}>{row.customers.company}</p>}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => <QuoteStatusBadge status={row.status} /> },
    { key: 'total', label: 'Total', render: (row) => <span className="figure">{formatMoney(row.total, row.currency)}</span> },
    { key: 'created_at', label: 'Created', render: (row) => <span className="figure">{formatDate(row.created_at)}</span> },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <Input
          icon={FiSearch}
          placeholder="Search by quote number or customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Button icon={FiPlus} onClick={() => navigate('/app/quotes/new')}>
          New quotation
        </Button>
      </div>

      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${statusTab === tab.value ? styles.tabActive : ''}`}
            onClick={() => setStatusTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={quotes}
        loading={loading}
        onRowClick={(row) => navigate(`/app/quotes/${row.id}`)}
        emptyIcon={FiFileText}
        emptyTitle={search ? 'No quotes match your search' : 'No quotations yet'}
        emptyDescription={
          search ? 'Try a different quote number or customer name.' : 'Create your first quotation to send to a customer.'
        }
        emptyAction={
          !search && (
            <Button icon={FiPlus} onClick={() => navigate('/app/quotes/new')}>
              New quotation
            </Button>
          )
        }
      />
    </div>
  );
}
