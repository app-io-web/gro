import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Mantém atualização automática
      devOptions: {
        enabled: true // Ativa o Service Worker no modo desenvolvimento também
      },
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*'], // Inclui ícones e outros arquivos estáticos
      manifest: {
        name: 'Ordens de Serviço App',
        short_name: 'OS App',
        description: 'Gerenciador de Ordens de Serviço',
        theme_color: '#3182ce',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/gro/',
        orientation: 'portrait',
        dir: 'ltr',
        lang: 'pt-BR',
        prefer_related_applications: false,
        icons: [
          {
            src: 'https://i.ibb.co/PsrdVYVc/ms-icon-310x310.png',
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
            purpose: 'any'
          },
          {
            src: '/gro/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 400 * 1024 * 1024, // 400MB para cache
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'example-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // 1 dia
              }
            }
          }
        ],
        navigateFallback: '/offline.html' // (opcional) página offline se sem conexão
      }
    })
  ]
});
