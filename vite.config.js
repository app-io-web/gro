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
        orientation: 'portrait', // Definindo a orientação para retrato
        scope: '/gro/', // Definindo o escopo do app (aplicativo não sairá dessa URL)
        dir: 'ltr', // Direção da leitura (esquerda para direita)
        lang: 'pt-BR', // Idioma configurado como português
        prefer_related_applications: false, // Não obrigar a instalação de aplicativo nativo
        status_bar_style: 'black-translucent' // Estilo da barra de status para o iOS
      },
      workbox: {
        // Aumenta o limite do tamanho de arquivos para serem armazenados no cache do Workbox
        maximumFileSizeToCacheInBytes: 400 * 1024 * 1024,  // Limite de 400MB
        runtimeCaching: [
          {
            urlPattern: ({ url }) => self.location.origin === url.origin,
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
