export function normalizePhone(value: string): string {
  return String(value ?? '').replace(/\D/g, '');
}
