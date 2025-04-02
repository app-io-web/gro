import { useEffect, useState } from 'react'
import { apiGet } from '../../services/api'
import {
  Box, Heading, Text, Button, Flex, Spinner, useBreakpointValue
} from '@chakra-ui/react'

import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'

function EmpresaDashboard() {
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchEmpresa = async () => {
      const empresaId = localStorage.getItem('empresa_id')

      if (!empresaId) {
        console.warn('ID da empresa não encontrado no localStorage.')
        setLoading(false)
        return
      }

      try {
        const res = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records/${empresaId}`)
        if (res && res.Id) {
          setEmpresa(res)
        } else {
          console.warn('Empresa não encontrada.')
        }
      } catch (err) {
        console.error('Erro ao buscar empresa:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmpresa()
  }, [])

  if (loading) return <Spinner size="xl" mt={20} />
  if (!empresa) return <Text>Empresa não encontrada.</Text>

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box w="full" p={6} ml={!isMobile ? '250px' : 0}>
        <Heading size="lg" mb={4}>Bem-vindo, {empresa?.Email}</Heading>

        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="xl">Suas Ordens de Serviço</Text>
          <Button colorScheme="blue">Criar nova O.S.</Button>
        </Flex>

        <Box bg="gray.50" p={4} borderRadius="md" shadow="sm">
          <Text>Ainda não há ordens de serviço cadastradas.</Text>
        </Box>
      </Box>
    </Box>
  )
}

export default EmpresaDashboard
