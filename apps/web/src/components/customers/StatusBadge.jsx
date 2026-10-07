import styles from './StatusBadge.module.css';

const TONE_MAP = {
  active: 'success',
  inactive: 'warning',
  archived: 'muted',
};

const LABEL_MAP = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
};

export default function StatusBadge({ status }) {
  const tone = TONE_MAP[status] || 'muted';
  return <span className={`${styles.badge} ${styles[tone]}`}>{LABEL_MAP[status] || status}</span>;
}
