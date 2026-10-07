import OpenAI from 'openai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'Missing GEMINI_API_KEY. Set it in apps/api/.env — see .env.example. Get a free key at https://aistudio.google.com (no card required). Never expose this key to the browser.'
  );
}

/**
 * Uses the OpenAI SDK pointed at Google's OpenAI-compatible Gemini
 * endpoint, so the rest of the AI service layer (tool-calling loop,
 * message generator) needs zero changes. Gemini's free tier (via
 * Google AI Studio) has no credit card requirement and doesn't expire,
 * unlike OpenAI's which now requires paid credits from the first call.
 */
export const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

// Centralized so swapping models later (e.g. to gemini-2.5-flash-lite
// for a higher free daily quota) is a one-line change.
export const AI_MODEL = 'gemini-2.5-flash';
