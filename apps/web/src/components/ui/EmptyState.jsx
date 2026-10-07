import styles from './EmptyState.module.css';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className={styles.wrap}>
      {Icon && (
        <div className={styles.iconWrap}>
          <Icon aria-hidden="true" />
        </div>
      )}
      <h4 className={styles.title}>{title}</h4>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
