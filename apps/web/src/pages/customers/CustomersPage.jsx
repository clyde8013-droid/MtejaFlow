import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiUsers, FiMoreVertical, FiArchive, FiRotateCcw, FiEdit2 } from 'react-icons/fi';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomerFormModal from '../../components/customers/CustomerFormModal';
import StatusBadge from '../../components/customers/StatusBadge';
import { useToast } from '../../components/ui/ToastProvider';
import { useBusiness } from '../../hooks/useBusiness';
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  restoreCustomer,
} from '../../services/customersService';
import { formatDate } from '../../utils/format';
import styles from './CustomersPage.module.css';

const STATUS_TABS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
];

export default function CustomersPage() {
  const { business } = useBusiness();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('active');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null); // { customer, action: 'archive' | 'restore' }
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const data = await listCustomers(business.id, { search, status: statusTab });
      setCustomers(data);
    } catch (err) {
      notify(err.message || 'Could not load customers.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [business, search, statusTab, notify]);

  useEffect(() => {
    const debounce = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [load, search]);

  function openAddForm() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEditForm(customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
    setOpenMenuId(null);
  }

  async function handleFormSubmit(payload) {
    setSaving(true);
    try {
      if (editingCustomer) {
        await updateCustomer(business.id, editingCustomer.id, payload);
        notify('Customer updated.', { type: 'success' });
      } else {
        await createCustomer(business.id, payload);
        notify('Customer added.', { type: 'success' });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      notify(err.message || 'Could not save customer.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmAction() {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      if (confirmTarget.action === 'archive') {
        await archiveCustomer(business.id, confirmTarget.customer.id);
        notify('Customer archived.', { type: 'success' });
      } else {
        await restoreCustomer(business.id, confirmTarget.customer.id);
        notify('Customer restored.', { type: 'success' });
      }
      setConfirmTarget(null);
      load();
    } catch (err) {
      notify(err.message || 'Something went wrong.', { type: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (row) => (
        <div className={styles.nameCell}>
          <span className={styles.avatar}>{row.full_name.charAt(0).toUpperCase()}</span>
          <div>
            <p className={styles.nameText}>{row.full_name}</p>
            {row.company && <p className={styles.companyText}>{row.company}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (row) => (
        <div className={styles.contactCell}>
          {row.phone && <span>{row.phone}</span>}
          {row.email && <span className={styles.mutedText}>{row.email}</span>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      label: 'Added',
      render: (row) => <span className="figure">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      width: 50,
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.menuBtn}
            onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
            aria-label="Row actions"
          >
            <FiMoreVertical />
          </button>
          {openMenuId === row.id && (
            <div className={styles.menu}>
              <button className={styles.menuItem} onClick={() => openEditForm(row)}>
                <FiEdit2 aria-hidden="true" /> Edit
              </button>
              {row.status === 'archived' ? (
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setConfirmTarget({ customer: row, action: 'restore' });
                    setOpenMenuId(null);
                  }}
                >
                  <FiRotateCcw aria-hidden="true" /> Restore
                </button>
              ) : (
                <button
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  onClick={() => {
                    setConfirmTarget({ customer: row, action: 'archive' });
                    setOpenMenuId(null);
                  }}
                >
                  <FiArchive aria-hidden="true" /> Archive
                </button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrap} onClick={() => openMenuId && setOpenMenuId(null)}>
      <div className={styles.toolbar}>
        <Input
          icon={FiSearch}
          placeholder="Search by name, company, phone, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Button icon={FiPlus} onClick={openAddForm}>
          Add customer
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
        rows={customers}
        loading={loading}
        onRowClick={(row) => navigate(`/app/customers/${row.id}`)}
        emptyIcon={FiUsers}
        emptyTitle={search ? 'No customers match your search' : 'No customers yet'}
        emptyDescription={
          search
            ? 'Try a different name, company, phone, or email.'
            : 'Add your first customer to start creating quotes and invoices.'
        }
        emptyAction={
          !search && (
            <Button icon={FiPlus} onClick={openAddForm}>
              Add customer
            </Button>
          )
        }
      />

      <CustomerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        customer={editingCustomer}
        loading={saving}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.action === 'archive' ? 'Archive customer?' : 'Restore customer?'}
        message={
          confirmTarget?.action === 'archive'
            ? `${confirmTarget?.customer.full_name} will be moved to Archived. You can restore them anytime.`
            : `${confirmTarget?.customer.full_name} will be marked Active again.`
        }
        confirmLabel={confirmTarget?.action === 'archive' ? 'Archive' : 'Restore'}
        danger={confirmTarget?.action === 'archive'}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
