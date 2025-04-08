import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/gro/', // <- ESSENCIAL
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*'],
      manifest: {
        name: 'Ordens de Serviço App',
        short_name: 'OS App',
        description: 'Gerenciador de Ordens de Serviço',
        theme_color: '#3182ce',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/gro/', // já está correto
        scope: '/gro/',
        icons: [
          {
            src: '/gro/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/gro/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/gro/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        orientation: 'portrait',
        dir: 'ltr',
        lang: 'pt-BR',
        prefer_related_applications: false,
        status_bar_style: 'black-translucent'
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 400 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'example-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ]
});
