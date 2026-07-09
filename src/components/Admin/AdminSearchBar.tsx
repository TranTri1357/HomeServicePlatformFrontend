import { Search, X } from "lucide-react";

interface AdminSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
}: AdminSearchBarProps) {
  return (
    <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 flex-1 min-w-0">
      <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm focus:outline-none"
        placeholder={placeholder}
      />
      {value && (
        <button onClick={() => onChange("")}>
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
