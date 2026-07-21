import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";


export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      
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
