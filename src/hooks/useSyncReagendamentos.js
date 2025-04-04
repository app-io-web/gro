import { useEffect } from 'react'
import { apiGet, apiPatch } from '../services/api'
import { useToast } from '@chakra-ui/react'

export function useSyncReagendamentos() {
  const toast = useToast()

  useEffect(() => {
    const enviarReagendamentosPendentes = async () => {
      const pendentes = JSON.parse(localStorage.getItem('reagendamentos_pendentes')) || []

      if (pendentes.length === 0) return

      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')

        for (const pendente of pendentes) {
          let registroEncontrado = null
          let recordId = null
          let novaListaEmpresas = []

          for (const registro of res.list) {
            const raw = registro['Ordem de Serviços']
            const json = typeof raw === 'string' ? JSON.parse(raw) : raw

            const empresasAtualizadas = json.empresas.map(emp => {
              const ordensAtualizadas = emp.Ordens_de_Servico?.map(os => {
                if (os.UnicID_OS === pendente.ordem.UnicID_OS && os.Numero_OS === pendente.ordem.Numero_OS) {
                  recordId = registro.id || registro.Id
                  registroEncontrado = registro

                  return {
                    ...os,
                    Status_OS: 'Reagendada',
                    Reagendamento: pendente.novaData,
                    Motivo_Reagendamento: pendente.motivo
                  }
                }
                return os
              })

              return {
                ...emp,
                Ordens_de_Servico: ordensAtualizadas
              }
            })

            if (recordId) {
              novaListaEmpresas = empresasAtualizadas
              break
            }
          }

          if (recordId && registroEncontrado) {
            const payload = [
              {
                Id: registroEncontrado.Id,
                'Ordem de Serviços': JSON.stringify({ empresas: novaListaEmpresas })
              }
            ]

            await apiPatch(`/api/v2/tables/mtnh21kq153to8h/records`, payload)
          }
        }

        // Depois de enviar tudo com sucesso, limpa os pendentes
        localStorage.removeItem('reagendamentos_pendentes')

        toast({
          title: '✅ Reagendamentos sincronizados!',
          description: 'Todos os reagendamentos offline foram enviados.',
          status: 'success',
          duration: 4000,
          isClosable: true
        })
      } catch (err) {
        console.error('❌ Erro ao sincronizar reagendamentos:', err)
      }
    }

    const handleOnline = () => {
      enviarReagendamentosPendentes()
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [])
}
