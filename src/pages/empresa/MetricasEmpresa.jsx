// src/pages/empresa/MetricasEmpresa.jsx
import {
    Box, Heading, useBreakpointValue, VStack, Spinner, Stat, StatLabel,
    StatNumber, SimpleGrid, Flex, Input, Text
  } from '@chakra-ui/react'
  import { useEffect, useState } from 'react'
  import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer
  } from 'recharts'
  import { apiGet } from '../../services/api'
  import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
  import AdminBottomNav from '../../components/admin/AdminBottomNav'
  import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
  
  function MetricasEmpresa() {
    const [metricas, setMetricas] = useState(null)
    const [loading, setLoading] = useState(true)
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const isMobile = useBreakpointValue({ base: true, md: false })
    const UnicID_Empresa = localStorage.getItem('UnicID')
  
    useEffect(() => {
      const fetchMetricas = async () => {
        try {
          const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
          let totalAbertas = 0
          let totalFinalizadas = 0
          let tipos = {}
  
          res.list.forEach(item => {
            const raw = item['Ordem de Serviços']
            if (!raw) return
  
            const json = typeof raw === 'string' ? JSON.parse(raw) : raw
            const empresas = json?.empresas || []
            const empresa = empresas.find(e => e.UnicID_Empresa === UnicID_Empresa)
            if (!empresa) return
  
            empresa.Ordens_de_Servico?.forEach(os => {
              const dataEnvio = new Date(os.Data_Envio_OS || '').toISOString().slice(0, 10) // formato yyyy-mm-dd
  
              if (dataInicio && dataEnvio < dataInicio) return
              if (dataFim && dataEnvio > dataFim) return
  
              if (os.Status_OS === 'Finalizado') {
                totalFinalizadas++
              } else {
                totalAbertas++
              }
  
              if (os.Tipo_OS) {
                tipos[os.Tipo_OS] = (tipos[os.Tipo_OS] || 0) + 1
              }
            })
          })
  
          const tiposArray = Object.entries(tipos).map(([tipo, count]) => ({ tipo, count }))
          setMetricas({ totalAbertas, totalFinalizadas, tiposArray })
        } catch (err) {
          console.error('Erro ao carregar métricas:', err)
        } finally {
          setLoading(false)
        }
      }
  
      fetchMetricas()
    }, [dataInicio, dataFim])
  
    const cores = ['#3182ce', '#63b3ed', '#90cdf4', '#4299e1', '#2b6cb0']
  
    return (
      <Box display="flex">
        {!isMobile && <AdminSidebarDesktop />}
        {isMobile && <AdminMobileMenu />}
        {isMobile && <AdminBottomNav />}
  
        <Box w="full" ml={!isMobile ? '250px' : 0} p={6} pb={isMobile ? '60px' : 0}>
          <Heading size="lg" mb={4}>📊 Métricas da Empresa</Heading>
  
          <Flex gap={4} mb={6} flexWrap="wrap">
            <Box>
              <Text fontWeight="medium">Data Início:</Text>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </Box>
            <Box>
              <Text fontWeight="medium">Data Fim:</Text>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </Box>
          </Flex>
  
          {loading ? (
            <Spinner size="xl" />
          ) : (
            <VStack align="stretch" spacing={6}>
              <SimpleGrid columns={2} spacing={4}>
                <Stat>
                  <StatLabel>Ordens Abertas</StatLabel>
                  <StatNumber>{metricas.totalAbertas}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Ordens Finalizadas</StatLabel>
                  <StatNumber>{metricas.totalFinalizadas}</StatNumber>
                </Stat>
              </SimpleGrid>

  
              <Box>
                <Heading size="sm" mb={2}>📈 Tipos de O.S (Gráfico de Barras)</Heading>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metricas.tiposArray}>
                    <XAxis dataKey="tipo" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Bar dataKey="count">
                      {metricas.tiposArray.map((_, index) => (
                        <Cell key={index} fill={cores[index % cores.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
  
              <Box>
                <Heading size="sm" mb={2}>🧩 Distribuição de Tipos (Pizza)</Heading>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metricas.tiposArray}
                      dataKey="count"
                      nameKey="tipo"
                      outerRadius={90}
                      label
                    >
                      {metricas.tiposArray.map((_, index) => (
                        <Cell key={index} fill={cores[index % cores.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </VStack>
          )}
        </Box>
      </Box>
    )
  }
  
  export default MetricasEmpresa
  