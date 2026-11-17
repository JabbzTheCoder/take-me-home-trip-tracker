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

export function isTripCancelledOrPaused(status) {
  if (!status) return false;
  const s = String(status).toLowerCase().trim();
  return (
    s === 'deferred' ||
    s === 'cancelled' ||
    s === 'paused' ||
    s === 'cancelled_paused' ||
    s === 'paused_cancelled'
  );
}

export function getTripStatusLabel(status) {
  return isTripCancelledOrPaused(status) ? 'Cancelled / Paused' : 'Completed';
}
