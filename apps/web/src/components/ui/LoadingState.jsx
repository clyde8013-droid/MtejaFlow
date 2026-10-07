import styles from './LoadingState.module.css';

export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
