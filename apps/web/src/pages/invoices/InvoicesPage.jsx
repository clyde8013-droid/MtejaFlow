import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiCreditCard } from 'react-icons/fi';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import { useToast } from '../../components/ui/ToastProvider';
import { useBusiness } from '../../hooks/useBusiness';
import { listInvoices } from '../../services/invoicesService';
import { formatDate, formatMoney } from '../../utils/format';
import styles from './InvoicesPage.module.css';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
];

export default function InvoicesPage() {
  const { business } = useBusiness();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const data = await listInvoices(business.id, { search, status: statusTab });
      setInvoices(data);
    } catch (err) {
      notify(err.message || 'Could not load invoices.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [business, search, statusTab, notify]);

  useEffect(() => {
    const debounce = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [load, search]);

  const columns = [
    { key: 'invoice_number', label: 'Invoice #', render: (row) => <span className="figure">{row.invoice_number}</span> },
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
    { key: 'status', label: 'Status', render: (row) => <InvoiceStatusBadge invoice={row} /> },
    { key: 'total', label: 'Total', render: (row) => <span className="figure">{formatMoney(row.total, row.currency)}</span> },
    {
      key: 'due_date',
      label: 'Due',
      render: (row) => (row.due_date ? <span className="figure">{formatDate(row.due_date)}</span> : '—'),
    },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <Input
          icon={FiSearch}
          placeholder="Search by invoice number or customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Button icon={FiPlus} onClick={() => navigate('/app/invoices/new')}>
          New invoice
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
        rows={invoices}
        loading={loading}
        onRowClick={(row) => navigate(`/app/invoices/${row.id}`)}
        emptyIcon={FiCreditCard}
        emptyTitle={search ? 'No invoices match your search' : 'No invoices yet'}
        emptyDescription={
          search
            ? 'Try a different invoice number or customer name.'
            : 'Create an invoice directly, or convert an accepted quote into one.'
        }
        emptyAction={
          !search && (
            <Button icon={FiPlus} onClick={() => navigate('/app/invoices/new')}>
              New invoice
            </Button>
          )
        }
      />
    </div>
  );
}
