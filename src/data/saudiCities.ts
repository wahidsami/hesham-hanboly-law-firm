export interface SaudiCityOption {
  readonly value: string;
  readonly label: string;
  readonly en: string;
  readonly ar: string;
}

export const SAUDI_CITIES: readonly SaudiCityOption[] = [
  { value: 'Riyadh', label: 'Riyadh - الرياض', en: 'Riyadh', ar: 'الرياض' },
  { value: 'Jeddah', label: 'Jeddah - جدة', en: 'Jeddah', ar: 'جدة' },
  { value: 'Makkah', label: 'Makkah - مكة المكرمة', en: 'Makkah', ar: 'مكة المكرمة' },
  { value: 'Madinah', label: 'Madinah - المدينة المنورة', en: 'Madinah', ar: 'المدينة المنورة' },
  { value: 'Dammam', label: 'Dammam - الدمام', en: 'Dammam', ar: 'الدمام' },
  { value: 'Al Khobar', label: 'Al Khobar - الخبر', en: 'Al Khobar', ar: 'الخبر' },
  { value: 'Taif', label: 'Taif - الطائف', en: 'Taif', ar: 'الطائف' },
  { value: 'Abha', label: 'Abha - أبها', en: 'Abha', ar: 'أبها' },
  { value: 'Tabuk', label: 'Tabuk - تبوك', en: 'Tabuk', ar: 'تبوك' },
  { value: 'Buraydah', label: 'Buraydah - بريدة', en: 'Buraydah', ar: 'بريدة' },
  { value: 'Hail', label: 'Hail - حائل', en: 'Hail', ar: 'حائل' },
  { value: 'Jazan', label: 'Jazan - جازان', en: 'Jazan', ar: 'جازان' },
  { value: 'Najran', label: 'Najran - نجران', en: 'Najran', ar: 'نجران' },
  { value: 'Jubail', label: 'Jubail - الجبيل', en: 'Jubail', ar: 'الجبيل' },
  { value: 'Yanbu', label: 'Yanbu - ينبع', en: 'Yanbu', ar: 'ينبع' },
  { value: 'Al Ahsa', label: 'Al Ahsa - الأحساء', en: 'Al Ahsa', ar: 'الأحساء' },
] as const;
