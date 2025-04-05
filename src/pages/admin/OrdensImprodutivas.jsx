// src/pages/admin/OrdensImprodutivas.jsx

import { useEffect, useState } from 'react'
import {
  Box, Heading, Text, VStack, Spinner, Badge, useToast, useBreakpointValue, Flex
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../services/api'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import AdminBottomNav from '../../components/admin/AdminBottomNav'

export default function OrdensImprodutivas() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const navigate = useNavigate()
  const toast = useToast()

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
      } catch (error) {
        console.error(error)
        toast({ title: 'Erro ao buscar ordens', status: 'error', duration: 3000 })
      } finally {
        setLoading(false)
      }
    }

    fetchOrdens()

    const hoje = new Date()
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    setDataInicial(primeiroDia.toISOString().slice(0, 10))
    setDataFinal(ultimoDia.toISOString().slice(0, 10))
  }, [])

  const ordensFiltradas = ordens
    .filter(os => os.Status_OS === 'Improdutivo')
    .filter(os => {
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

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      <Box p={6} ml={!isMobile ? '250px' : 0} w="full" pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}

        <Heading size="lg" mb={4}>Ordens Improdutivas</Heading>

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

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <VStack align="stretch" spacing={4}>
            {ordensFiltradas.length === 0 ? (
              <Text>Nenhuma ordem improdutiva encontrada.</Text>
            ) : (
              ordensFiltradas.map((os) => (
                <Box
                  key={os.UnicID_OS}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="white"
                  boxShadow="sm"
                  _hover={{ boxShadow: 'md', cursor: 'pointer', bg: 'gray.50' }}
                  onClick={() => navigate(`/admin/ordens-improdutivas/${os.UnicID_OS}`)}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Empresa: {os.empresa}</Text>
                    <Text>Cliente: {os.Nome_Cliente}</Text>
                    <Text>Endereço: {os.Endereco_Cliente}</Text>
                    <Text>Tipo: {os.Tipo_OS}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Data de Envio: {new Date(os.Data_Envio_OS).toLocaleString('pt-BR')}
                    </Text>

                    <Badge colorScheme="red">{os.Status_OS}</Badge>
                  </VStack>
                </Box>
              ))
            )}
          </VStack>
        )}
      </Box>
    </Box>
  )
}
