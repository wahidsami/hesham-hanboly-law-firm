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
export function getCurrencyLabel(lang: 'en' | 'ar' = 'en'): string {
  return lang === 'ar' ? 'ريال سعودي' : 'SAR';
}

export function formatNumberOnly(amount: number | string | null | undefined, lang: 'en' | 'ar' = 'en'): string {
  if (amount === null || amount === undefined) return '—';

  let raw: number;
  if (typeof amount === 'string') {
    // 1. Normalize Arabic-Indic digits (٠-٩) to Western (0-9)
    const normalized = amount.replace(/[٠-٩]/g, d => '0123456789'[d.charCodeAt(0) - 0x0660]);
    // 2. Strip all non-numeric characters (removes Arabic letters, spaces, Western commas, and Arabic commas '٬')
    const cleanStr = normalized.replace(/[^\d.-]/g, '');
    raw = parseFloat(cleanStr);
  } else {
    raw = amount;
  }

  if (!Number.isFinite(raw)) return '—';

  const formatterOptions: Intl.NumberFormatOptions = {
    useGrouping: true,
    minimumFractionDigits: raw % 1 === 0 ? 0 : 2,
    maximumFractionDigits: raw % 1 === 0 ? 0 : 2
  };
  
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, formatterOptions).format(raw);
}

export function formatSARAmount(amount: number | string | null | undefined, lang: 'en' | 'ar' = 'en'): string {
  const numStr = formatNumberOnly(amount, lang);
  if (numStr === '—') return lang === 'ar' ? '— ريال سعودي' : '— SAR';
  return `${numStr} ${getCurrencyLabel(lang)}`;
}

