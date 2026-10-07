import { useEffect, useState } from 'react';
import { FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../ui/ToastProvider';
import styles from './MessageGeneratorModal.module.css';

const TONE_OPTIONS = [
  { value: 'professional_friendly', label: 'Professional & friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Kiswahili' },
];

/**
 * customerName, situation: prefilled context (e.g. from a follow-up row).
 * Calls the Node backend, which calls OpenAI server-side — no API key
 * ever touches the browser.
 */
export default function MessageGeneratorModal({ open, onClose, customerName, situation }) {
  const { notify } = useToast();
  const [tone, setTone] = useState('professional_friendly');
  const [language, setLanguage] = useState('en');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setCopied(false);
    try {
      const res = await apiClient.post('/api/messages/generate', {
        customerName,
        situation,
        tone,
        language,
      });
      setMessage(res.message);
    } catch (err) {
      notify(err.message || 'Could not generate a message. Is the API server running?', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleCopy() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title={`Draft a message to ${customerName}`} size="md">
      <div className={styles.wrap}>
        <div className={styles.controls}>
          <Select label="Tone" options={TONE_OPTIONS} value={tone} onChange={(e) => setTone(e.target.value)} />
          <Select label="Language" options={LANGUAGE_OPTIONS} value={language} onChange={(e) => setLanguage(e.target.value)} />
        </div>

        <div className={styles.messageBox}>
          {loading ? (
            <p className={styles.loadingText}>Writing a message…</p>
          ) : (
            <p className={styles.messageText}>{message}</p>
          )}
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" icon={FiRefreshCw} onClick={generate} loading={loading}>
            Regenerate
          </Button>
          <Button icon={copied ? FiCheck : FiCopy} onClick={handleCopy} disabled={!message || loading}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
