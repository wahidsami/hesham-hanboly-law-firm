/**
 * Validates a Saudi National ID or Iqama number.
 * Uses the standard Luhn algorithm (Mod 10) applied to Saudi IDs.
 * Rules:
 * - Exactly 10 digits
 * - Starts with 1 (National ID) or 2 (Iqama)
 * - Passes Luhn checksum
 */
export function validateSaudiId(idValue: string | undefined | null): boolean {
  if (!idValue) return false;
  const digits = idValue.replace(/\D/g, '');
  if (!/^[12]\d{9}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let digit = parseInt(digits.charAt(i), 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
