import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { formatMoney } from '../../utils/format';
import styles from './RecordPaymentModal.module.css';

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

export default function RecordPaymentModal({ open, onClose, onSubmit, invoice, loading }) {
  const balance = invoice ? Number(invoice.total) - Number(invoice.amount_paid) : 0;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(balance > 0 ? String(balance) : '');
      setMethod('cash');
      setNotes('');
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice?.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }
    setError('');
    await onSubmit({ amount: value, method, notes: notes.trim() || null });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record a payment"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" loading={loading}>
            Record payment
          </Button>
        </>
      }
    >
      {invoice && (
        <form id="payment-form" className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          <p className={styles.balanceLine}>
            Balance due: <strong className="figure">{formatMoney(balance, invoice.currency)}</strong>
          </p>
          <Input
            label={`Amount (${invoice.currency})`}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
          <Select label="Payment method" options={METHODS} value={method} onChange={(e) => setMethod(e.target.value)} />
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </form>
      )}
    </Modal>
  );
}
