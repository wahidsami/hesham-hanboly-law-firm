/**
 * Formats a numeric or string SAR amount for display.
 *
 * Examples:
 *   formatSARAmount(2300)        -> "2,300 SAR"
 *   formatSARAmount(11500)       -> "11,500 SAR"
 *   formatSARAmount("2300")      -> "2,300 SAR"
 *   formatSARAmount("2,300 SAR") -> "2,300 SAR"   (already-formatted strings pass through)
 *   formatSARAmount(null)        -> "— SAR"
 *   formatSARAmount(0)           -> "0 SAR"
 */
export function formatSARAmount(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '— SAR';

  // If it's a string that already contains 'SAR', return as-is (already formatted)
  if (typeof amount === 'string' && amount.includes('SAR')) {
    return amount.trim();
  }

  // Parse to number
  const raw = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;

  if (!Number.isFinite(raw)) return '— SAR';

  // Format with thousands separator, no decimal places for whole numbers
  const formatted = raw % 1 === 0
    ? raw.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `${formatted} SAR`;
}
