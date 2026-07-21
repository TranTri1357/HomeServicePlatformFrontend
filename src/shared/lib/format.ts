
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}


export function formatVndCompact(amount: number): string {
  if (!amount) return "";

  if (Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000;
    
    const text = Math.abs(millions) >= 10 ? Math.round(millions).toString() : millions.toFixed(1);
    return `${text.replace(".", ",")}Tr`;
  }

  if (Math.abs(amount) >= 1_000) return `${Math.round(amount / 1_000)}K`;

  return amount.toString();
}


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
