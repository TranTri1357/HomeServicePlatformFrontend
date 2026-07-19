/** Format a VND amount with thousands separators, e.g. 90000 → "90.000". */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

/**
 * Rút gọn số tiền để nhét vừa nhãn hẹp (đầu cột biểu đồ):
 * 0 → "", 90.000 → "90K", 180.500 → "181K", 3.699.200 → "3,7Tr".
 * Dùng cho hiển thị phụ; số đầy đủ vẫn xem được qua tooltip.
 */
export function formatVndCompact(amount: number): string {
  if (!amount) return "";

  if (Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000;
    // Từ 10 triệu trở lên bỏ phần thập phân cho đỡ rối.
    const text = Math.abs(millions) >= 10 ? Math.round(millions).toString() : millions.toFixed(1);
    return `${text.replace(".", ",")}Tr`;
  }

  if (Math.abs(amount) >= 1_000) return `${Math.round(amount / 1_000)}K`;

  return amount.toString();
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
