import { Box, Text, Flex, Spinner, useBreakpointValue } from '@chakra-ui/react'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AgendaTecnico from './AgendaTecnico'
import { useOfflineData } from '../../hooks/useOfflineData'

function TecnicoDashboard() {
  const tecnicoId = localStorage.getItem('tecnico_id')
  const isMobile = useBreakpointValue({ base: true, md: false })

  const { data: tecnico, loading, offline } = useOfflineData({
    url: `/api/v2/tables/mpyestriqe5a1kc/records/${tecnicoId}`,
    localKey: `tecnico_${tecnicoId}` // 🔥 salvando separado para cada técnico
  })

  if (loading) return <Spinner mt={10} />

  if (!tecnico) {
    if (offline) {
      return (
        <Box p={4} textAlign="center">
          <Text fontSize="lg" color="gray.600">
            Você está offline. Conecte-se à internet para atualizar as informações.
          </Text>
        </Box>
      )
    } else {
      return <Text p={4}>Técnico não encontrado.</Text>
    }
  }

  return (
    <Flex minH="100vh">
      {/* Sidebar só no desktop */}
      <Box display={{ base: 'none', md: 'block' }}>
        <AdminSidebarDesktop />
      </Box>

      {/* Conteúdo principal com agenda */}
      <Box
        flex="1"
        p={0}
        pb={isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '0'} // ✅ usa safe-area
        ml={{ base: 0, md: '250px' }}
      >
        <AgendaTecnico />
      </Box>
    </Flex>
  )
}

export default TecnicoDashboard
