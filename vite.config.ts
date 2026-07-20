import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt': service worker mới KHÔNG tự kích hoạt. Người dùng đang giữa
      // luồng đặt đơn mà app tự reload thì mất dữ liệu form — ta hỏi trước
      // (xem UpdatePrompt trong src/app/components/pwa).
      registerType: 'prompt',
      // Mặc định plugin chèn <script> inline vào index.html để đăng ký SW, thứ
      // này vi phạm CSP `script-src 'self'` trong vercel.json. Ta tự đăng ký
      // bằng virtual:pwa-register/react nên tắt hẳn việc chèn.
      injectRegister: null,
      manifest: {
        name: 'HomeService - Dịch vụ gia đình',
        short_name: 'HomeService',
        description:
          'Đặt thợ sửa chữa, dọn dẹp, điện nước tại nhà. Theo dõi đơn và thanh toán ngay trên điện thoại.',
        lang: 'vi',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        categories: ['lifestyle', 'productivity'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // Mọi đường dẫn lạ rơi về index.html (SPA), TRỪ các request API — nếu
        // không, gọi API lúc offline sẽ nhận về HTML và JSON.parse sẽ nổ.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Tile bản đồ nặng và gần như bất biến → cache thẳng, đỡ tốn 3G.
            urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Danh mục tỉnh/huyện/xã: dữ liệu tĩnh, đổi vài năm một lần.
            urlPattern: /^https:\/\/provinces\.open-api\.vn\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vn-address',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Ảnh dịch vụ / avatar trên Cloudinary: URL có version nên an toàn.
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'remote-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // CỐ Ý không cache response của API app. Phần lớn endpoint đi kèm
        // Authorization; nếu cache theo URL thì tài khoản đăng nhập sau sẽ đọc
        // trúng dữ liệu (đơn hàng, ví, hồ sơ) của tài khoản trước trên cùng máy.
        // Offline vẫn mở được app nhờ precache phần vỏ, còn dữ liệu thì báo lỗi
        // mạng như bình thường.
      },
      devOptions: {
        // Bật SW khi chạy `npm run dev` để test được luồng cài đặt/cập nhật.
        enabled: false,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        // Tách Leaflet (~140KB) ra chunk riêng. Vì chỉ được import bởi các màn
        // lazy (bản đồ thợ, chọn vị trí, mini-map đơn khẩn), chunk này chỉ tải
        // khi người dùng thực sự mở một màn có bản đồ — không nằm trong bundle đầu.
        manualChunks(id: string) {
          if (/node_modules\/(leaflet|react-leaflet|@react-leaflet)\//.test(id)) {
            return 'leaflet'
          }
        },
      },
    },
  },
})
