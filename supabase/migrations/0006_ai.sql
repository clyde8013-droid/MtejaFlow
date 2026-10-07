-- =========================================================
-- 0006_ai.sql
-- Conversation history for the AI Business Assistant.
-- Actual OpenAI calls happen server-side (apps/api) using the
-- service-role key; these tables just persist the transcript
-- and tool-call trace for a given business/user.
-- =========================================================

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_conversations_business on ai_conversations(business_id);
create index if not exists idx_ai_conversations_user on ai_conversations(user_id);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content text,
  tool_calls jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_messages_conversation on ai_messages(conversation_id);

alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

-- Conversations are personal within a business: a member sees only their
-- own conversations, not every teammate's chat history with the assistant.
create policy "ai_conversations_own" on ai_conversations
  for all using (is_business_member(business_id) and user_id = auth.uid())
  with check (is_business_member(business_id) and user_id = auth.uid());

create policy "ai_messages_own_conversation" on ai_messages
  for all using (
    is_business_member(business_id)
    and exists (
      select 1 from ai_conversations c
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    )
  )
  with check (
    is_business_member(business_id)
    and exists (
      select 1 from ai_conversations c
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    )
  );
