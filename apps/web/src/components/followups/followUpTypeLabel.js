const TYPE_LABELS = {
  quote_followup: 'Quote follow-up',
  payment_reminder: 'Payment reminder',
  check_in: 'Check-in',
  sales_followup: 'Sales follow-up',
  general: 'Follow-up',
};

export default function followUpTypeLabel(type) {
  return TYPE_LABELS[type] || 'Follow-up';
}
