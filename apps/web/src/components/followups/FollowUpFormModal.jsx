import { useState } from 'react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import CustomerPicker from '../quotes/CustomerPicker';
import styles from './FollowUpFormModal.module.css';

const TYPE_OPTIONS = [
  { value: 'quote_followup', label: 'Follow up after quotation' },
  { value: 'payment_reminder', label: 'Payment reminder' },
  { value: 'check_in', label: 'Customer check-in' },
  { value: 'sales_followup', label: 'Sales follow-up' },
  { value: 'general', label: 'General' },
];

export default function FollowUpFormModal({ open, onClose, onSubmit, businessId, loading, defaultCustomerId }) {
  const [customerId, setCustomerId] = useState(defaultCustomerId || '');
  const [type, setType] = useState('general');
  const [dueAt, setDueAt] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    if (!dueAt) {
      setError('Please choose a date and time.');
      return;
    }
    setError('');
    await onSubmit({ customerId, type, dueAt: new Date(dueAt).toISOString(), notes: notes.trim() });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule a follow-up"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="followup-form" loading={loading}>
            Schedule
          </Button>
        </>
      }
    >
      <form id="followup-form" className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        <CustomerPicker businessId={businessId} value={customerId} onChange={setCustomerId} />
        <Select label="Type" options={TYPE_OPTIONS} value={type} onChange={(e) => setType(e.target.value)} />
        <Input label="Due date & time" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required />
        <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </form>
    </Modal>
  );
}
