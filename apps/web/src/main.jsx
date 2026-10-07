import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './i18n';
import { AuthProvider } from './hooks/useAuth';
import { BusinessProvider } from './hooks/useBusiness';
import { ToastProvider } from './components/ui/ToastProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <BusinessProvider>
          <App />
        </BusinessProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
