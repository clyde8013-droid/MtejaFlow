import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';
import { supabase } from '../../services/supabaseClient';
import { setLanguage } from '../../i18n';
import styles from '../auth/AuthForm.module.css';

const BUSINESS_TYPES = [
  { value: 'retail', label: 'Retail / Shop' },
  { value: 'services', label: 'Services' },
  { value: 'construction', label: 'Construction' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
];

const COUNTRIES = [
  { value: 'TZ', label: 'Tanzania' },
  { value: 'KE', label: 'Kenya' },
  { value: 'UG', label: 'Uganda' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'other', label: 'Other' },
];

const CURRENCIES_BY_COUNTRY = {
  TZ: 'TZS',
  KE: 'KES',
  UG: 'UGX',
  RW: 'RWF',
  other: 'USD',
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Kiswahili' },
];

const TOTAL_STEPS = 2;

export default function OnboardingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { refresh } = useBusiness();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'retail',
    country: 'TZ',
    currency: 'TZS',
    phone: '',
    address: '',
    preferred_language: 'en',
  });

  function update(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'country') {
        next.currency = CURRENCIES_BY_COUNTRY[value] || 'USD';
      }
      return next;
    });
  }

  function handleNext(e) {
    e.preventDefault();
    setStep(2);
  }

  async function handleFinish(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Single atomic RPC call — creates the business and links the current
    // user as owner in one transaction, avoiding the RLS chicken-and-egg
    // problem of reading back a business row before membership exists.
    const { data: business, error: rpcError } = await supabase.rpc('create_business_with_owner', {
      business_name: form.name,
      business_type: form.type,
      business_country: form.country,
      business_currency: form.currency,
      business_phone: form.phone,
      business_address: form.address,
      business_language: form.preferred_language,
      business_email: user.email,
    });

    setLoading(false);

    if (rpcError) {
      setError('Could not save your business. Please try again.');
      return;
    }

    setLanguage(form.preferred_language);
    await refresh();
    navigate('/app');
  }

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={step === 1 ? handleNext : handleFinish}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('onboarding.title')}</h1>
          <p className={styles.subtitle}>{t('onboarding.subtitle')}</p>
          <p className={styles.subtitle} style={{ fontSize: 'var(--text-xs)' }}>
            {t('onboarding.stepOf', { current: step, total: TOTAL_STEPS })}
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {step === 1 && (
          <>
            <Input
              label={t('onboarding.businessName')}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
            <Select
              label={t('onboarding.businessType')}
              options={BUSINESS_TYPES}
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
            />
            <Select
              label={t('onboarding.country')}
              options={COUNTRIES}
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
            />
            <Input label={t('onboarding.currency')} value={form.currency} disabled />
            <Button type="submit" size="lg">
              {t('common.next')}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label={t('onboarding.phone')}
              type="tel"
              placeholder="+255 7XX XXX XXX"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              required
            />
            <Input
              label={t('onboarding.address')}
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
            <Select
              label={t('onboarding.preferredLanguage')}
              options={LANGUAGES}
              value={form.preferred_language}
              onChange={(e) => update('preferred_language', e.target.value)}
            />
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>
                {t('common.back')}
              </Button>
              <Button type="submit" size="lg" loading={loading} style={{ flex: 1 }}>
                {t('onboarding.finish')}
              </Button>
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
