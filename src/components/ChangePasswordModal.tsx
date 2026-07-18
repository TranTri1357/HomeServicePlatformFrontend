import { useState } from "react";
import { Loader2, Lock, X } from "lucide-react";
import { authApi } from "@/services/api";
import { notify, getErrorMessage } from "@/shared/lib";

/**
 * Modal đổi mật khẩu (dùng chung cho hồ sơ Khách hàng & Đối tác).
 * Gọi POST /api/Auth/change-password; UserId lấy từ token phía server.
 */
export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const submit = async () => {
    setError(null);
    if (!oldPassword) return setError("Vui lòng nhập mật khẩu hiện tại.");
    if (newPassword.length < 6) return setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    if (newPassword === oldPassword)
      return setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
    if (newPassword !== confirmPassword)
      return setError("Xác nhận mật khẩu không khớp với mật khẩu mới.");

    setSubmitting(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword, confirmPassword });
      notify.success("Đổi mật khẩu thành công.");
      reset();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-foreground">Đổi mật khẩu</h3>
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Mật khẩu hiện tại"
            autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-xl border bg-muted text-sm outline-none focus:border-blue-600"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-xl border bg-muted text-sm outline-none focus:border-blue-600"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-xl border bg-muted text-sm outline-none focus:border-blue-600"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={close}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
