# Home Service Booking Platform — Frontend

SPA React + Vite + TypeScript + TailwindCSS. Backend: ASP.NET Core.

## Chạy dự án

```bash
npm i                 # cài dependencies
cp .env.example .env   # tạo file env (điền VITE_API_BASE_URL, VITE_WS_URL)
npm run dev            # chạy dev server
```

Các lệnh khác:

```bash
npm run build       # build production
npm run typecheck   # kiểm tra kiểu (tsc --noEmit)
npm run lint        # ESLint
npm run format      # Prettier
```

## Quy ước gọi API (đọc trước khi nối backend)

Toàn bộ mã gọi mạng tập trung ở `src/services/api/` (interceptor tự gắn
`Bearer token`, tự refresh khi 401, có timeout). **Không dùng `fetch`/`axios`
trực tiếp trong component.**

**1. Khai báo endpoint** trong `src/services/api/<domain>.api.ts`:

```ts
import { get, post } from "./client";
import type { Booking } from "@/shared/types";

export function getBookings(): Promise<Booking[]> {
  return get<Booking[]>("/bookings");
}
export function createBooking(body: NewBooking): Promise<Booking> {
  return post<Booking>("/bookings", body);
}
```

**2. Đọc dữ liệu trong component** bằng hook `useApi` (tự lo loading/error):

```tsx
import { useApi } from "@/shared/hooks";
import { bookingApi } from "@/services/api";

const { data, loading, error, refetch } = useApi(() => bookingApi.getBookings(), {
  initialData: [], // hoặc mock để không nháy màn hình trống
});

if (loading) return <Skeleton />;      // luôn có trạng thái chờ
if (error) return <p>{error}</p>;
```

Xem mẫu hoàn chỉnh tại `src/pages/Customer/CustomerHome.tsx`.

**3. Hành động (thêm/sửa/xóa)** — báo kết quả bằng `notify` (toast):

```ts
import { notify } from "@/shared/lib";

try {
  await bookingApi.createBooking(body);
  notify.success("Đặt lịch thành công");
  refetch();
} catch (err) {
  notify.error(err); // tự trích thông điệp lỗi từ backend
}
```

## Cấu trúc thư mục

- `src/app/` — providers, routes, cấu hình cấp ứng dụng, UI kit (shadcn)
- `src/pages/` — màn hình theo vai trò (Customer / Provider / Admin)
- `src/services/api/` — lớp gọi API tập trung (client, interceptor, endpoint)
- `src/shared/` — hooks (`useApi`), lib (`notify`, `getErrorMessage`, `cn`), types, ui, auth

## PWA (cài lên màn hình chính điện thoại)

App chạy được như ứng dụng di động qua `vite-plugin-pwa`. Bộ icon sinh lại bằng
`npm run icons` (script Node thuần trong `scripts/`, không cần thư viện ngoài).

Ba điểm dễ gãy nếu sửa cấu hình:

- **`injectRegister: null` trong `vite.config.ts` là bắt buộc**, không phải tùy
  chọn. CSP `script-src 'self'` ở `vercel.json` chặn script inline mà plugin
  chèn mặc định; gỡ dòng này thì service worker im lặng không đăng ký trên
  production. Việc đăng ký do `src/app/components/pwa/UpdatePrompt.tsx` lo.
- **`/sw.js` phải giữ header `Cache-Control: max-age=0, must-revalidate`** trong
  `vercel.json`. Nếu CDN hay trình duyệt giữ bản cũ, người dùng kẹt vĩnh viễn ở
  phiên bản cũ vì service worker cũ tự phục vụ chính nó.
- **Không cache response `/api`** trong `workbox.runtimeCaching`. Hầu hết
  endpoint đi kèm `Authorization`; cache theo URL sẽ khiến tài khoản đăng nhập
  sau đọc trúng đơn/ví/hồ sơ của tài khoản trước trên cùng máy.

Lưu ý `vercel.json` không nhận comment: Vercel validate theo schema nghiêm ngặt
và từ chối mọi property lạ (kể cả khóa `"//"` quen dùng để chú thích).
