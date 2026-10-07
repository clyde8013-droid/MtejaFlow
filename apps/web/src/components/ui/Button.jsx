import styles from './Button.module.css';

/**
 * Button
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className={styles.icon} aria-hidden="true" />}
      <span className={loading ? styles.labelLoading : undefined}>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className={styles.icon} aria-hidden="true" />}
    </button>
  );
}
