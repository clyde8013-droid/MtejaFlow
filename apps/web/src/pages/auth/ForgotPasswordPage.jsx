import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMail } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthForm.module.css';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await resetPassword(email);
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.forgotPasswordTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {sent && <div className={styles.successBanner}>{t('auth.resetLinkSent')}</div>}

        <Input
          label={t('auth.email')}
          type="email"
          icon={FiMail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <Button type="submit" size="lg" loading={loading}>
          {t('auth.sendResetLink')}
        </Button>

        <p className={styles.footer}>
          <Link to="/login" className={styles.linkBtn}>
            {t('common.back')} {t('auth.logIn')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
