/**
 * Formats a numeric or string SAR amount for display with locale awareness.
 *
 * Examples (English):
 *   formatSARAmount(2300, 'en')        -> "2,300 SAR"
 *   formatSARAmount("11,500 SAR", 'en') -> "11,500 SAR"
 *
 * Examples (Arabic):
 *   formatSARAmount(2300, 'ar')        -> "٢٬٣٠٠ ريال"
 *   formatSARAmount("11,500 SAR", 'ar') -> "١١٬٥٠٠ ريال"
 */
export function formatSARAmount(amount: number | string | null | undefined, lang: 'en' | 'ar' = 'en'): string {
  if (amount === null || amount === undefined) return lang === 'ar' ? '— ريال' : '— SAR';

  // Extract the numeric value from strings like "11,500 SAR"
  let raw: number;
  if (typeof amount === 'string') {
    // Remove anything that is not a digit, minus sign, or decimal point
    // This safely strips commas, 'SAR', and spaces.
    const cleanStr = amount.replace(/[^\d.-]/g, '');
    raw = parseFloat(cleanStr);
  } else {
    raw = amount;
  }

  if (!Number.isFinite(raw)) return lang === 'ar' ? '— ريال' : '— SAR';

  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const currencyLabel = lang === 'ar' ? 'ريال' : 'SAR';

  // Format with thousands separator, no decimal places for whole numbers
  const formatted = raw % 1 === 0
    ? new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(raw)
    : new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(raw);

  return `${formatted} ${currencyLabel}`;
}

