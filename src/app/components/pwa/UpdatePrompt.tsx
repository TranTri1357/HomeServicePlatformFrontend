import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Đăng ký service worker và hỏi người dùng trước khi áp bản mới.
 *
 * Vì sao phải hỏi mà không tự cập nhật: service worker mới chỉ có hiệu lực sau
 * khi reload trang. Nếu tự reload, người dùng đang điền form đặt đơn hoặc đang
 * ở bước thanh toán sẽ mất sạch dữ liệu đang nhập. Bản cũ vẫn chạy bình thường
 * cho tới khi họ bấm "Tải lại".
 *
 * Mount một lần duy nhất trong AppProviders.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      // Không chặn app: thiếu service worker thì chỉ mất phần offline/cài đặt.
      console.error("[PWA] Đăng ký service worker thất bại:", error);
    },
  });

  useEffect(() => {
    if (!needRefresh) return;
    const id = toast("Đã có phiên bản mới", {
      description: "Tải lại để dùng bản mới nhất.",
      duration: Infinity,
      action: {
        label: "Tải lại",
        onClick: () => updateServiceWorker(true),
      },
      onDismiss: () => setNeedRefresh(false),
    });
    return () => {
      toast.dismiss(id);
    };
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}
