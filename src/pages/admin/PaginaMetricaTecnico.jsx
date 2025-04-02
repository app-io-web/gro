import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  Spinner,
  useBreakpointValue,
  SimpleGrid,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react'

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'


import { Input, Flex } from '@chakra-ui/react'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import { apiGet } from '../../services/api'


import DatePicker, { registerLocale } from 'react-datepicker'
import ptBR from 'date-fns/locale/pt-BR'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('pt-BR', ptBR)
import { format } from 'date-fns'

function PaginaMetricaTecnico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [metricas, setMetricas] = useState(null)
  const [nomeTecnico, setNomeTecnico] = useState('')
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [ordemExecucao, setOrdemExecucao] = useState(null)


useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const tecnicosRes = await apiGet('/api/v2/tables/mpyestriqe5a1kc/records')
        const tecnico = tecnicosRes.list.find(t => t.ID_Tecnico_Responsavel === id)
        setNomeTecnico(tecnico?.Tecnico_Responsavel || 'Desconhecido')
  
        const ordensRes = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const todasOrdens = ordensRes.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string'
            ? JSON.parse(item['Ordem de Serviços'])
            : item['Ordem de Serviços']
  
          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico.filter(os => os.ID_Tecnico_Responsavel === id).map(os => ({
              ...os,
              empresa: emp.empresa
            }))
          )
        })
  
        const ordemExecucao = todasOrdens.find(os => os.Status_OS === 'Execução')
        setOrdemExecucao(ordemExecucao || null)
        
  
        // 🟦 Função de filtro por data
        const dentroDoPeriodo = (dataStr) => {
            if (!dataInicio) return true;
            
            const inicio = new Date(dataInicio)
            inicio.setHours(0, 0, 0, 0)
          
            const fim = dataFim ? new Date(dataFim) : new Date()
            fim.setHours(23, 59, 59, 999)
          
            const data = new Date(dataStr)
            return data >= inicio && data <= fim
          }
          
          
  
        const atribuidas = todasOrdens.filter(os => os.Status_OS === 'Atribuido' && dentroDoPeriodo(os.Data_Entrega_OS))
        const finalizadas = todasOrdens.filter(os => os.Status_OS === 'Finalizado' && dentroDoPeriodo(os.Data_Entrega_OS))
        const pendentes = todasOrdens.filter(os => os.Status_OS === 'Pendente' && dentroDoPeriodo(os.Data_Entrega_OS))
        const reagendadas = todasOrdens.filter(os => os.Status_OS === 'Reagendada' && dentroDoPeriodo(os.Data_Entrega_OS))
  
        const finalizadasMes = finalizadas
  
        const tempos = finalizadas
          .filter(os => os.Data_Envio_OS && os.Data_Entrega_OS)
          .map(os => {
            const envio = new Date(os.Data_Envio_OS).getTime()
            const entrega = new Date(os.Data_Entrega_OS).getTime()
            const tempoHoras = (entrega - envio) / (1000 * 60 * 60)
            return { tempo: tempoHoras, os }
          })
  
        const maisRapida = tempos.reduce((a, b) => a.tempo < b.tempo ? a : b, tempos[0])
        const maisLenta = tempos.reduce((a, b) => a.tempo > b.tempo ? a : b, tempos[0])
  
        setMetricas({
          totalFinalizadas: finalizadasMes.length,
          pendentes: pendentes.length,
          reagendadas: reagendadas.length,
          atribuidas: atribuidas.length,
          maisRapida: maisRapida?.os,
          maisLenta: maisLenta?.os
        })
  
      } catch (err) {
        console.error('Erro ao buscar métricas:', err)
      } finally {
        setLoading(false)
      }
    }
  
    fetchMetricas()

    const interval = setInterval(fetchMetricas, 1000) // 10 segundos
    return () => clearInterval(interval)

  }, [id, dataInicio, dataFim])
  

  if (loading) return <Spinner size="xl" />

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}

      <Box ml={!isMobile ? '250px' : 0} w="full" p={6} pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}

        <Button onClick={() => navigate('/admin/tecnicos')} colorScheme="gray" size="sm" mb={4}>
          ← Voltar
        </Button>

        {ordemExecucao && (
  isMobile ? (
    <Accordion allowToggle mb={4}>
      <AccordionItem 
        border="1px solid"
        borderColor="green.300"
        borderRadius="lg"
        bg="green.50"
        boxShadow="md"
        px={4}
        py={2}
      >
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="semibold" color="green.700">
              🔧 Ordem em Execução
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pt={2} color="gray.700" fontSize="sm">
          <Text><strong>Cliente:</strong> {ordemExecucao.Nome_Cliente}</Text>
          <Text><strong>Telefone:</strong> {ordemExecucao.Telefone1_Cliente}</Text>
          <Text><strong>Tipo:</strong> {ordemExecucao.Tipo_OS}</Text>
          <Text><strong>Endereço:</strong> {ordemExecucao.Endereco_Cliente}</Text>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ) : (
    <Box
      position="absolute"
      top="20px"
      right="20px"
      bg="green.50"
      borderRadius="lg"
      border="1px solid"
      borderColor="green.400"
      boxShadow="lg"
      p={4}
      zIndex={1000}
      w="300px"
      color="gray.800"
    >
      <Heading size="sm" mb={3} color="green.700">🔧 Ordem em Execução</Heading>
      <Text fontSize="sm" mb={1}><strong>Cliente:</strong> {ordemExecucao.Nome_Cliente}</Text>
      <Text fontSize="sm" mb={1}><strong>Telefone:</strong> {ordemExecucao.Telefone1_Cliente}</Text>
      <Text fontSize="sm" mb={1}><strong>Tipo:</strong> {ordemExecucao.Tipo_OS}</Text>
      <Text fontSize="sm"><strong>Endereço:</strong> {ordemExecucao.Endereco_Cliente}</Text>
    </Box>
  )
)}




        <Heading size="lg" mb={4}>Métricas do Técnico</Heading>
        <Text fontWeight="bold" mb={6}>{nomeTecnico}</Text>

        {metricas && (



          <>

                    <Flex gap={4} mb={6} direction={{ base: 'column', md: 'row' }}>
                    <Box>
                        <Text mb={1}>Data Início</Text>
                        <DatePicker
                        selected={dataInicio}
                        onChange={(date) => setDataInicio(date)}
                        locale="pt-BR"
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Selecione a data"
                        customInput={<Input />}
                        />
                    </Box>
                    <Box>
                        <Text mb={1}>Data Fim</Text>
                        <DatePicker
                        selected={dataFim}
                        onChange={(date) => setDataFim(date)}
                        locale="pt-BR"
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Selecione a data"
                        customInput={<Input />}
                        />
                    </Box>
                    </Flex>

                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
                <Stat p={4} shadow="md" border="1px" borderColor="gray.100" borderRadius="md" bg="gray.50">
                    <StatLabel>Finalizadas no Mês</StatLabel>
                    <StatNumber>{metricas.totalFinalizadas}</StatNumber>
                </Stat>

                <Stat p={4} shadow="md" border="1px" borderColor="gray.100" borderRadius="md" bg="gray.50">
                    <StatLabel>Pendentes</StatLabel>
                    <StatNumber>{metricas.pendentes}</StatNumber>
                </Stat>

                <Stat p={4} shadow="md" border="1px" borderColor="gray.100" borderRadius="md" bg="gray.50">
                    <StatLabel>Reagendadas</StatLabel>
                    <StatNumber>{metricas.reagendadas}</StatNumber>
                </Stat>

                <Stat p={4} shadow="md" border="1px" borderColor="gray.100" borderRadius="md" bg="gray.50">
                    <StatLabel>Atribuídas</StatLabel>
                    <StatNumber>{metricas.atribuidas}</StatNumber>
                </Stat>
                </SimpleGrid>


            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
              <Box p={4} shadow="md" border="1px" borderColor="gray.100" borderRadius="md" bg="green.50">
                <Heading size="sm" mb={2}>Mais Rápida</Heading>
                <Text><strong>Cliente:</strong> {metricas.maisRapida?.Nome_Cliente}</Text>
                <Text>
                  <strong>Tempo:</strong>{' '}
                  {metricas.maisRapida?.Data_Entrega_OS && metricas.maisRapida?.Data_Envio_OS
                    ? `${((new Date(metricas.maisRapida.Data_Entrega_OS) - new Date(metricas.maisRapida.Data_Envio_OS)) / 3600000).toFixed(2)}h`
                    : 'N/A'}
                </Text>
              </Box>

              <Box p={4} shadow="md" border="1px" borderColor="gray.100" borderRadius="md" bg="red.50">
                <Heading size="sm" mb={2}>Mais Lenta</Heading>
                <Text><strong>Cliente:</strong> {metricas.maisLenta?.Nome_Cliente}</Text>
                <Text>
                  <strong>Tempo:</strong>{' '}
                  {metricas.maisLenta?.Data_Entrega_OS && metricas.maisLenta?.Data_Envio_OS
                    ? `${((new Date(metricas.maisLenta.Data_Entrega_OS) - new Date(metricas.maisLenta.Data_Envio_OS)) / 3600000).toFixed(2)}h`
                    : 'N/A'}
                </Text>
              </Box>


            </SimpleGrid>

            <Heading size="sm" mb={2}>Gráfico</Heading>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Finalizadas', valor: metricas.totalFinalizadas },
                { name: 'Pendentes', valor: metricas.pendentes },
                { name: 'Reagendadas', valor: metricas.reagendadas }
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#805AD5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </Box>
    </Box>
  )
}

export default PaginaMetricaTecnico
