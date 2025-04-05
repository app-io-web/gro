// src/pages/admin/OrdensFinalizadas.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Heading, Text, Spinner, VStack, Badge, Select, Flex, Input, useBreakpointValue
} from '@chakra-ui/react'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import { apiGet } from '../../services/api'

export default function OrdensFinalizadas() {
  const [ordens, setOrdens] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const todasOrdens = res.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string'
            ? JSON.parse(item['Ordem de Serviços'])
            : item['Ordem de Serviços']

          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico.map(os => ({
              ...os,
              empresa: emp.empresa,
              UnicID_Empresa: emp.UnicID_Empresa,
              registroId: item.Id
            }))
          )
        })

        setOrdens(todasOrdens)
        const listaEmpresas = [...new Set(todasOrdens.map(o => o.empresa))]
        setEmpresas(listaEmpresas)
      } catch (err) {
        console.error('Erro ao buscar ordens:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const ordensFiltradas = ordens
    .filter(o => o.Status_OS === 'Finalizado')
    .filter(o => empresaSelecionada ? o.empresa === empresaSelecionada : true)
    .filter(o => {
      const dataEnvio = new Date(o.Data_Envio_OS)
      const inicio = dataInicial ? new Date(`${dataInicial}T00:00:00`) : null
      const fim = dataFinal ? new Date(`${dataFinal}T23:59:59`) : null

      if (inicio && fim) return dataEnvio >= inicio && dataEnvio <= fim
      if (inicio) return dataEnvio >= inicio
      if (fim) return dataEnvio <= fim
      return true
    })

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      <Box ml={!isMobile ? '250px' : 0} p={6} w="full" pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}
        
        <Heading size="lg" mb={6}>Ordens Finalizadas</Heading>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <>
            {/* Filtros */}
            <Flex mb={6} gap={4} flexWrap="wrap">
              <Select
                placeholder="Filtrar por empresa"
                value={empresaSelecionada}
                onChange={(e) => setEmpresaSelecionada(e.target.value)}
                w="250px"
              >
                {empresas.map((empresa, idx) => (
                  <option key={idx} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </Select>

              <Input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                placeholder="Data Inicial"
                w="170px"
              />
              <Input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                placeholder="Data Final"
                w="170px"
              />
            </Flex>

            {/* Listagem */}
            <VStack align="stretch" spacing={4}>
              {ordensFiltradas.length === 0 ? (
                <Text>Nenhuma ordem finalizada encontrada.</Text>
              ) : (
                ordensFiltradas.map((os) => (
                  <Box
                    key={os.UnicID_OS}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                    boxShadow="sm"
                    transition="all 0.2s"
                    _hover={{ boxShadow: 'md', cursor: 'pointer', bg: 'gray.50' }}
                    onClick={() => navigate(`/admin/ordens-finalizadas/${os.UnicID_OS}`)}
                  >
                    <Text fontWeight="bold">Empresa: {os.empresa}</Text>
                    <Badge colorScheme="green" mt={1} mb={2}>
                      FINALIZADO
                    </Badge>
                    <Text><strong>Cliente:</strong> {os.Nome_Cliente}</Text>
                    <Text><strong>Técnico:</strong> {os.Tecnico_Responsavel || 'Sem Técnico'}</Text>
                    <Text><strong>Endereço:</strong> {os.Endereco_Cliente}</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      Data de Envio: {new Date(os.Data_Envio_OS).toLocaleString('pt-BR')}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </>
        )}
      </Box>
    </Box>
  )
}
