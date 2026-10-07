import { openai, AI_MODEL } from './openaiClient.js';
import { toolImplementations, toolSchemas } from './tools/index.js';

const MAX_TOOL_ROUNDS = 4;

/**
 * Runs the tool-calling loop against the AI model, always scoping tool
 * calls to `businessId` (never trusting anything the model or client
 * supplies for that). Returns the model's final text response once it
 * stops requesting tools or MAX_TOOL_ROUNDS is hit.
 *
 * Shared by the chat endpoint and the dashboard insights endpoint so
 * both get the same tool access and guardrails without duplicating
 * the loop itself.
 */
export async function runToolLoop(businessId, messages) {
  const workingMessages = [...messages];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: workingMessages,
      tools: toolSchemas,
    });

    const choice = completion.choices[0].message;

    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      return choice.content || '';
    }

    workingMessages.push(choice);

    for (const call of choice.tool_calls) {
      const fn = toolImplementations[call.function.name];
      let result;
      try {
        const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        result = fn ? await fn(businessId, args) : { error: 'Unknown tool' };
      } catch (err) {
        result = { error: err.message };
      }
      workingMessages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return '';
}
