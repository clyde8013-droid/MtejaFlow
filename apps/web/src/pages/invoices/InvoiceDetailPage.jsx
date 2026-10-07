import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiDownload, FiSend, FiDollarSign } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import RecordPaymentModal from '../../components/invoices/RecordPaymentModal';
import { useToast } from '../../components/ui/ToastProvider';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../hooks/useAuth';
import { getInvoice, markInvoiceSent, recordPayment } from '../../services/invoicesService';
import { apiClient } from '../../services/apiClient';
import { formatDate, formatMoney } from '../../utils/format';
import styles from './InvoiceDetailPage.module.css';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business } = useBusiness();
  const { user } = useAuth();
  const { notify } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const data = await getInvoice(business.id, id);
      setInvoice(data);
    } catch (err) {
      notify(err.message || 'Could not load this invoice.', { type: 'error' });
      navigate('/app/invoices');
    } finally {
      setLoading(false);
    }
  }, [business, id, notify, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkSent() {
    setActionLoading(true);
    try {
      await markInvoiceSent(business.id, id);
      notify('Invoice marked as sent.', { type: 'success' });
      load();
    } catch (err) {
      notify(err.message || 'Could not update the invoice.', { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRecordPayment(paymentPayload) {
    setPaymentLoading(true);
    try {
      await recordPayment(business.id, id, paymentPayload, user.id);
      notify('Payment recorded.', { type: 'success' });
      setPaymentModalOpen(false);
      load();
    } catch (err) {
      notify(err.message || 'Could not record the payment.', { type: 'error' });
    } finally {
      setPaymentLoading(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await apiClient.download(`/api/pdf/invoices/${id}`, `invoice-${invoice.invoice_number}.pdf`);
    } catch (err) {
      notify(err.message || 'Could not generate the PDF. Is the API server running?', { type: 'error' });
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!invoice) return null;

  const isDraft = invoice.status === 'draft';
  const canRecordPayment = ['sent', 'partially_paid'].includes(invoice.status);
  const balance = Number(invoice.total) - Number(invoice.amount_paid);

  return (
    <div className={styles.wrap}>
      <button className={styles.backLink} onClick={() => navigate('/app/invoices')}>
        <FiArrowLeft aria-hidden="true" /> Back to invoices
      </button>

      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{invoice.invoice_number}</h1>
            <InvoiceStatusBadge invoice={invoice} />
          </div>
          <Link to={`/app/customers/${invoice.customers.id}`} className={styles.customerLink}>
            {invoice.customers.full_name}{invoice.customers.company ? ` · ${invoice.customers.company}` : ''}
          </Link>
          {invoice.quotes && (
            <p className={styles.quoteRef}>
              From quote <Link to={`/app/quotes/${invoice.quotes.id}`}>{invoice.quotes.quote_number}</Link>
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
          {isDraft && (
            <Button variant="secondary" icon={FiEdit2} onClick={() => navigate(`/app/invoices/${id}/edit`)}>
              Edit
            </Button>
          )}
          <Button variant="secondary" icon={FiDownload} loading={downloading} onClick={handleDownload}>
            Download PDF
          </Button>
        </div>
      </div>

      {isDraft && (
        <div className={styles.actionBar}>
          <Button icon={FiSend} loading={actionLoading} onClick={handleMarkSent}>
            Mark as sent
          </Button>
        </div>
      )}

      {canRecordPayment && (
        <div className={styles.actionBar}>
          <p className={styles.actionBarLabel}>
            Balance due: <strong className="figure">{formatMoney(balance, invoice.currency)}</strong>
          </p>
          <Button icon={FiDollarSign} onClick={() => setPaymentModalOpen(true)}>
            Record payment
          </Button>
        </div>
      )}

      <div className={styles.card}>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className="figure">{item.quantity}</td>
                <td className="figure">{formatMoney(item.unit_price, invoice.currency)}</td>
                <td className="figure">{formatMoney(item.line_total, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span className="figure">{formatMoney(invoice.subtotal, invoice.currency)}</span>
          </div>
          {Number(invoice.discount) > 0 && (
            <div className={styles.totalRow}>
              <span>Discount</span>
              <span className="figure">-{formatMoney(invoice.discount, invoice.currency)}</span>
            </div>
          )}
          {Number(invoice.tax) > 0 && (
            <div className={styles.totalRow}>
              <span>Tax</span>
              <span className="figure">{formatMoney(invoice.tax, invoice.currency)}</span>
            </div>
          )}
          <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
            <span>Total</span>
            <span className="figure">{formatMoney(invoice.total, invoice.currency)}</span>
          </div>
          {Number(invoice.amount_paid) > 0 && (
            <>
              <div className={styles.totalRow}>
                <span>Paid</span>
                <span className="figure">{formatMoney(invoice.amount_paid, invoice.currency)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Balance</span>
                <span className="figure">{formatMoney(balance, invoice.currency)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Payment history</h3>
          <ul className={styles.paymentList}>
            {invoice.payments.map((p) => (
              <li key={p.id} className={styles.paymentItem}>
                <span className="figure">{formatMoney(p.amount, invoice.currency)}</span>
                <span className={styles.paymentMethod}>{p.method.replace('_', ' ')}</span>
                <span className={styles.paymentDate}>{formatDate(p.paid_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.metaGrid}>
        <div className={styles.metaCard}>
          <h4 className={styles.metaLabel}>Created</h4>
          <p className="figure">{formatDate(invoice.created_at)}</p>
        </div>
        {invoice.due_date && (
          <div className={styles.metaCard}>
            <h4 className={styles.metaLabel}>Due date</h4>
            <p className="figure">{formatDate(invoice.due_date)}</p>
          </div>
        )}
        {invoice.notes && (
          <div className={styles.metaCard} style={{ gridColumn: '1 / -1' }}>
            <h4 className={styles.metaLabel}>Notes</h4>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>

      <RecordPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handleRecordPayment}
        invoice={invoice}
        loading={paymentLoading}
      />
    </div>
  );
}
