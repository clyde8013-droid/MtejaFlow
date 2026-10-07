import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import LandingPage from './pages/landing/LandingPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import CustomersPage from './pages/customers/CustomersPage';
import CustomerProfilePage from './pages/customers/CustomerProfilePage';
import QuotesPage from './pages/quotes/QuotesPage';
import QuoteBuilderPage from './pages/quotes/QuoteBuilderPage';
import QuoteDetailPage from './pages/quotes/QuoteDetailPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import InvoiceBuilderPage from './pages/invoices/InvoiceBuilderPage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import FollowUpsPage from './pages/followups/FollowUpsPage';
import AIAssistantPage from './pages/ai/AIAssistantPage';
import SettingsPage from './pages/settings/SettingsPage';

import AppLayout from './components/layout/AppLayout';
import { RequireAuth, RequireBusiness, RequireGuest } from './components/layout/RouteGuards';

function DashboardRoute() {
  const { t } = useTranslation();
  return <AppLayout title={t('nav.dashboard')} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Guest-only routes */}
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Authenticated, but onboarding not required yet */}
        <Route element={<RequireAuth />}>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Authenticated + onboarded */}
        <Route element={<RequireBusiness />}>
          <Route element={<DashboardRoute />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/customers" element={<CustomersPage />} />
            <Route path="/app/customers/:id" element={<CustomerProfilePage />} />
            <Route path="/app/quotes" element={<QuotesPage />} />
            <Route path="/app/quotes/new" element={<QuoteBuilderPage />} />
            <Route path="/app/quotes/:id" element={<QuoteDetailPage />} />
            <Route path="/app/quotes/:id/edit" element={<QuoteBuilderPage />} />
            <Route path="/app/invoices" element={<InvoicesPage />} />
            <Route path="/app/invoices/new" element={<InvoiceBuilderPage />} />
            <Route path="/app/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/app/invoices/:id/edit" element={<InvoiceBuilderPage />} />
            <Route path="/app/follow-ups" element={<FollowUpsPage />} />
            <Route path="/app/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
