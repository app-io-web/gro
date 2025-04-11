import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// 🔥 Detecta se está buildando para o GitHub Pages
const isGithubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isGithubPages ? '/gro/' : '/', // 👈 Se for GitHub Pages, usa '/gro/', senão usa '/'
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'apple-touch-icon.png',
        'icons/*',
        'splash/*'
      ],
      manifest: {
        name: 'Ordens de Serviço App',
        short_name: 'OS App',
        description: 'Gerenciador de Ordens de Serviço',
        start_url: isGithubPages ? '/gro/' : '/',
        scope: isGithubPages ? '/gro/' : '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3182ce',
        orientation: 'portrait',
        dir: 'ltr',
        lang: 'pt-BR',
        prefer_related_applications: false,
        icons: [
          {
            src: 'icons/icon-144x144.png',
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
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        swDest: 'sw.js',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 400 * 1024 * 1024, // 400MB
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
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
});
