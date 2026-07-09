import { AlertCircle, CheckCircle } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({ title, message, confirmLabel = "Xác nhận", onConfirm, onCancel, danger = true }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? "bg-red-100" : "bg-blue-100"}`}>
          {danger ? <AlertCircle className="w-6 h-6 text-red-600" /> : <CheckCircle className="w-6 h-6 text-blue-600" />}
        </div>
        <h3 className="text-lg font-bold text-center text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">Hủy</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
