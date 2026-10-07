import { useCallback, useEffect, useRef, useState } from 'react';
import { FiCpu } from 'react-icons/fi';
import ChatBubble from '../../components/ai/ChatBubble';
import ChatInput from '../../components/ai/ChatInput';
import SuggestedPrompts from '../../components/ai/SuggestedPrompts';
import ConversationSidebar from '../../components/ai/ConversationSidebar';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/ToastProvider';
import {
  listConversations,
  getConversationMessages,
  sendChatMessage,
} from '../../services/aiAssistantService';
import styles from './AIAssistantPage.module.css';

export default function AIAssistantPage() {
  const { business } = useBusiness();
  const { user } = useAuth();
  const { notify } = useToast();

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);

  const loadConversations = useCallback(async () => {
    if (!business || !user) return;
    setConversationsLoading(true);
    try {
      const data = await listConversations(business.id, user.id);
      setConversations(data);
    } catch {
      // Non-fatal — the chat itself still works without history loaded.
    } finally {
      setConversationsLoading(false);
    }
  }, [business, user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
  }

  async function openConversation(id) {
    setActiveConversationId(id);
    try {
      const data = await getConversationMessages(id);
      setMessages(data);
    } catch (err) {
      notify(err.message || 'Could not load that conversation.', { type: 'error' });
    }
  }

  async function handleSend(text) {
    const userMessage = { id: `local-${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const res = await sendChatMessage(text, activeConversationId);
      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: res.reply }]);

      if (!activeConversationId) {
        setActiveConversationId(res.conversationId);
        loadConversations();
      }
    } catch (err) {
      notify(err.message || 'Could not reach the AI assistant. Is the API server running?', { type: 'error' });
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={openConversation}
        onNew={startNewChat}
        loading={conversationsLoading}
      />

      <div className={styles.chatPane}>
        <div className={styles.messages} ref={scrollRef}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FiCpu aria-hidden="true" />
              </div>
              <h2 className={styles.emptyTitle}>Ask MtejaFlow anything about your business</h2>
              <p className={styles.emptySub}>
                I can look at your customers, quotes, invoices, and follow-ups to answer in plain language.
              </p>
              <SuggestedPrompts onSelect={handleSend} />
            </div>
          ) : (
            <div className={styles.messageList}>
              {messages.map((m) => (
                <ChatBubble key={m.id} role={m.role} content={m.content} />
              ))}
              {sending && <ChatBubble role="assistant" pending />}
            </div>
          )}
        </div>

        <div className={styles.inputWrap}>
          <ChatInput onSend={handleSend} disabled={sending} />
        </div>
      </div>
    </div>
  );
}
