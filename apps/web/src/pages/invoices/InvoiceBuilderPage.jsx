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
import { getInvoice, createInvoice, updateInvoice, getQuoteForConversion } from '../../services/invoicesService';
import styles from './InvoiceBuilderPage.module.css';

export default function InvoiceBuilderPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromQuoteId = searchParams.get('fromQuote');
  const isEdit = !!id;
  const navigate = useNavigate();
  const { business } = useBusiness();
  const { user } = useAuth();
  const { notify } = useToast();

  const [loading, setLoading] = useState(isEdit || !!fromQuoteId);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [quoteId, setQuoteId] = useState(null);
  const [quoteNumber, setQuoteNumber] = useState(null);
  const [items, setItems] = useState([newLineItem()]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [existingStatus, setExistingStatus] = useState('draft');

  useEffect(() => {
    if (!business) return;

    if (isEdit) {
      (async () => {
        try {
          const invoice = await getInvoice(business.id, id);
          setCustomerId(invoice.customer_id);
          setQuoteId(invoice.quote_id);
          setQuoteNumber(invoice.quotes?.quote_number || null);
          setItems(
            invoice.items.length
              ? invoice.items.map((it) => ({ uid: it.id, description: it.description, quantity: it.quantity, unit_price: it.unit_price }))
              : [newLineItem()]
          );
          setDiscount(invoice.discount);
          setTax(invoice.tax);
          setDueDate(invoice.due_date || '');
          setNotes(invoice.notes || '');
          setExistingStatus(invoice.status);
        } catch (err) {
          notify(err.message || 'Could not load this invoice.', { type: 'error' });
          navigate('/app/invoices');
        } finally {
          setLoading(false);
        }
      })();
    } else if (fromQuoteId) {
      (async () => {
        try {
          const quote = await getQuoteForConversion(business.id, fromQuoteId);
          setCustomerId(quote.customer_id);
          setQuoteId(quote.id);
          setQuoteNumber(quote.quote_number);
          setItems(
            quote.items.length
              ? quote.items.map((it) => newLineItemFrom(it))
              : [newLineItem()]
          );
          setDiscount(quote.discount);
          setTax(quote.tax);
          setNotes(quote.notes || '');
        } catch (err) {
          notify(err.message || 'Could not load the quote.', { type: 'error' });
          navigate('/app/quotes');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEdit, id, fromQuoteId, business, notify, navigate]);

  function newLineItemFrom(quoteItem) {
    const base = newLineItem();
    return { ...base, description: quoteItem.description, quantity: quoteItem.quantity, unit_price: quoteItem.unit_price };
  }

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
      quoteId,
      currency: business.currency,
      notes: notes.trim() || null,
      dueDate: dueDate || null,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      items: cleanItems,
      status,
    };

    try {
      if (isEdit) {
        await updateInvoice(business.id, id, payload);
        notify(status === 'sent' ? 'Invoice sent.' : 'Invoice updated.', { type: 'success' });
        navigate(`/app/invoices/${id}`);
      } else {
        const invoice = await createInvoice(business.id, payload, user.id);
        notify(status === 'sent' ? 'Invoice sent.' : 'Invoice saved as draft.', { type: 'success' });
        navigate(`/app/invoices/${invoice.id}`);
      }
    } catch (err) {
      notify(err.message || 'Could not save the invoice.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  const canSend = !isEdit || existingStatus === 'draft';

  return (
    <div className={styles.wrap}>
      <button className={styles.backLink} onClick={() => navigate('/app/invoices')}>
        <FiArrowLeft aria-hidden="true" /> Back to invoices
      </button>

      <h1 className={styles.title}>{isEdit ? 'Edit invoice' : 'New invoice'}</h1>
      {quoteNumber && (
        <p className={styles.quoteBanner}>Created from quote <span className="figure">{quoteNumber}</span></p>
      )}

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
          <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="invoice-notes">Notes</label>
          <textarea
            id="invoice-notes"
            className={styles.textarea}
            rows={3}
            placeholder="Payment instructions or anything else the customer should know."
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
