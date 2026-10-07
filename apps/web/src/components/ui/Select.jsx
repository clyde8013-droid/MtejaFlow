import { useId } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import styles from './Input.module.css';
import selectStyles from './Select.module.css';

export default function Select({ label, error, hint, options = [], id, className = '', ...rest }) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={`${styles.inputWrap} ${selectStyles.wrap} ${error ? styles.invalid : ''}`}>
        <select id={selectId} className={`${styles.input} ${selectStyles.select}`} aria-invalid={!!error} {...rest}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FiChevronDown className={selectStyles.chevron} aria-hidden="true" />
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      {!error && hint && <p className={styles.hintText}>{hint}</p>}
    </div>
  );
}
