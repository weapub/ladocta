import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ladocta-logo.svg', 'ladocta-logo.jpg', 'icon-192.png', 'icon-512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/stream\.listafm\.com\.ar/,
            handler: 'NetworkOnly'
          }
        ]
      },
      manifest: {
        name: 'La Docta FM 99.3',
        short_name: 'La Docta',
        description: 'Tu compañía de todos los días. La mejor música y noticias de la región.',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        display_override: ['standalone', 'window-controls-overlay'],
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        lang: 'es',
        categories: ['music', 'news', 'entertainment'],
        icons: [
          {
            src: 'ladocta-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'ladocta-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Escuchar en vivo',
            short_name: 'En vivo',
            description: 'Escucha La Docta FM ahora',
            url: '/',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          }
        ],
        screenshots: [
          {
            src: 'screenshot-mobile.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'La Docta FM en el móvil'
          },
          {
            src: 'screenshot-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'La Docta FM en la computadora'
          }
        ]
      }
    })
  ],
})
