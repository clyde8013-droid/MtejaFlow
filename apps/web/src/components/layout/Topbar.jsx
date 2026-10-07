import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiLogOut, FiBell } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './Topbar.module.css';

export default function Topbar({ title }) {
  const { t } = useTranslation();
  const { user, logOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initials = (user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <LanguageSwitcher />
        <button className={styles.iconBtn} aria-label="Notifications">
          <FiBell />
        </button>
        <div className={styles.menuWrap} ref={menuRef}>
          <button className={styles.userBtn} onClick={() => setMenuOpen((o) => !o)}>
            <span className={styles.avatar}>{initials}</span>
            <FiChevronDown className={styles.chevron} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              <p className={styles.menuEmail}>{user?.email}</p>
              <button className={styles.menuItem} onClick={logOut}>
                <FiLogOut aria-hidden="true" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
