import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/gro/', // <- Agora correto para rodar dentro da subpasta /gro/
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'icons/*',
        'splash/*'
      ],
      manifest: {
        name: 'Ordens de Serviço App',
        short_name: 'OS App',
        description: 'Gerenciador de Ordens de Serviço',
        theme_color: '#3182ce',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/gro/', // Começar na subpasta correta
        scope: '/gro/', // Escopo certo para funcionar como PWA
        icons: [
          {
            src: 'icons/icon-144x144.png', // NÃO precisa repetir /gro/ aqui
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        splash_pages: [
          {
            src: 'splash/splash-screen-1125x2436.png',
            sizes: '1125x2436',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-750x1334.png',
            sizes: '750x1334',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-1242x2208.png',
            sizes: '1242x2208',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-1668x2224.png',
            sizes: '1668x2224',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-2048x2732.png',
            sizes: '2048x2732',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-1536x2048.png',
            sizes: '1536x2048',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-320x426.png',
            sizes: '320x426',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-320x470.png',
            sizes: '320x470',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-480x640.png',
            sizes: '480x640',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-720x960.png',
            sizes: '720x960',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-960x1280.png',
            sizes: '960x1280',
            type: 'image/png'
          },
          {
            src: 'splash/splash-screen-1280x1920.png',
            sizes: '1280x1920',
            type: 'image/png'
          }
        ],
        orientation: 'portrait',
        dir: 'ltr',
        lang: 'pt-BR',
        prefer_related_applications: false,
        status_bar_style: 'black-translucent'
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 400 * 1024 * 1024, // 400 MB de cache (grande!)
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin, // Aqui usa 'self', não 'window'
            handler: 'CacheFirst',
            options: {
              cacheName: 'example-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // 1 dia de cache
              }
            }
          }
        ]
      }
    })
  ]
});
