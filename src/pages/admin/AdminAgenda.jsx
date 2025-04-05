import { useEffect, useState, useCallback } from 'react'
import { Box, Heading, VStack, Spinner, Button, useToast, useDisclosure, Text } from '@chakra-ui/react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react'
import { apiGet, apiPatch } from '../../services/api'
import ListaAgendamentos from '../../components/admin/agenda/ListaAgendamentos'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import { useBreakpointValue } from '@chakra-ui/react'

function AdminAgenda() {
  const [ordens, setOrdens] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const fetchOrdens = useCallback(async () => {
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')

      const todasOrdens = res.list.flatMap(item => {
        const rawJson = item['Ordem de Serviços']

        if (!rawJson) return []

        const json = typeof rawJson === 'string'
          ? JSON.parse(rawJson)
          : rawJson

        if (!json?.empresas) return []

        return json.empresas.flatMap(empresa =>
          empresa.Ordens_de_Servico.map(os => ({
            ...os,
            empresa: empresa.empresa,
            UnicID_Empresa: empresa.UnicID_Empresa,
            registroId: item.Id
          }))
        )
      })

      const ordensFiltradas = todasOrdens.filter(ordem =>
        ordem.Status_OS === 'Em Aberto' || ordem.Status_OS === 'Pendenciada'
      )

      setOrdens(ordensFiltradas)
    } catch (err) {
      console.error('Erro ao buscar ordens:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTecnicos = useCallback(async () => {
    try {
      const res = await apiGet('/api/v2/tables/mpyestriqe5a1kc/records')
      const lista = res.list || []
      const tecnicosAtivos = lista.map(t => ({
        nome: t.Tecnico_Responsavel,
        id: t.ID_Tecnico_Responsavel
      })).filter(t => t.nome && t.id)
      setTecnicos(tecnicosAtivos)
    } catch (err) {
      console.error('Erro ao buscar técnicos:', err)
    }
  }, [])
  

  useEffect(() => {
    fetchOrdens()
    fetchTecnicos()
  }, [fetchOrdens, fetchTecnicos])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrdens()
      fetchTecnicos()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchOrdens, fetchTecnicos])

  const confirmarBalanceamento = async () => {
    try {
      if (tecnicos.length === 0) {
        toast({
          title: "Nenhum técnico disponível!",
          status: "error",
          duration: 3000
        })
        return
      }
  
      const hoje = new Date().toISOString().split('T')[0]  // Data atual no formato YYYY-MM-DD
  
      const ordensBalanceadas = ordens.map((ordem, index) => {
        const tecnico = tecnicos[index % tecnicos.length]
        return {
          ...ordem,
          Tecnico_Responsavel: tecnico.nome,
          ID_Tecnico_Responsavel: tecnico.id,
          Data_Agendamento_OS: hoje
        }
      })
      
  
      for (const ordem of ordensBalanceadas) {
        const res = await apiGet(`/api/v2/tables/mtnh21kq153to8h/records`)
        const registro = res.list.find(item =>
          JSON.stringify(item['Ordem de Serviços']).includes(ordem.UnicID_OS)
        )
  
        if (!registro) continue
  
        const jsonOriginal = typeof registro['Ordem de Serviços'] === 'string'
          ? JSON.parse(registro['Ordem de Serviços'])
          : registro['Ordem de Serviços']
  
        const novaEstrutura = {
          ...jsonOriginal,
          empresas: jsonOriginal.empresas.map(empresa => {
            if (empresa.UnicID_Empresa !== ordem.UnicID_Empresa) return empresa
  
            return {
              ...empresa,
              Ordens_de_Servico: empresa.Ordens_de_Servico.map(os =>
                os.UnicID_OS === ordem.UnicID_OS
                  ? { 
                      ...os, 
                      Tecnico_Responsavel: ordem.Tecnico_Responsavel, 
                      ID_Tecnico_Responsavel: ordem.ID_Tecnico_Responsavel,
                      Data_Agendamento_OS: ordem.Data_Agendamento_OS,
                      Status_OS: "Agendada" 
                    }
                  : os
              )
              
            }
          })
        }
  
        await apiPatch('/api/v2/tables/mtnh21kq153to8h/records', {
          Id: registro.Id,
          'Ordem de Serviços': JSON.stringify(novaEstrutura) // Apenas stringificando este campo
        })
        
      }
  
      toast({
        title: "Ordens balanceadas e agendadas com sucesso!",
        status: "success",
        duration: 3000
      })
  
      onClose()
      fetchOrdens()
    } catch (error) {
      console.error('Erro ao balancear ordens:', error)
      toast({
        title: "Erro ao balancear ordens",
        status: "error",
        duration: 3000
      })
    }
  }
  

  return (
    <Box minH="100vh">
      {!isMobile && <AdminSidebarDesktop />}

      <Box p={6} ml={!isMobile ? '250px' : 0} pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}
        {isMobile && <AdminMobileMenu />}

        <Heading size="lg" mb={6}>Agenda de Ordens de Serviço</Heading>

        <Button colorScheme="purple" mb={6} onClick={onOpen}>
          Balancear Ordens entre Técnicos
        </Button>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <ListaAgendamentos ordens={ordens} />
        )}
      </Box>

      {/* Modal de Confirmação */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Balanceamento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>O balanceamento irá agendar para a data atual e distribuir automaticamente entre os técnicos disponíveis. Deseja continuar?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={confirmarBalanceamento}>
              Sim, balancear
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default AdminAgenda
