import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ladocta-logo.svg', 'ladocta-logo.jpg'],
      manifest: {
        name: 'La Docta FM 99.3',
        short_name: 'La Docta',
        description: 'Tu compañía de todos los días. La mejor música y noticias de la región.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        display_override: ['standalone', 'window-controls-overlay'],
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
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
