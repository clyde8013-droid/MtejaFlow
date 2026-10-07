import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiCreditCard,
  FiClock,
  FiCpu,
  FiSettings,
} from 'react-icons/fi';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/app', icon: FiGrid, key: 'dashboard', end: true },
  { to: '/app/customers', icon: FiUsers, key: 'customers' },
  { to: '/app/quotes', icon: FiFileText, key: 'quotes' },
  { to: '/app/invoices', icon: FiCreditCard, key: 'invoices' },
  { to: '/app/follow-ups', icon: FiClock, key: 'followUps' },
  { to: '/app/ai-assistant', icon: FiCpu, key: 'aiAssistant' },
];

export default function Sidebar({ businessName }) {
  const { t } = useTranslation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>M</span>
        <div className={styles.brandText}>
          <span className={styles.brandName}>{t('common.appName')}</span>
          {businessName && <span className={styles.businessName}>{businessName}</span>}
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, icon: Icon, key, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <Icon className={styles.navIcon} aria-hidden="true" />
            <span>{t(`nav.${key}`)}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <NavLink
          to="/app/settings"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <FiSettings className={styles.navIcon} aria-hidden="true" />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
}
