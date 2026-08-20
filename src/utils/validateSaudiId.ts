/**
 * Validates a Saudi National ID or Iqama number.
 * Uses the standard Luhn algorithm (Mod 10) applied to Saudi IDs.
 * Rules:
 * - Exactly 10 digits
 * - Starts with 1 (National ID) or 2 (Iqama)
 * - Passes Luhn checksum
 */
export function validateSaudiId(idValue: string | undefined | null): { valid: boolean; error?: 'INVALID_LENGTH' | 'INVALID_PREFIX' | 'INVALID_CHECKSUM' | 'INVALID_FORMAT' } {
  if (!idValue) return { valid: false, error: 'INVALID_FORMAT' };
  
  const digits = idValue.replace(/\s/g, ''); // only strip spaces, keeping alpha to catch them
  
  if (!/^\d+$/.test(digits)) return { valid: false, error: 'INVALID_FORMAT' };
  if (digits.length !== 10) return { valid: false, error: 'INVALID_LENGTH' };
  if (!/^[12]/.test(digits)) return { valid: false, error: 'INVALID_PREFIX' };

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let digit = parseInt(digits.charAt(i), 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, error: 'INVALID_CHECKSUM' };
  }
  
  return { valid: true };
}
