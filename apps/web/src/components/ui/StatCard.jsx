import styles from './StatCard.module.css';

/**
 * StatCard
 * value should already be formatted (currency, count, %) by the caller.
 * trend: { direction: 'up' | 'down', label: string } optional.
 */
export default function StatCard({ icon: Icon, label, value, trend, tone = 'default' }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.iconWrap} ${styles[tone]}`}>
        {Icon && <Icon aria-hidden="true" />}
      </div>
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <p className={`${styles.value} figure`}>{value}</p>
        {trend && (
          <p className={`${styles.trend} ${trend.direction === 'down' ? styles.trendDown : styles.trendUp}`}>
            {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
