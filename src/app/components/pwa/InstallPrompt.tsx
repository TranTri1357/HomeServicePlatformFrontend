import { useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";

/** Sự kiện Chrome/Edge bắn ra khi trang đủ điều kiện cài đặt. Chưa có trong lib.dom. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DAYS = 7;
/** Đợi một lát rồi mới mời cài, tránh chặn ngay khi người dùng vừa mở app. */
const SHOW_DELAY_MS = 8000;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari không hỗ trợ display-mode, dùng cờ riêng của Apple.
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function wasDismissedRecently() {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const at = Number(raw);
  if (!Number.isFinite(at)) return false;
  return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Mời người dùng thêm app vào màn hình chính.
 *
 * Hai đường đi khác nhau:
 * - Android/Chrome/Edge: bắt `beforeinstallprompt`, gọi prompt() để hiện hộp
 *   thoại cài đặt thật của hệ điều hành.
 * - iOS/Safari: KHÔNG có API cài đặt, chỉ còn cách hướng dẫn thao tác tay
 *   (Chia sẻ → Thêm vào MH chính).
 *
 * Mount một lần trong AppProviders.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const onBeforeInstall = (e: Event) => {
      // Chặn banner mặc định của trình duyệt để tự chọn thời điểm hiện.
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setTimeout(() => setDeferred(evt), SHOW_DELAY_MS);
    };
    const onInstalled = () => {
      setDeferred(null);
      setShowIOSHint(false);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    let iosTimer: number | undefined;
    if (isIOS()) iosTimer = window.setTimeout(() => setShowIOSHint(true), SHOW_DELAY_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDeferred(null);
    setShowIOSHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    // Sự kiện chỉ dùng được một lần; bỏ đi dù người dùng chọn gì.
    setDeferred(null);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!deferred && !showIOSHint) return null;

  return (
    <div
      className="fixed left-3 right-3 z-[60] mx-auto max-w-md rounded-2xl border border-border bg-white p-4 shadow-lg"
      // Nhấc lên trên bottom nav (~64px) và vùng gesture của máy.
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)" }}
      role="dialog"
      aria-label="Cài đặt ứng dụng"
    >
      <button
        onClick={dismiss}
        aria-label="Đóng"
        className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <img
          src="/icons/icon-192.png"
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl"
          width={44}
          height={44}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold">Cài HomeService lên máy</p>
          {deferred ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Mở nhanh từ màn hình chính, chạy toàn màn hình như ứng dụng.
            </p>
          ) : (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              Bấm
              <Share className="inline h-3.5 w-3.5" aria-label="nút Chia sẻ" />
              <span className="font-medium">Chia sẻ</span>
              rồi chọn
              <Plus className="inline h-3.5 w-3.5" aria-hidden />
              <span className="font-medium">Thêm vào MH chính</span>
            </p>
          )}
        </div>
      </div>

      {deferred && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={dismiss}
            className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground"
          >
            Để sau
          </button>
          <button
            onClick={install}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            Cài đặt
          </button>
        </div>
      )}
    </div>
  );
}
