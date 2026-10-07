import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import styles from './ChatInput.module.css';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.input}
        placeholder="Ask about your business…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
      />
      <button type="submit" className={styles.sendBtn} disabled={disabled || !value.trim()} aria-label="Send message">
        <FiSend />
      </button>
    </form>
  );
}
