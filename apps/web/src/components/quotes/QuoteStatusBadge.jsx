import styles from './QuoteStatusBadge.module.css';

const TONE_MAP = {
  draft: 'muted',
  sent: 'info',
  viewed: 'accent',
  accepted: 'success',
  rejected: 'danger',
  expired: 'muted',
};

const LABEL_MAP = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

export default function QuoteStatusBadge({ status }) {
  const tone = TONE_MAP[status] || 'muted';
  return <span className={`${styles.badge} ${styles[tone]}`}>{LABEL_MAP[status] || status}</span>;
}
