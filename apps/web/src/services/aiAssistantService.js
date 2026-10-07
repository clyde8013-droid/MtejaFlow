import { supabase } from './supabaseClient';
import { apiClient } from './apiClient';

/**
 * Conversations and their messages are read directly via Supabase —
 * RLS already scopes ai_conversations/ai_messages to the current user's
 * own conversations within their business, so there's no need to round
 * -trip through the backend just to read history.
 *
 * Sending a message always goes through the backend (/api/ai/chat),
 * since that's where the model call and business-data tool access
 * happen securely, server-side.
 */

export async function listConversations(businessId, userId) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id, title, created_at, updated_at')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}

export async function getConversationMessages(conversationId) {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/** Sends a message and returns { conversationId, reply }. */
export async function sendChatMessage(message, conversationId) {
  return apiClient.post('/api/ai/chat', { message, conversationId });
}
