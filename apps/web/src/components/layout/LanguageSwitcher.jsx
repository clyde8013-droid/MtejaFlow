import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import { setLanguage } from '../../i18n';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Kiswahili' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className={styles.wrap}>
      <FiGlobe className={styles.icon} aria-hidden="true" />
      <select
        className={styles.select}
        value={i18n.language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
