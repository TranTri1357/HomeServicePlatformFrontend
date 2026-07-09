/** Format a VND amount with thousands separators, e.g. 90000 → "90.000". */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

/** Format an ISO date string as dd/MM/yyyy (vi-VN). Returns "" on invalid input. */
export function formatDateVn(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
