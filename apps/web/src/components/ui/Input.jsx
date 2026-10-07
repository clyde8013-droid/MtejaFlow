import { useId } from 'react';
import styles from './Input.module.css';

export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  className = '',
  id,
  ...rest
}) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={`${styles.inputWrap} ${error ? styles.invalid : ''}`}>
        {Icon && <Icon className={styles.icon} aria-hidden="true" />}
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className={styles.errorText}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className={styles.hintText}>
          {hint}
        </p>
      )}
    </div>
  );
}
