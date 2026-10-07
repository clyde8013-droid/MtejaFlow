import { buildSystemPrompt } from '../services/ai/promptBuilder.js';
import { runToolLoop } from '../services/ai/runToolLoop.js';
import { supabaseAdmin } from '../services/supabaseAdmin.js';

/**
 * POST /api/ai/chat
 * body: { message: string, conversationId?: string }
 *
 * Runs a short tool-calling loop against the AI model, scoped entirely
 * to req.businessId (set by requireAuth — never trusts client input for
 * this). Persists the conversation so the assistant has memory across turns.
 */
export async function chat(req, res, next) {
  try {
    const { message, conversationId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'A message is required.' });
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('name, currency, preferred_language')
      .eq('id', req.businessId)
      .single();
    if (businessError) throw businessError;

    // Load or create the conversation.
    let convId = conversationId;
    if (!convId) {
      const { data: conv, error: convError } = await supabaseAdmin
        .from('ai_conversations')
        .insert({ business_id: req.businessId, user_id: req.user.id, title: message.slice(0, 60) })
        .select('id')
        .single();
      if (convError) throw convError;
      convId = conv.id;
    }

    const { data: history, error: historyError } = await supabaseAdmin
      .from('ai_messages')
      .select('role, content, tool_calls')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (historyError) throw historyError;

    await supabaseAdmin
      .from('ai_messages')
      .insert({ conversation_id: convId, business_id: req.businessId, role: 'user', content: message });

    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt({
          businessName: business.name,
          currency: business.currency,
          language: business.preferred_language,
        }),
      },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const finalText = await runToolLoop(req.businessId, messages);

    await supabaseAdmin
      .from('ai_messages')
      .insert({ conversation_id: convId, business_id: req.businessId, role: 'assistant', content: finalText });

    res.json({ conversationId: convId, reply: finalText });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/insights
 *
 * Generates 2-4 short dashboard insight lines by letting the model call
 * the same business-data tools as the chat assistant, then asking it to
 * return them as a JSON array of plain strings. This replaces hardcoded
 * conditional logic on the frontend with insights actually reasoned over
 * the business's real data.
 */
export async function insights(req, res, next) {
  try {
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('name, currency, preferred_language')
      .eq('id', req.businessId)
      .single();
    if (businessError) throw businessError;

    const messages = [
      {
        role: 'system',
        content: [
          buildSystemPrompt({
            businessName: business.name,
            currency: business.currency,
            language: business.preferred_language,
          }),
          'Look at the business\'s current customers, quotes, invoices, revenue, and follow-ups using the tools available.',
          'Then respond with ONLY a JSON array of 2 to 4 short strings (no markdown, no extra text) — each one a single actionable insight or notable fact, written the way a helpful assistant would say it out loud to the owner.',
          'If there is very little data yet (e.g. no customers), return one encouraging string suggesting the next step instead of forcing insights that do not exist.',
          'Example valid response: ["You have TZS 1,200,000 in outstanding invoices.", "3 quotations worth TZS 2,400,000 have not received a response."]',
        ].join(' '),
      },
      { role: 'user', content: 'Give me today\'s business insights.' },
    ];

    const raw = await runToolLoop(req.businessId, messages);

    let parsed;
    try {
      const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, '');
      parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error('not an array');
    } catch {
      // Model didn't return clean JSON — fall back to splitting lines
      // rather than failing the whole request.
      parsed = raw
        .split('\n')
        .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 4);
    }

    res.json({ insights: parsed.length ? parsed : ["You're all caught up — nothing urgent right now."] });
  } catch (err) {
    next(err);
  }
}
