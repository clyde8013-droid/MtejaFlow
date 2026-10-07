import { isOverdue } from '../../services/invoicesService';
import styles from './InvoiceStatusBadge.module.css';

const TONE_MAP = {
  draft: 'muted',
  sent: 'info',
  partially_paid: 'accent',
  paid: 'success',
  overdue: 'danger',
};

const LABEL_MAP = {
  draft: 'Draft',
  sent: 'Sent',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
};

export default function InvoiceStatusBadge({ invoice }) {
  const effectiveStatus = isOverdue(invoice) ? 'overdue' : invoice.status;
  const tone = TONE_MAP[effectiveStatus] || 'muted';
  return <span className={`${styles.badge} ${styles[tone]}`}>{LABEL_MAP[effectiveStatus] || effectiveStatus}</span>;
}
