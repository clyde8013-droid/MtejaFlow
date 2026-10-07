import { FiPlus, FiMessageCircle } from 'react-icons/fi';
import styles from './ConversationSidebar.module.css';

function relativeLabel(dateStr) {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ConversationSidebar({ conversations, activeId, onSelect, onNew, loading }) {
  return (
    <aside className={styles.wrap}>
      <button className={styles.newBtn} onClick={onNew}>
        <FiPlus aria-hidden="true" /> New chat
      </button>

      <div className={styles.list}>
        {loading ? (
          <p className={styles.emptyText}>Loading…</p>
        ) : conversations.length === 0 ? (
          <p className={styles.emptyText}>Your past conversations will show up here.</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              className={`${styles.item} ${c.id === activeId ? styles.itemActive : ''}`}
              onClick={() => onSelect(c.id)}
            >
              <FiMessageCircle className={styles.itemIcon} aria-hidden="true" />
              <span className={styles.itemText}>
                <span className={styles.itemTitle}>{c.title || 'Conversation'}</span>
                <span className={styles.itemDate}>{relativeLabel(c.updated_at)}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
