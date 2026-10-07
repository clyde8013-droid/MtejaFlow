import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMail } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/ToastProvider';
import styles from './AuthForm.module.css';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const { resendVerification } = useAuth();
  const { notify } = useToast();
  const { state } = useLocation();
  const email = state?.email || '';
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    setLoading(true);
    const { error } = await resendVerification(email);
    setLoading(false);
    notify(
      error ? 'Could not resend the email. Try again shortly.' : 'Verification email sent.',
      { type: error ? 'error' : 'success' }
    );
  }

  return (
    <AuthLayout>
      <div className={styles.form}>
        <div className={styles.header} style={{ alignItems: 'center', textAlign: 'center' }}>
          <FiMail size={40} color="var(--color-primary)" aria-hidden="true" />
          <h1 className={styles.title}>{t('auth.verifyEmailTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.verifyEmailSubtitle', { email })}</p>
        </div>
        <Button variant="secondary" size="lg" onClick={handleResend} loading={loading}>
          {t('auth.resendEmail')}
        </Button>
      </div>
    </AuthLayout>
  );
}
