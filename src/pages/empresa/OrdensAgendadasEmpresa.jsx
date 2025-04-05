import { useEffect, useState } from 'react'
import {
  Box, Heading, Text, VStack, Spinner, Badge, useToast,
  useBreakpointValue, Flex
} from '@chakra-ui/react'
import { apiGet } from '../../services/api'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'

function OrdensAgendadasEmpresa() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const UnicID_Empresa_Logada = localStorage.getItem('UnicID')

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrdens()
    }, 1000) // 10 segundos

    return () => clearInterval(interval)
  }, [])

  const fetchOrdens = async () => {
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      const ordensFiltradas = res.list.flatMap(item => {
        const rawJson = item['Ordem de Serviços']
        if (!rawJson) return []

        const json = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson
        if (!json?.empresas) return []

        return json.empresas
          .filter(emp => emp.UnicID_Empresa === UnicID_Empresa_Logada)
          .flatMap(emp =>
            emp.Ordens_de_Servico
              .filter(os => {
                const status = os.Status_OS?.toLowerCase()
                return status === 'agendada' || status === 'execução'
              })
              .map(os => ({
                ...os,
                empresa: emp.empresa,
                UnicID_Empresa: emp.UnicID_Empresa,
                IdRegistro: item.Id
              }))
          )
      })

      setOrdens(ordensFiltradas)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao buscar ordens agendadas', status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box w="full" ml={!isMobile ? '250px' : 0} p={6} pb={isMobile ? '60px' : 0}>
        <Heading size="lg" mb={4}>📅 Ordens Agendadas</Heading>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <VStack spacing={4} align="stretch">
            {ordens.length === 0 ? (
              <Text>Nenhuma ordem agendada encontrada.</Text>
            ) : (
              ordens.map((os, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="white"
                  _hover={{ bg: 'gray.50' }}
                >
                  <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align={{ base: 'flex-start', md: 'center' }}
                    gap={4}
                  >
                    <Box fontSize="sm">
                      <Text><strong>Cliente:</strong> {os.Nome_Cliente}</Text>
                      <Text><strong>Endereço:</strong> {os.Endereco_Cliente}</Text>
                      <Text><strong>Tipo:</strong> {os.Tipo_OS}</Text>
                      <Badge colorScheme={os.Status_OS.toLowerCase() === 'execução' ? 'orange' : 'cyan'} mt={1}>
                        {os.Status_OS}
                      </Badge>
                    </Box>
                  </Flex>
                </Box>
              ))
            )}
          </VStack>
        )}
      </Box>
    </Box>
  )
}

export default OrdensAgendadasEmpresa
