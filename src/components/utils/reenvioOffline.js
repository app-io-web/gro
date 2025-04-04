// utils/reenvioOffline.js (ou direto no seu arquivo se preferir)

import axios from 'axios'

export async function tentarReenviarFotosOffline() {
  const fotosPendentes = JSON.parse(localStorage.getItem('fotos_pendentes_upload') || '[]')

  if (fotosPendentes.length === 0) return

  const enviadasComSucesso = []

  for (const foto of fotosPendentes) {
    try {
      const formData = new FormData()
      const blob = await fetch(foto.base64).then(res => res.blob())
      formData.append('file', blob, 'foto_offline.jpg')

      const res = await axios.post(
        `${import.meta.env.VITE_NOCODB_URL}/api/v2/storage/upload`,
        formData,
        {
          headers: {
            'xc-token': import.meta.env.VITE_NOCODB_TOKEN,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      console.log('✅ Foto reenviada:', res.data)
      enviadasComSucesso.push(foto)

    } catch (err) {
      console.error('❌ Falha ao reenviar foto:', err)
    }
  }

  // Remove do localStorage as fotos que foram enviadas
  if (enviadasComSucesso.length > 0) {
    const restantes = fotosPendentes.filter(f => !enviadasComSucesso.includes(f))
    localStorage.setItem('fotos_pendentes_upload', JSON.stringify(restantes))
  }
}
