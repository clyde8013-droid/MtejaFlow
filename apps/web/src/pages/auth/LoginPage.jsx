import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMail, FiLock } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthForm.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const { logIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await logIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(t('auth.loginError'));
      return;
    }
    navigate('/app');
  }

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
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
          autoComplete="current-password"
          required
        />

        <div className={styles.row}>
          <Link to="/forgot-password" className={styles.linkBtn}>
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" size="lg" loading={loading}>
          {t('auth.logIn')}
        </Button>

        <p className={styles.footer}>
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className={styles.linkBtn}>
            {t('auth.signUp')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
