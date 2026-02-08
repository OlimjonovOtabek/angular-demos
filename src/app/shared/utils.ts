export function parseNumber(value: string | null): number | null {
  if (value?.trim() === '' || value == null) {
    return null;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
