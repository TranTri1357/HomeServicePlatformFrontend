import { ChevronLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function TopBar({ title, onBack, actions }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-border sticky top-0 z-10">
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold text-foreground">{title}</h1>
      {actions}
    </div>
  );
}
