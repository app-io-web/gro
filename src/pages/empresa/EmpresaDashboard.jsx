import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../services/api'
import {
  Box, Heading, Text, Button, Flex, Spinner, useBreakpointValue
} from '@chakra-ui/react'

import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid
} from 'recharts'

import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'

function EmpresaDashboard() {
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [metricasOS, setMetricasOS] = useState({
    abertas: 0,
    execucao: 0,
    atribuida: 0,
    canceladas: 0,
    pendenciadas: 0,
    finalizadas: 0
  })

  const [timelinePendenciadas, setTimelinePendenciadas] = useState([])
  const [timelineFinalizadas, setTimelineFinalizadas] = useState([])
  const [timelineCanceladas, setTimelineCanceladas] = useState([])

  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchEmpresa = async () => {
      const empresaId = localStorage.getItem('empresa_id')
      const unicID = localStorage.getItem('UnicID')

      if (!empresaId) {
        console.warn('ID da empresa não encontrado no localStorage.')
        setLoading(false)
        return
      }

      try {
        const empresaRes = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records/${empresaId}`)
        const ordensRes = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')

        const todasOrdens = ordensRes.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string'
            ? JSON.parse(item['Ordem de Serviços'])
            : item['Ordem de Serviços']

          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico.map(os => ({
              ...os,
              empresa: emp.empresa,
              UnicID_Empresa: emp.UnicID_Empresa
            }))
          )
        })

        const minhasOrdens = todasOrdens.filter(os => os.UnicID_Empresa === unicID)

        const metricas = {
          abertas: minhasOrdens.filter(o => o.Status_OS === 'Em Aberto').length,
          atribuida: minhasOrdens.filter(o => o.Status_OS === 'Atribuído').length,
          execucao: minhasOrdens.filter(o => o.Status_OS === 'Execução').length,
          canceladas: minhasOrdens.filter(o => o.Status_OS === 'Cancelado').length,
          pendenciadas: minhasOrdens.filter(o => o.Status_OS === 'Pendente').length,
          finalizadas: minhasOrdens.filter(o => o.Status_OS === 'Finalizado').length,
        }

        setEmpresa(empresaRes)
        setMetricasOS(metricas)

        const agora = new Date().toLocaleTimeString()
        setTimelinePendenciadas(prev => [...prev.slice(-9), { hora: agora, valor: metricas.pendenciadas }])
        setTimelineFinalizadas(prev => [...prev.slice(-9), { hora: agora, valor: metricas.finalizadas }])
        setTimelineCanceladas(prev => [...prev.slice(-9), { hora: agora, valor: metricas.canceladas }])
      } catch (err) {
        console.error('Erro ao buscar empresa ou ordens:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmpresa()
    const interval = setInterval(fetchEmpresa, 4000)
    return () => clearInterval(interval)
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

        <Flex justify="space-between" align="center" mb={6} wrap="wrap">
          <Text fontSize="xl">Suas Ordens de Serviço</Text>
          <Button colorScheme="blue" onClick={() => navigate('/empresa/abrir-ordem')}>
            Criar nova O.S.
          </Button>
        </Flex>

        <Flex gap={4} wrap="wrap" mb={8}>
          <Box bg="blue.50" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontWeight="bold">Em Aberto</Text>
            <Text fontSize="2xl">{metricasOS.abertas}</Text>
          </Box>
          <Box bg="yellow.50" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontWeight="bold">Atribuídas</Text>
            <Text fontSize="2xl">{metricasOS.atribuida}</Text>
          </Box>
          <Box bg="orange.50" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontWeight="bold">Em Execução</Text>
            <Text fontSize="2xl">{metricasOS.execucao}</Text>
          </Box>
          <Box bg="green.50" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontWeight="bold">Finalizadas</Text>
            <Text fontSize="2xl">{metricasOS.finalizadas}</Text>
          </Box>
          <Box bg="purple.50" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontWeight="bold">Pendenciadas</Text>
            <Text fontSize="2xl">{metricasOS.pendenciadas}</Text>
          </Box>
          <Box bg="red.50" p={4} borderRadius="md" flex="1" minW="150px">
            <Text fontWeight="bold">Canceladas</Text>
            <Text fontSize="2xl">{metricasOS.canceladas}</Text>
          </Box>
        </Flex>

        <Box mt={10}>
          <Heading size="md" mb={2}>📈 Timeline - Ordens Finalizadas</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineFinalizadas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#38A169" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box mt={10}>
          <Heading size="md" mb={2}>📌 Timeline - Ordens Pendenciadas</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelinePendenciadas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#805AD5" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box mt={10}>
          <Heading size="md" mb={2}>❌ Timeline - Ordens Canceladas</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineCanceladas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#E53E3E" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  )
}

export default EmpresaDashboard
