import { supabaseAdmin } from '../services/supabaseAdmin.js';
import { renderDocumentPdf } from '../services/pdf/renderDocumentPdf.js';

async function loadDocument(kind, id, businessId) {
  const table = kind === 'invoice' ? 'invoices' : 'quotes';
  const itemsTable = kind === 'invoice' ? 'invoice_items' : 'quote_items';
  const numberField = kind === 'invoice' ? 'invoice_number' : 'quote_number';

  const { data: row, error } = await supabaseAdmin
    .from(table)
    .select('*, customers(*)')
    .eq('id', id)
    .eq('business_id', businessId) // always scoped — never trust the id alone
    .single();
  if (error || !row) return null;

  const { data: items, error: itemsError } = await supabaseAdmin
    .from(itemsTable)
    .select('*')
    .eq(kind === 'invoice' ? 'invoice_id' : 'quote_id', id)
    .order('sort_order', { ascending: true });
  if (itemsError) throw itemsError;

  const { data: business, error: businessError } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  if (businessError) throw businessError;

  return {
    doc: {
      number: row[numberField],
      subtotal: row.subtotal,
      discount: row.discount,
      tax: row.tax,
      total: row.total,
      currency: row.currency,
      notes: row.notes,
      createdAt: row.created_at,
      dueDate: row.due_date,
      expiresAt: row.expires_at,
    },
    items,
    business,
    customer: row.customers,
  };
}

/** GET /api/pdf/quotes/:id */
export async function quotePdf(req, res, next) {
  try {
    const bundle = await loadDocument('quote', req.params.id, req.businessId);
    if (!bundle) return res.status(404).json({ message: 'Quote not found.' });

    const bytes = await renderDocumentPdf({ kind: 'quote', ...bundle });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quote-${bundle.doc.number}.pdf"`);
    res.send(Buffer.from(bytes));
  } catch (err) {
    next(err);
  }
}

/** GET /api/pdf/invoices/:id */
export async function invoicePdf(req, res, next) {
  try {
    const bundle = await loadDocument('invoice', req.params.id, req.businessId);
    if (!bundle) return res.status(404).json({ message: 'Invoice not found.' });

    const bytes = await renderDocumentPdf({ kind: 'invoice', ...bundle });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${bundle.doc.number}.pdf"`);
    res.send(Buffer.from(bytes));
  } catch (err) {
    next(err);
  }
}
