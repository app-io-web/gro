// services/offlineService.js

import { apiPatch } from './api'

// Salva ações offline
export function salvarOffline(acao) {
  let pendencias = JSON.parse(localStorage.getItem('pendenciasOffline')) || []
  pendencias.push(acao)
  localStorage.setItem('pendenciasOffline', JSON.stringify(pendencias))
}

// Tenta enviar ações pendentes quando voltar a internet
export async function enviarRequisicoesPendentes() {
  let pendencias = JSON.parse(localStorage.getItem('pendenciasOffline')) || []
  if (pendencias.length === 0) return

  for (const acao of pendencias) {
    try {
      if (acao.tipo === 'patch') {
        await apiPatch(acao.url, acao.payload)
      }
      // Você pode adicionar outros tipos: post, delete etc.
    } catch (err) {
      console.error('Falha ao reenviar ação:', err)
      return // Se falhar, para aqui, tenta de novo depois
    }
  }

  // Se chegou aqui, todas pendências foram enviadas
  localStorage.removeItem('pendenciasOffline')
}

// Escuta evento de conexão
window.addEventListener('online', enviarRequisicoesPendentes)
