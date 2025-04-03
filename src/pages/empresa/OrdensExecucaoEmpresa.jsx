import {
    Box, Heading, Spinner, VStack, Text, Badge, useBreakpointValue,
    Flex, Button, keyframes
  } from '@chakra-ui/react'
  import { useEffect, useState } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { apiGet } from '../../services/api'
  import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
  import AdminBottomNav from '../../components/admin/AdminBottomNav'
  import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
  import { FaCog } from 'react-icons/fa'
  
  const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `
  
  function OrdensExecucaoEmpresa() {
    const [ordens, setOrdens] = useState([])
    const [loading, setLoading] = useState(true)
    const isMobile = useBreakpointValue({ base: true, md: false })
    const navigate = useNavigate()
    const UnicID_Empresa = localStorage.getItem('UnicID')
  
    useEffect(() => {
      const fetchOrdens = async () => {
        try {
          const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
          const ordensExecucao = res.list.flatMap(item => {
            const raw = item['Ordem de Serviços']
            if (!raw) return []
  
            const json = typeof raw === 'string' ? JSON.parse(raw) : raw
            return (json.empresas || [])
              .filter(emp => emp.UnicID_Empresa === UnicID_Empresa)
              .flatMap(emp =>
                (emp.Ordens_de_Servico || []).filter(os => os.Status_OS === 'Execução')
                  .map(os => ({ ...os, IdRegistro: item.Id }))
              )
          })
  
          setOrdens(ordensExecucao)
        } catch (err) {
          console.error('Erro ao buscar ordens em execução:', err)
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
          <Heading size="lg" mb={4}>⚙️ Ordens em Execução</Heading>
  
          {loading ? (
            <Spinner size="xl" />
          ) : ordens.length === 0 ? (
            <Text>Nenhuma ordem em execução no momento.</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {ordens.map((ordem, index) => (
                <Box key={index} p={4} bg="white" borderRadius="md" boxShadow="md">
                  <Flex justify="space-between" align="center" flexWrap="wrap">
                    <Box>
                      <Text><strong>Cliente:</strong> {ordem.Nome_Cliente}</Text>
                      <Text><strong>Endereço:</strong> {ordem.Endereco_Cliente}</Text>
                      <Text><strong>Tipo:</strong> {ordem.Tipo_OS}</Text>
                      <Text><strong>Técnico:</strong> {ordem.Tecnico_Responsavel || 'Não atribuído'}</Text>
                      <Badge
                        colorScheme="blue"
                        display="inline-flex"
                        alignItems="center"
                        mt={2}
                        px={2}
                        py={1}
                        fontSize="sm"
                      >
                        <Box
                          as={FaCog}
                          mr={1}
                          animation={`${spin} 2s linear infinite`}
                        />
                        {ordem.Status_OS}
                      </Badge>
                    </Box>
                    <Button
                      mt={{ base: 3, md: 0 }}
                      colorScheme="blue"
                      onClick={() => navigate(`/empresa/ordens-andamento/${ordem.UnicID_OS}`)}
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
  
  export default OrdensExecucaoEmpresa
  