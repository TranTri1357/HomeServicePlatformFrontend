import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


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
