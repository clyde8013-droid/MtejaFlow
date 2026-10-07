import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const INK = rgb(0.106, 0.098, 0.188); // matches --color-ink
const PRIMARY = rgb(0.239, 0.208, 0.455); // matches --color-primary
const MUTED = rgb(0.42, 0.4, 0.55);
const BORDER = rgb(0.89, 0.88, 0.85);

/**
 * Renders a quote or invoice as a branded A4 PDF and returns raw bytes.
 * `doc` is the quote/invoice row (with camel-ish fields normalized by the
 * caller), `items` is its line items, `business` is the owning business.
 */
export async function renderDocumentPdf({ kind, doc, items, business, customer }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;
  const marginX = 50;

  // Header
  page.drawText(business.name || 'Your Business', { x: marginX, y, size: 18, font: fontBold, color: PRIMARY });
  page.drawText(kind === 'invoice' ? 'INVOICE' : 'QUOTATION', {
    x: width - marginX - 120,
    y,
    size: 16,
    font: fontBold,
    color: INK,
  });
  y -= 20;
  if (business.address) {
    page.drawText(business.address, { x: marginX, y, size: 9, font, color: MUTED });
  }
  page.drawText(`#${doc.number}`, { x: width - marginX - 120, y, size: 10, font, color: MUTED });
  y -= 14;
  if (business.phone || business.email) {
    page.drawText([business.phone, business.email].filter(Boolean).join(' · '), {
      x: marginX,
      y,
      size: 9,
      font,
      color: MUTED,
    });
  }

  y -= 40;
  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: BORDER });
  y -= 24;

  // Bill to
  page.drawText('Billed to', { x: marginX, y, size: 9, font: fontBold, color: MUTED });
  y -= 14;
  page.drawText(customer?.full_name || 'Customer', { x: marginX, y, size: 11, font: fontBold, color: INK });
  y -= 14;
  if (customer?.company) {
    page.drawText(customer.company, { x: marginX, y, size: 9, font, color: MUTED });
    y -= 12;
  }
  if (customer?.phone) {
    page.drawText(customer.phone, { x: marginX, y, size: 9, font, color: MUTED });
    y -= 12;
  }

  // Date / due / expiry, right-aligned block
  const rightX = width - marginX - 160;
  let ry = height - 140;
  const dateLabel = kind === 'invoice' ? 'Due date' : 'Valid until';
  const dateValue = kind === 'invoice' ? doc.dueDate : doc.expiresAt;
  page.drawText('Date issued', { x: rightX, y: ry, size: 9, font: fontBold, color: MUTED });
  page.drawText(new Date(doc.createdAt).toLocaleDateString(), { x: rightX + 90, y: ry, size: 9, font, color: INK });
  ry -= 14;
  if (dateValue) {
    page.drawText(dateLabel, { x: rightX, y: ry, size: 9, font: fontBold, color: MUTED });
    page.drawText(new Date(dateValue).toLocaleDateString(), { x: rightX + 90, y: ry, size: 9, font, color: INK });
  }

  y -= 30;

  // Line items table header
  const colX = { desc: marginX, qty: 330, price: 390, total: 470 };
  page.drawRectangle({ x: marginX, y: y - 6, width: width - marginX * 2, height: 22, color: rgb(0.95, 0.945, 0.925) });
  page.drawText('Description', { x: colX.desc + 6, y: y, size: 9, font: fontBold, color: MUTED });
  page.drawText('Qty', { x: colX.qty, y, size: 9, font: fontBold, color: MUTED });
  page.drawText('Price', { x: colX.price, y, size: 9, font: fontBold, color: MUTED });
  page.drawText('Total', { x: colX.total, y, size: 9, font: fontBold, color: MUTED });
  y -= 26;

  for (const item of items) {
    page.drawText(truncate(item.description, 48), { x: colX.desc, y, size: 9, font, color: INK });
    page.drawText(String(item.quantity), { x: colX.qty, y, size: 9, font, color: INK });
    page.drawText(formatAmount(item.unit_price, doc.currency), { x: colX.price, y, size: 9, font, color: INK });
    page.drawText(formatAmount(item.line_total, doc.currency), { x: colX.total, y, size: 9, font, color: INK });
    y -= 20;
    if (y < 160) break; // MVP: single page; pagination is a later enhancement
  }

  y -= 10;
  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: BORDER });
  y -= 20;

  drawTotalsRow(page, 'Subtotal', doc.subtotal, doc.currency, { font, y, width, marginX });
  y -= 16;
  if (Number(doc.discount) > 0) {
    drawTotalsRow(page, 'Discount', -doc.discount, doc.currency, { font, y, width, marginX });
    y -= 16;
  }
  if (Number(doc.tax) > 0) {
    drawTotalsRow(page, 'Tax', doc.tax, doc.currency, { font, y, width, marginX });
    y -= 16;
  }
  drawTotalsRow(page, 'Total', doc.total, doc.currency, {
    font: fontBold,
    y,
    width,
    marginX,
    color: PRIMARY,
    size: 12,
  });

  if (doc.notes) {
    y -= 40;
    page.drawText('Notes', { x: marginX, y, size: 9, font: fontBold, color: MUTED });
    y -= 14;
    page.drawText(truncate(doc.notes, 100), { x: marginX, y, size: 9, font, color: INK });
  }

  page.drawText('Generated by MtejaFlow', {
    x: marginX,
    y: 30,
    size: 8,
    font,
    color: MUTED,
  });

  return pdfDoc.save();
}

function drawTotalsRow(page, label, amount, currency, { font, y, width, marginX, color = INK, size = 10 }) {
  page.drawText(label, { x: width - marginX - 160, y, size, font, color });
  page.drawText(formatAmount(amount, currency), { x: width - marginX - 80, y, size, font, color });
}

function formatAmount(amount, currency) {
  const value = Number(amount) || 0;
  return `${currency || ''} ${value.toLocaleString()}`.trim();
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}
