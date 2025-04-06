import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*'],
      manifest: {
        name: 'Ordens de Serviço App',
        short_name: 'OS App',
        description: 'Gerenciador de Ordens de Serviço',
        theme_color: '#3182ce',  // Cor da barra de navegação
        background_color: '#ffffff',  // Cor de fundo da tela inicial
        display: 'standalone',  // Remove a barra de navegação
        start_url: '/gro/',  // Caminho correto para subpastas
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
            purpose: 'any'
          },
          {
            src: '/gro/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        splash_pages: [
          {
            src: '/gro/splash/splash-screen-1125x2436.png',
            sizes: '1125x2436',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-750x1334.png',
            sizes: '750x1334',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-1242x2208.png',
            sizes: '1242x2208',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-1668x2224.png',
            sizes: '1668x2224',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-2048x2732.png',
            sizes: '2048x2732',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-1536x2048.png',
            sizes: '1536x2048',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-320x426.png',
            sizes: '320x426',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-320x470.png',
            sizes: '320x470',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-480x640.png',
            sizes: '480x640',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-720x960.png',
            sizes: '720x960',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-960x1280.png',
            sizes: '960x1280',
            type: 'image/png'
          },
          {
            src: '/gro/splash/splash-screen-1280x1920.png',
            sizes: '1280x1920',
            type: 'image/png'
          }
        ],
        orientation: 'portrait', // Definindo a orientação para retrato
        scope: '/gro/', // Definindo o escopo do app (aplicativo não sairá dessa URL)
        dir: 'ltr', // Direção da leitura (esquerda para direita)
        lang: 'pt-BR', // Idioma configurado como português
        prefer_related_applications: false, // Não obrigar a instalação de aplicativo nativo
        status_bar_style: 'black-translucent' // Estilo da barra de status para o iOS
      },
      workbox: {
        // Aumenta o limite do tamanho de arquivos para serem armazenados no cache do Workbox
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,  // Limite de 5MB (ajuste conforme necessário)
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
});
