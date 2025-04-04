import { useEffect, useState } from 'react'
import { apiGet } from '../services/api'

export function useOfflineData({ url, localKey }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!url || !localKey) {
        setLoading(false)
        return
      }

      if (navigator.onLine) {
        // Se estiver online, busca do servidor
        try {
          const res = await apiGet(url)
          setData(res)
          localStorage.setItem(localKey, JSON.stringify(res)) // Salva no localStorage
        } catch (error) {
          console.error('Erro ao buscar online:', error)
        }
      } else {
        // Se estiver offline, busca do localStorage
        const localData = localStorage.getItem(localKey)
        if (localData) {
          setData(JSON.parse(localData))
        }
        setOffline(true)
      }

      setLoading(false)
    }

    fetchData()
  }, [url, localKey])

  return { data, loading, offline }
}
