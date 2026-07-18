import { lazy } from "react";
import { Loader2 } from "lucide-react";

/**
 * Các màn được tải trễ (code-split) và spinner dùng chung cho `<Suspense>`.
 *
 * Tách khỏi `renderScreen.tsx` vì file đó chỉ export hàm điều phối (không phải
 * component) — để chung sẽ phá Fast Refresh của Vite.
 */

// Màn bản đồ thợ kéo theo Leaflet (~150KB): tách chunk riêng, chỉ tải khi khách
// thực sự mở màn tìm thợ trên bản đồ. Xem thêm `manualChunks` trong vite.config.ts.
export const TechnicianMap = lazy(() =>
  import("@/pages/Technician/TechnicianMap").then((m) => ({ default: m.TechnicianMap })),
);

/** Spinner hiển thị trong lúc chunk của màn đang được tải về. */
export function ScreenFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}
