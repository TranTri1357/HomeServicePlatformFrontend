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
