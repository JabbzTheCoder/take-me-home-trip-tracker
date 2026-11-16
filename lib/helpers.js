export function formatCurrency(amount, currency = 'R') {
  const val = parseFloat(amount) || 0;
  return `${currency} ${val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(val) {
  return (parseFloat(val) || 0).toLocaleString('en-ZA');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
