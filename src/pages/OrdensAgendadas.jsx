// src/pages/OrdensAgendadas.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom' // 👈 importa o useNavigate!
import {
  Box, Heading, Text, VStack, Spinner, Badge, useToast, useBreakpointValue, Flex
} from '@chakra-ui/react'
import { apiGet } from '../services/api'
import AdminSidebarDesktop from '../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../components/admin/AdminBottomNav'
import AdminMobileMenu from '../components/admin/AdminMobileMenu'

function OrdensAgendadas() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const navigate = useNavigate() // 👈 inicializa o navigate

  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')

  useEffect(() => {
    const fetchOrdens = async () => {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const ordens = res.list.flatMap(item => {
          const rawJson = item['Ordem de Serviços']
          if (!rawJson) return []
          const json = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson
          if (!json?.empresas) return []
          return json.empresas.flatMap(empresa =>
            empresa.Ordens_de_Servico.map(os => ({
              ...os,
              empresa: empresa.empresa,
              UnicID_Empresa: empresa.UnicID_Empresa
            }))
          )
        })

        setOrdens(ordens)
      } catch (err) {
        console.error('Erro ao buscar ordens:', err)
        toast({
          title: 'Erro ao buscar ordens',
          status: 'error',
          duration: 3000
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrdens()
    const interval = setInterval(fetchOrdens, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}

      <Box p={6} ml={!isMobile ? '250px' : 0} w="full" pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}
        
        <Heading size="lg" mb={4}>Ordens Agendadas</Heading>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <>
            {/* Filtro de datas */}
            <Flex mb={4} gap={4} align="center" flexWrap="wrap">
              <Box>
                <Text fontSize="sm" mb={1}>Data Inicial</Text>
                <input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </Box>

              <Box>
                <Text fontSize="sm" mb={1}>Data Final</Text>
                <input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </Box>
            </Flex>

            {/* Listagem de ordens */}
            <VStack align="stretch" spacing={4}>
              {ordens
                .filter((os) => os.Status_OS === 'Agendada')
                .filter((os) => {
                  if (!dataInicial && !dataFinal) return true
                  const dataEnvio = new Date(os.Data_Envio_OS)
                  const inicio = dataInicial ? new Date(dataInicial + 'T00:00:00') : null
                  const fim = dataFinal ? new Date(dataFinal + 'T23:59:59') : null

                  if (inicio && fim) {
                    return dataEnvio >= inicio && dataEnvio <= fim
                  } else if (inicio) {
                    return dataEnvio >= inicio
                  } else if (fim) {
                    return dataEnvio <= fim
                  }
                  return true
                })
                .map((os) => (
                  <Box
                    key={os.UnicID_OS}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                    boxShadow="sm"
                    position="relative"
                    transition="all 0.2s"
                    _hover={{ boxShadow: 'md', cursor: 'pointer', bg: 'gray.50' }}
                    onClick={() => navigate(`/admin/ordem-execucao/${os.UnicID_OS}`)} // 👈 Redirecionar ao clicar
                  >
                    <VStack align="start" spacing={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Text fontWeight="bold">Empresa: {os.empresa}</Text>
                        <Badge
                          colorScheme="pink"
                          borderRadius="full"
                          px={2}
                          py={1}
                          fontSize="xs"
                        >
                          AGENDADA
                        </Badge>
                      </Box>

                      <Text>Tipo: {os.Tipo_OS}</Text>
                      <Text>Cliente: {os.Nome_Cliente}</Text>
                      <Text><strong>Técnico:</strong> {os.Tecnico_Responsavel || 'Sem Técnico'}</Text> {/* 👈 Técnico aqui */}
                      <Text>Endereço: {os.Endereco_Cliente}</Text>
                      <Text>
                        {`Data de Envio: ${new Date(os.Data_Envio_OS).toLocaleString('pt-BR')}`}
                      </Text>
                    </VStack>
                  </Box>
                ))}
            </VStack>
          </>
        )}
      </Box>
    </Box>
  )
}

export default OrdensAgendadas
