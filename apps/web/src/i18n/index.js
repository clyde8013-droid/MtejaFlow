import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sw from './locales/sw.json';

const STORAGE_KEY = 'mtejaflow.language';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
  },
  lng: savedLanguage || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLanguage(lang) {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

export default i18n;
