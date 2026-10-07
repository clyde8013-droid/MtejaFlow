import { useEffect, useState } from 'react';
import { FiUser, FiBriefcase, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import styles from './CustomerFormModal.module.css';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const EMPTY_FORM = {
  full_name: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  status: 'active',
  tags: '',
};

/**
 * customer: null for "add" mode, or an existing customer row for "edit" mode.
 * onSubmit(payload): payload has tags normalized to a string[] already.
 */
export default function CustomerFormModal({ open, onClose, onSubmit, customer, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const isEdit = !!customer;

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? { ...EMPTY_FORM, ...customer, tags: (customer.tags || []).join(', ') }
          : EMPTY_FORM
      );
      setError('');
    }
  }, [open, customer]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim()) {
      setError('Full name is required.');
      return;
    }
    setError('');
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await onSubmit({
      full_name: form.full_name.trim(),
      company: form.company.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status,
      tags,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit customer' : 'Add customer'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" loading={loading}>
            {isEdit ? 'Save changes' : 'Add customer'}
          </Button>
        </>
      }
    >
      <form id="customer-form" className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <Input
          label="Full name"
          icon={FiUser}
          value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)}
          required
        />
        <div className={styles.row}>
          <Input
            label="Company"
            icon={FiBriefcase}
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
          />
          {isEdit && (
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
            />
          )}
        </div>
        <div className={styles.row}>
          <Input
            label="Phone"
            type="tel"
            icon={FiPhone}
            placeholder="+255 7XX XXX XXX"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            icon={FiMail}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>
        <Input
          label="Address"
          icon={FiMapPin}
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
        <Input
          label="Tags"
          hint="Comma-separated, e.g. VIP, Wholesale"
          value={form.tags}
          onChange={(e) => update('tags', e.target.value)}
        />
        <div className={styles.field}>
          <label className={styles.label} htmlFor="customer-notes">Notes</label>
          <textarea
            id="customer-notes"
            className={styles.textarea}
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
