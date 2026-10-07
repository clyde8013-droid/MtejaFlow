export function formatMoney(amount, currency = 'TZS') {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Unknown/unsupported currency code — fall back to a plain label.
    return `${currency} ${value.toLocaleString()}`;
  }
}

export function formatDate(dateStr, locale = 'en') {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'sw' ? 'sw-TZ' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
