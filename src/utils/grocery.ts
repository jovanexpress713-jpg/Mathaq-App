/**
 * Shared grocery-account helpers.
 */

/** Keep only decimal digits so phone comparisons ignore spaces and punctuation. */
export function normalizePhone(value: string): string {
  return String(value ?? '').replace(/\D/g, '');
}
