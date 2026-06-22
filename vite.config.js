import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/kharj-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'خرج - مدیریت هزینه خانواده',
        short_name: 'خرج',
        description: 'دفتر هزینه مشترک خانواده',
        theme_color: '#0C0C0E',
        background_color: '#0C0C0E',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/kharj-app/',
        start_url: '/kharj-app/',
        lang: 'fa',
        dir: 'rtl',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/kharj-app/index.html'
      }
    })
  ]
})
