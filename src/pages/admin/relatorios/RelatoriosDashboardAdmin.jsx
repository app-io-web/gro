import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box, Heading, SimpleGrid, Card, CardBody, Text, Spinner, Flex, Select } from '@chakra-ui/react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useBreakpointValue } from '@chakra-ui/react'

import AdminSidebarDesktop from '../../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../../components/admin/AdminMobileMenu'
import { apiGet } from '../../../services/api'



const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ffbb28', '#8dd1e1', '#a4de6c']

function RelatoriosDashboardAdmin() {
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1) // mês atual
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())
  const navigate = useNavigate()

  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    async function fetchOrdens() {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')

        const todasEmpresas = res.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string' ? JSON.parse(item['Ordem de Serviços']) : item['Ordem de Serviços']
          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico
              .filter(os => {
                if (!os.Data_Envio_OS) return false
                const dataEnvio = new Date(os.Data_Envio_OS)
                return (
                  dataEnvio.getMonth() + 1 === parseInt(mesSelecionado) &&
                  dataEnvio.getFullYear() === parseInt(anoSelecionado)
                )
              })
              .map(os => ({
                empresa: emp.empresa,
                totalOrdens: 1
              }))
          )
        })

        const agrupado = todasEmpresas.reduce((acc, curr) => {
          const existente = acc.find(e => e.empresa === curr.empresa)
          if (existente) {
            existente.totalOrdens += curr.totalOrdens
          } else {
            acc.push({ ...curr })
          }
          return acc
        }, [])

        setDados(agrupado)
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrdens()
  }, [mesSelecionado, anoSelecionado])

  if (loading) return <Spinner size="xl" mt={20} />

  return (
    <Box display="flex">
      <Box display={{ base: 'none', md: 'block' }}>
        <AdminSidebarDesktop />
      </Box>

      <Box flex="1">
        {/* Renderiza o Menu Mobile apenas se for visualização móvel */}
        {isMobile && <AdminMobileMenu />}
        {isMobile && <AdminBottomNav />}

        <Box p={6} ml={{ base: 0, md: '250px' }}>
          <Heading mb={6}>📊 Relatórios de Ordens por Empresa</Heading>

          {/* Filtros de Data */}
          <Flex mb={6} gap={4} flexWrap="wrap">
            <Box>
              <Text mb={1} fontSize="sm">Mês</Text>
              <Select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </Select>
            </Box>
            <Box>
              <Text mb={1} fontSize="sm">Ano</Text>
              <Select value={anoSelecionado} onChange={(e) => setAnoSelecionado(e.target.value)}>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </Select>
            </Box>
          </Flex>

          {/* Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={10}>
            {dados.map((empresa, idx) => (
              <Card
                key={idx}
                boxShadow="md"
                cursor="pointer"
                onClick={() => navigate(`/admin/relatorios/${encodeURIComponent(empresa.empresa)}?mes=${mesSelecionado}&ano=${anoSelecionado}`)}
                _hover={{ boxShadow: 'xl', transform: 'scale(1.02)', transition: '0.2s' }}
              >
                <CardBody>
                  <Text fontWeight="bold" fontSize="lg">{empresa.empresa}</Text>
                  <Text fontSize="sm" color="gray.500">{empresa.totalOrdens} Ordens</Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Gráficos */}
          <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
            <Box flex="1" h="300px">
              <Heading size="md" mb={4}>Gráfico de Barras</Heading>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados}>
                  <XAxis dataKey="empresa" hide={false} angle={-45} textAnchor="end" interval={0} height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalOrdens" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box flex="1" h="300px">
              <Heading size="md" mb={4}>Gráfico de Pizza</Heading>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dados}
                    dataKey="totalOrdens"
                    nameKey="empresa"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {dados.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Flex>

        </Box>
      </Box>
    </Box>
  )
}

export default RelatoriosDashboardAdmin
