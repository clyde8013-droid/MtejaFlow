import { getCustomers } from './getCustomers.js';
import { getInvoices, getOutstandingInvoices } from './getInvoices.js';
import { getQuotes } from './getQuotes.js';
import { getRevenue } from './getRevenue.js';
import { getFollowUps } from './getFollowUps.js';

// Implementations, keyed by the name the model will call.
export const toolImplementations = {
  getCustomers,
  getInvoices,
  getOutstandingInvoices,
  getQuotes,
  getRevenue,
  getFollowUps,
};

// OpenAI function-calling schemas. Kept deliberately narrow — each tool
// returns only what it needs to, never a raw table dump.
export const toolSchemas = [
  {
    type: 'function',
    function: {
      name: 'getCustomers',
      description: "List the business's customers.",
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'inactive', 'archived'] },
          limit: { type: 'integer' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getInvoices',
      description: 'List invoices, optionally filtered by status.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['draft', 'sent', 'partially_paid', 'paid', 'overdue'] },
          limit: { type: 'integer' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getOutstandingInvoices',
      description: 'List invoices that are unpaid or partially paid, ordered by due date.',
      parameters: { type: 'object', properties: { limit: { type: 'integer' } } },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getQuotes',
      description: 'List quotations, optionally filtered by status.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
          },
          limit: { type: 'integer' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRevenue',
      description: 'Get total paid revenue for a date range (defaults to the current month).',
      parameters: {
        type: 'object',
        properties: {
          from: { type: 'string', description: 'ISO date, inclusive' },
          to: { type: 'string', description: 'ISO date, inclusive' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getFollowUps',
      description: 'List follow-ups, defaulting to pending ones ordered by due date.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'done', 'cancelled'] },
          limit: { type: 'integer' },
        },
      },
    },
  },
];
