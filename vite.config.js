import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Ordens de Serviço App',
        short_name: 'OS App',
        description: 'Gerenciador de Ordens de Serviço',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Aumenta o limite do tamanho de arquivos para serem armazenados no cache do Workbox
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Limite de 5MB (ajuste conforme necessário)
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === window.location.origin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'example-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // 1 dia
              }
            }
          }
        ]
      }
    })
  ]
})
