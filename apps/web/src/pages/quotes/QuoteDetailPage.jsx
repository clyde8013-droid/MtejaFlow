import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiDownload, FiCheck, FiX, FiSend, FiCreditCard } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import QuoteStatusBadge from '../../components/quotes/QuoteStatusBadge';
import { useToast } from '../../components/ui/ToastProvider';
import { useBusiness } from '../../hooks/useBusiness';
import { getQuote, updateQuoteStatus } from '../../services/quotesService';
import { apiClient } from '../../services/apiClient';
import { formatDate, formatMoney } from '../../utils/format';
import styles from './QuoteDetailPage.module.css';

export default function QuoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business } = useBusiness();
  const { notify } = useToast();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const data = await getQuote(business.id, id);
      setQuote(data);
    } catch (err) {
      notify(err.message || 'Could not load this quote.', { type: 'error' });
      navigate('/app/quotes');
    } finally {
      setLoading(false);
    }
  }, [business, id, notify, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(status) {
    setActionLoading(true);
    try {
      await updateQuoteStatus(business.id, id, status);
      notify(`Quote marked as ${status}.`, { type: 'success' });
      load();
    } catch (err) {
      notify(err.message || 'Could not update the quote.', { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await apiClient.download(`/api/pdf/quotes/${id}`, `quote-${quote.quote_number}.pdf`);
    } catch (err) {
      notify(err.message || 'Could not generate the PDF. Is the API server running?', { type: 'error' });
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!quote) return null;

  const isDraft = quote.status === 'draft';
  const isSentOrViewed = quote.status === 'sent' || quote.status === 'viewed';

  return (
    <div className={styles.wrap}>
      <button className={styles.backLink} onClick={() => navigate('/app/quotes')}>
        <FiArrowLeft aria-hidden="true" /> Back to quotes
      </button>

      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{quote.quote_number}</h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <Link to={`/app/customers/${quote.customers.id}`} className={styles.customerLink}>
            {quote.customers.full_name}{quote.customers.company ? ` · ${quote.customers.company}` : ''}
          </Link>
        </div>
        <div className={styles.headerActions}>
          {isDraft && (
            <Button variant="secondary" icon={FiEdit2} onClick={() => navigate(`/app/quotes/${id}/edit`)}>
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
          <Button icon={FiSend} loading={actionLoading} onClick={() => handleStatusChange('sent')}>
            Mark as sent
          </Button>
        </div>
      )}

      {isSentOrViewed && (
        <div className={styles.actionBar}>
          <p className={styles.actionBarLabel}>Record the customer's response:</p>
          <Button icon={FiCheck} loading={actionLoading} onClick={() => handleStatusChange('accepted')}>
            Mark as accepted
          </Button>
          <Button variant="secondary" icon={FiX} loading={actionLoading} onClick={() => handleStatusChange('rejected')}>
            Mark as rejected
          </Button>
        </div>
      )}

      {quote.status === 'accepted' && (
        <div className={styles.actionBar}>
          <p className={styles.actionBarLabel}>Ready to bill this customer?</p>
          <Button icon={FiCreditCard} onClick={() => navigate(`/app/invoices/new?fromQuote=${id}`)}>
            Create invoice
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
            {quote.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className="figure">{item.quantity}</td>
                <td className="figure">{formatMoney(item.unit_price, quote.currency)}</td>
                <td className="figure">{formatMoney(item.line_total, quote.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span className="figure">{formatMoney(quote.subtotal, quote.currency)}</span>
          </div>
          {Number(quote.discount) > 0 && (
            <div className={styles.totalRow}>
              <span>Discount</span>
              <span className="figure">-{formatMoney(quote.discount, quote.currency)}</span>
            </div>
          )}
          {Number(quote.tax) > 0 && (
            <div className={styles.totalRow}>
              <span>Tax</span>
              <span className="figure">{formatMoney(quote.tax, quote.currency)}</span>
            </div>
          )}
          <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
            <span>Total</span>
            <span className="figure">{formatMoney(quote.total, quote.currency)}</span>
          </div>
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaCard}>
          <h4 className={styles.metaLabel}>Created</h4>
          <p className="figure">{formatDate(quote.created_at)}</p>
        </div>
        {quote.expires_at && (
          <div className={styles.metaCard}>
            <h4 className={styles.metaLabel}>Valid until</h4>
            <p className="figure">{formatDate(quote.expires_at)}</p>
          </div>
        )}
        {quote.notes && (
          <div className={styles.metaCard} style={{ gridColumn: '1 / -1' }}>
            <h4 className={styles.metaLabel}>Notes</h4>
            <p>{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
