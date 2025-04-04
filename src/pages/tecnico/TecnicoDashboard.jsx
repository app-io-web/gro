import { useEffect, useState } from 'react'
import { apiGet } from '../../services/api'
import {
  Box, Heading, Text, Flex, Spinner
} from '@chakra-ui/react'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AgendaTecnico from './AgendaTecnico' // 👈 aqui importa a agenda

function TecnicoDashboard() {
  const [tecnico, setTecnico] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTecnico = async () => {
      const tecnicoId = localStorage.getItem('tecnico_id')
      if (!tecnicoId) return setLoading(false)

      try {
        const res = await apiGet(`/api/v2/tables/mpyestriqe5a1kc/records/${tecnicoId}`)
        setTecnico(res)
      } catch (err) {
        console.error('Erro ao buscar dados do técnico:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTecnico()
  }, [])

  if (loading) return <Spinner mt={10} />
  if (!tecnico) return <Text>Técnico não encontrado</Text>

  return (
    <Flex minH="100vh">
      {/* Sidebar só no desktop */}
      <Box display={{ base: 'none', md: 'block' }}>
        <AdminSidebarDesktop />
      </Box>

      {/* Conteúdo principal com agenda */}
      <Box flex="1" p={0} ml={{ base: 0, md: '250px' }}>
        <AgendaTecnico /> {/* Aqui vem a tela de agenda direto */}
      </Box>
    </Flex>
  )
}

export default TecnicoDashboard
