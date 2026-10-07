import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

const ICONS = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, { type = 'info', duration = 4000 } = {}) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className={styles.container} role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || FiInfo;
          return (
            <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
              <Icon className={styles.icon} aria-hidden="true" />
              <span className={styles.message}>{t.message}</span>
              <button
                className={styles.close}
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
              >
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
