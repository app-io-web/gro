import {
    Box, Heading, VStack, Text, Spinner, Badge, Flex, Button, useBreakpointValue, useToast
  } from '@chakra-ui/react'
  import { useEffect, useState } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { apiGet, apiPatch } from '../../services/api'
  import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
  import AdminBottomNav from '../../components/admin/AdminBottomNav'
  import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
  
  function OrdensPendenciadasEmpresa() {
    const [ordens, setOrdens] = useState([])
    const [loading, setLoading] = useState(true)
    const isMobile = useBreakpointValue({ base: true, md: false })
    const navigate = useNavigate()
    const toast = useToast()
    const UnicID_Empresa = localStorage.getItem('UnicID')
  
    useEffect(() => {
      fetchData()
    }, [])
  
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const pendenciadas = res.list.flatMap(item => {
          const raw = item['Ordem de Serviços']
          if (!raw) return []
          const json = typeof raw === 'string' ? JSON.parse(raw) : raw
  
          return (json.empresas || []).flatMap(emp =>
            emp.Ordens_de_Servico?.filter(os =>
              emp.UnicID_Empresa === UnicID_Empresa && os.Status_OS === 'Pendente'
            ).map(os => ({
              ...os,
              empresa: emp.empresa,
              IdRegistro: item.Id
            })) || []
          )
        })
  
        setOrdens(pendenciadas)
      } catch (err) {
        console.error(err)
        toast({ title: 'Erro ao carregar ordens', status: 'error' })
      } finally {
        setLoading(false)
      }
    }
  
    const marcarParaReagendamento = async (os) => {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const registro = res.list.find(item =>
          JSON.stringify(item['Ordem de Serviços']).includes(os.UnicID_OS)
        )
  
        if (!registro) throw new Error('Registro não encontrado.')
  
        const json = typeof registro['Ordem de Serviços'] === 'string'
          ? JSON.parse(registro['Ordem de Serviços'])
          : registro['Ordem de Serviços']
  
        const novaEstrutura = {
          ...json,
          empresas: json.empresas.map(emp => {
            if (emp.UnicID_Empresa !== UnicID_Empresa) return emp
  
            return {
              ...emp,
              Ordens_de_Servico: emp.Ordens_de_Servico.map(ordem => {
                if (ordem.UnicID_OS !== os.UnicID_OS) return ordem
                return {
                  ...ordem,
                  Status_OS: 'Em Aberto'
                }
              })
            }
          })
        }
  
        await apiPatch('/api/v2/tables/mtnh21kq153to8h/records', {
          Id: registro.Id,
          'Ordem de Serviços': novaEstrutura
        })
  
        toast({ title: 'Ordem marcada para reagendamento', status: 'success' })
        fetchData()
      } catch (err) {
        console.error(err)
        toast({ title: 'Erro ao reagendar ordem', status: 'error' })
      }
    }
  
    return (
      <Box display="flex">
        {!isMobile && <AdminSidebarDesktop />}
        {isMobile && <AdminMobileMenu />}
        {isMobile && <AdminBottomNav />}
  
        <Box w="full" ml={!isMobile ? '250px' : 0} p={6}>
          <Heading size="lg" mb={4}>📍 Ordens Pendenciadas</Heading>
          {loading ? (
            <Spinner size="xl" />
          ) : (
            <VStack spacing={4} align="stretch">
              {ordens.map((os, i) => (
                <Box key={i} p={4} bg="white" borderRadius="md" boxShadow="md">
                  <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    <Box>
                      <Text><strong>Cliente:</strong> {os.Nome_Cliente}</Text>
                      <Text><strong>Endereço:</strong> {os.Endereco_Cliente}</Text>
                      <Text><strong>Tipo:</strong> {os.Tipo_OS}</Text>
                      <Badge colorScheme="purple">{os.Status_OS}</Badge>
                    </Box>
                    <Flex gap={2} direction={{ base: 'column', md: 'row' }}>
                      <Button
                        colorScheme="purple"
                        variant="outline"
                        onClick={() => navigate(`/empresa/ordens-pendenciadas/${os.UnicID_OS}`)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button
                        colorScheme="blue"
                        variant="solid"
                        onClick={() => marcarParaReagendamento(os)}
                      >
                        Marcar para Reagendamento
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    )
  }
  
  export default OrdensPendenciadasEmpresa
  