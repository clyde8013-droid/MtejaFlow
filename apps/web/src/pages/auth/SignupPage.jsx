import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMail, FiLock } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthForm.module.css';

export default function SignupPage() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.confirmPassword') + ' — passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(email, password);
    setLoading(false);

    if (signUpError) {
      setError(t('auth.signupError'));
      return;
    }
    navigate('/verify-email', { state: { email } });
  }

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.signupTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.signupSubtitle')}</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <Input
          label={t('auth.email')}
          type="email"
          icon={FiMail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label={t('auth.password')}
          type="password"
          icon={FiLock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          hint="At least 8 characters"
          required
        />
        <Input
          label={t('auth.confirmPassword')}
          type="password"
          icon={FiLock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <Button type="submit" size="lg" loading={loading}>
          {t('auth.signUp')}
        </Button>

        <p className={styles.footer}>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className={styles.linkBtn}>
            {t('auth.logIn')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
