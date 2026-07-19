import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Siren, MapPin, Loader2, Check, X } from "lucide-react";
import type { Screen } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { connectEmergencyTasker, type EmergencyRequestPush } from "@/services/realtime/bookingHub";
import { formatVnd, notify, getErrorMessage } from "@/shared/lib";

// Lazy: chỉ tải Leaflet khi có đơn khẩn thực sự hiện lên, thay vì kèm vào bundle
// của layout thợ (listener luôn được mount).
const EmergencyMiniMap = lazy(() =>
  import("./EmergencyMiniMap").then((m) => ({ default: m.EmergencyMiniMap })),
);

/** Short repeating beep via Web Audio API — no audio file needed. */
function useAlarm() {
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (ctxRef.current) {
      void ctxRef.current.close();
      ctxRef.current = null;
    }
  };

  const start = () => {
    stop();
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    void ctx.resume();
    const beep = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    };
    beep();
    timerRef.current = window.setInterval(beep, 900);
  };

  useEffect(() => stop, []);
  return { start, stop };
}

/**
 * Global tasker-side listener for emergency requests. Mounted once in the
 * provider layout: opens a full-screen 30s countdown modal with an alarm sound,
 * a mini-map of the customer's location, and big Accept / Reject buttons.
 */
export function EmergencyListener({ onNavigate }: { onNavigate: (s: Screen, d?: object) => void }) {
  const [req, setReq] = useState<EmergencyRequestPush | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [acting, setActing] = useState(false);
  const alarm = useAlarm();

  // Các đơn thợ này đã CHỦ ĐỘNG từ chối. Server đã lọc chúng khỏi vòng nới bán kính, nhưng vẫn còn
  // một khe hở: thợ bấm từ chối ở giây 29 trong khi khách re-broadcast ở giây 30 — nếu truy vấn
  // quét thợ chạy trước khi bản ghi từ chối kịp commit thì push vẫn tới. Chặn nốt ở client.
  const declinedRef = useRef<Set<number>>(new Set());

  // Connect to the hub once while this layout is mounted.
  useEffect(() => {
    let dispose: (() => void) | null = null;
    connectEmergencyTasker({
      onRequest: (incoming) =>
        setReq((prev) => {
          if (declinedRef.current.has(incoming.bookingId)) return prev; // đã từ chối đơn này
          return prev ?? incoming; // ignore new while one is active
        }),
      onCancelled: (bookingId) =>
        setReq((prev) => (prev && prev.bookingId === bookingId ? null : prev)),
    })
      .then((d) => {
        dispose = d;
      })
      .catch(() => {
        /* hub unavailable — modal simply won't trigger */
      });
    return () => dispose?.();
  }, []);

  // On a new request: start the alarm and run a deadline-based countdown. Using a
  // fixed deadline (not a per-tick "secondsLeft <= 0" check) avoids an instant
  // auto-decline from reading the still-zero initial countdown on the first render.
  useEffect(() => {
    if (!req) {
      alarm.stop();
      return;
    }
    alarm.start();
    const deadline = Date.now() + req.expiresInSeconds * 1000;
    setSecondsLeft(req.expiresInSeconds);
    const interval = window.setInterval(() => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        window.clearInterval(interval);
        setSecondsLeft(0);
        void handleDecline(true);
      } else {
        setSecondsLeft(remaining);
      }
    }, 500);
    return () => {
      window.clearInterval(interval);
      alarm.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req?.bookingId]);

  const close = () => {
    alarm.stop();
    setReq(null);
  };

  const handleAccept = async () => {
    if (!req) return;
    setActing(true);
    try {
      await taskerApi.acceptJob(req.bookingId);
      close();
      notify.success("Đã nhận đơn khẩn cấp!");
      onNavigate("providerJobManagement");
    } catch (err) {
      notify.error(getErrorMessage(err));
      close();
    } finally {
      setActing(false);
    }
  };

  const handleDecline = async (timedOut = false) => {
    if (!req) return;
    const id = req.bookingId;
    // Chỉ ghi nhớ khi thợ CHỦ ĐỘNG từ chối — hết giờ thì vẫn cho phép mời lại ở vòng sau.
    if (!timedOut) declinedRef.current.add(id);
    close();
    try {
      await taskerApi.declineEmergencyJob(id, timedOut);
    } catch {
      /* đơn đã bị hủy/hết hạn — không ảnh hưởng gì tới thợ, bỏ qua */
    }
    if (timedOut) notify.error("Bạn đã bỏ lỡ một đơn khẩn cấp.");
  };

  if (!req) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header with countdown */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
            <Siren className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-extrabold text-lg leading-tight">ĐƠN KHẨN CẤP</p>
            <p className="text-white/80 text-xs">Có khách cần bạn ngay bây giờ</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <span className="text-2xl font-extrabold text-red-500">{secondsLeft}</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{req.serviceName}</span>
            <span className="text-lg font-extrabold text-blue-600">{formatVnd(req.amount)}đ</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>
              {req.addressLine}
              <span className="text-red-500 font-semibold"> · cách {req.distanceKm}km</span>
            </span>
          </div>

          {/* Mini map of the customer's location */}
          <div className="rounded-xl overflow-hidden border border-border" style={{ height: 150 }}>
            <Suspense
              fallback={
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <EmergencyMiniMap latitude={req.latitude} longitude={req.longitude} />
            </Suspense>
          </div>

          {/* Big action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => void handleDecline(false)}
              disabled={acting}
              className="py-4 rounded-2xl border-2 border-red-200 text-red-600 font-bold text-base hover:bg-red-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" /> Từ chối
            </button>
            <button
              onClick={() => void handleAccept()}
              disabled={acting}
              className="py-4 rounded-2xl bg-green-600 text-white font-bold text-base hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
            >
              {acting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Chấp nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
