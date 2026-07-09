/** Format a VND amount with thousands separators, e.g. 90000 → "90.000". */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}
