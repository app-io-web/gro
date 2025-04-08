import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Aqui você poderia mostrar um modal ou botão para atualizar
    updateSW(true);
  },
  onOfflineReady() {
    // Aqui poderia mostrar: "App pronto para usar offline!"
  }
});
