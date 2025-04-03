// src/pages/empresa/OrdensCanceladasEmpresa.jsx
import {
    Box, Heading, Spinner, VStack, Text, Badge, useBreakpointValue, Flex, Button
  } from '@chakra-ui/react'
  import { useEffect, useState } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { apiGet } from '../../services/api'
  import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
  import AdminBottomNav from '../../components/admin/AdminBottomNav'
  import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
  
  function OrdensCanceladasEmpresa() {
    const [ordens, setOrdens] = useState([])
    const [loading, setLoading] = useState(true)
    const isMobile = useBreakpointValue({ base: true, md: false })
    const navigate = useNavigate()
    const UnicID_Empresa = localStorage.getItem('UnicID')
  
    useEffect(() => {
      const fetchOrdens = async () => {
        try {
          const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
          const ordensCanceladas = res.list.flatMap(item => {
            const raw = item['Ordem de Serviços']
            if (!raw) return []
  
            const json = typeof raw === 'string' ? JSON.parse(raw) : raw
            return (json.empresas || [])
              .filter(emp => emp.UnicID_Empresa === UnicID_Empresa)
              .flatMap(emp =>
                (emp.Ordens_de_Servico || []).filter(os => os.Status_OS === 'Cancelado')
                  .map(os => ({ ...os, IdRegistro: item.Id }))
              )
          })
  
          setOrdens(ordensCanceladas)
        } catch (err) {
          console.error('Erro ao buscar ordens canceladas:', err)
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
          <Heading size="lg" mb={4}>🚫 Ordens Canceladas</Heading>
  
          {loading ? (
            <Spinner size="xl" />
          ) : ordens.length === 0 ? (
            <Text>Nenhuma ordem cancelada encontrada.</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {ordens.map((ordem, index) => (
                <Box key={index} p={4} bg="white" borderRadius="md" boxShadow="md">
                  <Flex justify="space-between" align="center" flexWrap="wrap">
                    <Box>
                      <Text><strong>Cliente:</strong> {ordem.Nome_Cliente}</Text>
                      <Text><strong>Endereço:</strong> {ordem.Endereco_Cliente}</Text>
                      <Text><strong>Tipo:</strong> {ordem.Tipo_OS}</Text>
                      <Badge colorScheme="red">{ordem.Status_OS}</Badge>
                    </Box>
                    <Button
                      mt={{ base: 3, md: 0 }}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => navigate(`/empresa/ordens-canceladas/${ordem.UnicID_OS}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    )
  }
  
  export default OrdensCanceladasEmpresa
  