/**
 * Validates a Saudi National ID or Iqama number format.
 * Rules:
 * - Exactly 10 digits
 * - Starts with 1 (National ID) or 2 (Iqama)
 */
export function validateSaudiId(idValue: string | undefined | null): { valid: boolean; error?: 'INVALID_LENGTH' | 'INVALID_PREFIX' | 'INVALID_FORMAT' } {
  if (!idValue) return { valid: false, error: 'INVALID_FORMAT' };
  
  const digits = idValue.replace(/\s/g, '');
  
  if (!/^\d+$/.test(digits)) return { valid: false, error: 'INVALID_FORMAT' };
  if (digits.length !== 10) return { valid: false, error: 'INVALID_LENGTH' };
  if (!/^[12]/.test(digits)) return { valid: false, error: 'INVALID_PREFIX' };

  return { valid: true };
}
