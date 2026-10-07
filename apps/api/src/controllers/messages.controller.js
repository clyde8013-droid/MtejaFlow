import { openai, AI_MODEL } from '../services/ai/openaiClient.js';

const ALLOWED_TONES = ['professional_friendly', 'formal', 'casual'];
const ALLOWED_LANGUAGES = ['en', 'sw'];

/**
 * POST /api/messages/generate
 * body: { customerName, situation, tone, language }
 *
 * Generates a single WhatsApp-style customer message. No tool-calling
 * loop needed here — it's a structured prompt-to-text task.
 */
export async function generateMessage(req, res, next) {
  try {
    const { customerName, situation, tone = 'professional_friendly', language = 'en' } = req.body;

    if (!customerName || !situation) {
      return res.status(400).json({ message: 'customerName and situation are required.' });
    }
    if (!ALLOWED_TONES.includes(tone) || !ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({ message: 'Invalid tone or language.' });
    }

    const languageLabel = language === 'sw' ? 'Swahili' : 'English';
    const toneLabel = tone.replace('_', ' and ');

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You write short, natural WhatsApp messages from a small business to a customer. ' +
            'No markdown, no subject line — just the message text a business owner would actually send.',
        },
        {
          role: 'user',
          content: `Write a ${toneLabel} message in ${languageLabel} to a customer named ${customerName}. Situation: ${situation}`,
        },
      ],
    });

    const text = completion.choices[0].message.content?.trim() || '';
    res.json({ message: text });
  } catch (err) {
    next(err);
  }
}
