import { FiCpu, FiUser } from 'react-icons/fi';
import styles from './ChatBubble.module.css';

export default function ChatBubble({ role, content, pending }) {
  const isUser = role === 'user';

  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : ''}`}>
      <span className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAssistant}`}>
        {isUser ? <FiUser aria-hidden="true" /> : <FiCpu aria-hidden="true" />}
      </span>
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
        {pending ? (
          <span className={styles.typingDots} aria-label="Thinking">
            <span />
            <span />
            <span />
          </span>
        ) : (
          <p className={styles.text}>{content}</p>
        )}
      </div>
    </div>
  );
}
