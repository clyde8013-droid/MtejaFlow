import { useTranslation } from 'react-i18next';
import styles from './AuthLayout.module.css';
import LanguageSwitcher from './LanguageSwitcher';

export default function AuthLayout({ children }) {
  const { t } = useTranslation();

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>M</span>
          <span className={styles.brandName}>{t('common.appName')}</span>
        </div>
        <div className={styles.panelContent}>
          <h2 className={styles.tagline}>Your business. Understood.</h2>
          <p className={styles.taglineSub}>
            Customers, quotes, invoices and follow-ups — in one place built for how
            East African businesses actually work.
          </p>
        </div>
        <div className={styles.motif} aria-hidden="true" />
      </div>
      <div className={styles.formSide}>
        <div className={styles.formSideTop}>
          <LanguageSwitcher />
        </div>
        <div className={styles.formCard}>{children}</div>
      </div>
    </div>
  );
}
