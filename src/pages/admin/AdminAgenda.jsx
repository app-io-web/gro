import { useEffect, useState } from 'react'
import { Box, Heading, VStack, Spinner } from '@chakra-ui/react'
import { apiGet } from '../../services/api'
import ListaAgendamentos from '../../components/admin/agenda/ListaAgendamentos'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import { useBreakpointValue } from '@chakra-ui/react'

function AdminAgenda() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchOrdens = async () => {
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
              UnicID_Empresa: empresa.UnicID_Empresa
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
    }
  
    fetchOrdens()
  }, [])
  

  return (
    <Box minH="100vh">
      {!isMobile && <AdminSidebarDesktop />}

      <Box p={6} ml={!isMobile ? '250px' : 0} pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}
        {isMobile && <AdminMobileMenu />}

        <Heading size="lg" mb={6}>Agenda de Ordens de Serviço</Heading>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <ListaAgendamentos ordens={ordens} />
        )}
      </Box>
    </Box>
  )
}

export default AdminAgenda
