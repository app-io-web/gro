import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Box, Heading, Text, VStack, Spinner, Badge, useToast,
  useBreakpointValue, Flex,Button 
} from '@chakra-ui/react'
import { apiGet } from '../../services/api'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'

function OrdensFinalizadasEmpresa() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const UnicID_Empresa_Logada = localStorage.getItem('UnicID')
  const navigate = useNavigate()

  useEffect(() => {
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
            .flatMap(emp => emp.Ordens_de_Servico
              .filter(os => os.Status_OS === 'Finalizado')
              .map(os => ({
                ...os,
                empresa: emp.empresa,
                UnicID_Empresa: emp.UnicID_Empresa
              }))
            )
        })

        setOrdens(ordensFiltradas)
      } catch (err) {
        console.error(err)
        toast({ title: 'Erro ao buscar ordens', status: 'error' })
      } finally {
        setLoading(false)
      }
    }

    fetchOrdens()
  }, [])

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box w="full" ml={!isMobile ? '250px' : 0} p={6} pb={isMobile ? '60px' : 0}>
  <Heading size="lg" mb={4}>✅ Ordens Finalizadas</Heading>

  {loading ? (
    <Spinner size="xl" />
  ) : (
    <VStack spacing={4} align="stretch">
      {ordens.length === 0 ? (
        <Text>Nenhuma ordem finalizada encontrada.</Text>
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
            <Flex justify="space-between" align="center" flexWrap="wrap">
              {/* Dados da O.S. */}
              <Box mb={{ base: 3, md: 0 }}>
                <Text><strong>Cliente:</strong> {os.Nome_Cliente}</Text>
                <Text><strong>Endereço:</strong> {os.Endereco_Cliente}</Text>
                <Text><strong>Tipo:</strong> {os.Tipo_OS}</Text>
                <Text><strong>Data:</strong> {new Date(os.Data_Entrega_OS).toLocaleString('pt-BR')}</Text>
                <Badge mt={2} colorScheme="green">{os.Status_OS}</Badge>
              </Box>

              {/* Botão à direita */}
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => navigate(`/empresa/ordem-finalizada/${os.UnicID_OS}`)}
              >
                Analisar Ordem
              </Button>
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

export default OrdensFinalizadasEmpresa
