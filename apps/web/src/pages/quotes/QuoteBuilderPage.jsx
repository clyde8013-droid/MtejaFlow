import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiSend } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import LineItemsEditor, { newLineItem } from '../../components/shared/LineItemsEditor';
import CustomerPicker from '../../components/quotes/CustomerPicker';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/ToastProvider';
import { getQuote, createQuote, updateQuote } from '../../services/quotesService';
import styles from './QuoteBuilderPage.module.css';

export default function QuoteBuilderPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { business } = useBusiness();
  const { user } = useAuth();
  const { notify } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState(searchParams.get('customer') || '');
  const [items, setItems] = useState([newLineItem()]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [existingStatus, setExistingStatus] = useState('draft');

  useEffect(() => {
    if (!isEdit || !business) return;
    (async () => {
      try {
        const quote = await getQuote(business.id, id);
        setCustomerId(quote.customer_id);
        setItems(
          quote.items.length
            ? quote.items.map((it) => ({ uid: it.id, description: it.description, quantity: it.quantity, unit_price: it.unit_price }))
            : [newLineItem()]
        );
        setDiscount(quote.discount);
        setTax(quote.tax);
        setExpiresAt(quote.expires_at || '');
        setNotes(quote.notes || '');
        setExistingStatus(quote.status);
      } catch (err) {
        notify(err.message || 'Could not load this quote.', { type: 'error' });
        navigate('/app/quotes');
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, business, notify, navigate]);

  function validate() {
    if (!customerId) {
      notify('Please select a customer.', { type: 'error' });
      return false;
    }
    const cleanItems = items.filter((it) => it.description.trim());
    if (cleanItems.length === 0) {
      notify('Add at least one line item.', { type: 'error' });
      return false;
    }
    return true;
  }

  async function handleSave(status) {
    if (!validate()) return;
    setSaving(true);
    const cleanItems = items
      .filter((it) => it.description.trim())
      .map((it) => ({ description: it.description.trim(), quantity: Number(it.quantity) || 0, unit_price: Number(it.unit_price) || 0 }));

    const payload = {
      customerId,
      currency: business.currency,
      notes: notes.trim() || null,
      expiresAt: expiresAt || null,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      items: cleanItems,
      status,
    };

    try {
      if (isEdit) {
        await updateQuote(business.id, id, payload);
        notify(status === 'sent' ? 'Quote sent.' : 'Quote updated.', { type: 'success' });
      } else {
        const quote = await createQuote(business.id, payload, user.id);
        notify(status === 'sent' ? 'Quote sent.' : 'Quote saved as draft.', { type: 'success' });
        navigate(`/app/quotes/${quote.id}`);
        return;
      }
      navigate(`/app/quotes/${id}`);
    } catch (err) {
      notify(err.message || 'Could not save the quote.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  const canSend = !isEdit || existingStatus === 'draft';

  return (
    <div className={styles.wrap}>
      <button className={styles.backLink} onClick={() => navigate('/app/quotes')}>
        <FiArrowLeft aria-hidden="true" /> Back to quotes
      </button>

      <h1 className={styles.title}>{isEdit ? 'Edit quotation' : 'New quotation'}</h1>

      <div className={styles.card}>
        <CustomerPicker businessId={business.id} value={customerId} onChange={setCustomerId} />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Line items</h3>
        <LineItemsEditor items={items} onChange={setItems} currency={business.currency} />
      </div>

      <div className={styles.card}>
        <div className={styles.row}>
          <Input
            label={`Discount (${business.currency})`}
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
          <Input
            label={`Tax (${business.currency})`}
            type="number"
            min="0"
            step="0.01"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
          />
          <Input label="Valid until" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="quote-notes">Notes</label>
          <textarea
            id="quote-notes"
            className={styles.textarea}
            rows={3}
            placeholder="Payment terms, delivery details, or anything else the customer should know."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" icon={FiSave} loading={saving} onClick={() => handleSave('draft')}>
          Save as draft
        </Button>
        {canSend && (
          <Button icon={FiSend} loading={saving} onClick={() => handleSave('sent')}>
            Save &amp; mark as sent
          </Button>
        )}
      </div>
    </div>
  );
}
