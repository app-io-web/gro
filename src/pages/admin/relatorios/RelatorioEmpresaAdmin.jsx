import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  Box, Heading, Select, Spinner, VStack, Text, Button,
  Flex, Input, Badge, Card, CardBody
} from '@chakra-ui/react'
import { apiGet } from '../../../services/api'
import AdminSidebarDesktop from '../../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../../components/admin/AdminMobileMenu'
import { useBreakpointValue } from '@chakra-ui/react'

function RelatorioEmpresaAdmin() {
  const { nomeEmpresa } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [loadingAnalise, setLoadingAnalise] = useState(false)


  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusSelecionado, setStatusSelecionado] = useState('')

  const queryParams = new URLSearchParams(location.search)
  const mes = queryParams.get('mes')
  const ano = queryParams.get('ano')

  const mesFormatado = mes?.padStart(2, '0') || (new Date().getMonth() + 1).toString().padStart(2, '0')
  const anoFormatado = ano || new Date().getFullYear()

  const [dataInicial, setDataInicial] = useState(`${anoFormatado}-${mesFormatado}-01`)
  const [dataFinal, setDataFinal] = useState(`${anoFormatado}-${mesFormatado}-${new Date(anoFormatado, mesFormatado, 0).getDate()}`)

  useEffect(() => {
    async function fetchOrdens() {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const todasOrdens = res.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string' ? JSON.parse(item['Ordem de Serviços']) : item['Ordem de Serviços']
          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico.map(os => ({
              ...os,
              empresa: emp.empresa,
              UnicID_Empresa: emp.UnicID_Empresa
            }))
          )
        })

        const ordensEmpresa = todasOrdens.filter(os => os.empresa === nomeEmpresa)
        setOrdens(ordensEmpresa)
      } catch (err) {
        console.error('Erro ao buscar ordens:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrdens()
  }, [nomeEmpresa])

  const ordensFiltradas = ordens.filter(os => {
    const dataEnvio = new Date(os.Data_Envio_OS)
    const inicio = dataInicial ? new Date(dataInicial + 'T00:00:00') : null
    const fim = dataFinal ? new Date(dataFinal + 'T23:59:59') : null

    let dentroPeriodo = true

    if (inicio && fim) {
      dentroPeriodo = dataEnvio >= inicio && dataEnvio <= fim
    } else if (inicio) {
      dentroPeriodo = dataEnvio >= inicio
    } else if (fim) {
      dentroPeriodo = dataEnvio <= fim
    }

    const statusOk = !statusSelecionado || os.Status_OS === statusSelecionado

    return dentroPeriodo && statusOk
  })


  function handleAnaliseAutomatica() {
    setLoadingAnalise(true) // Começa o loading
  
    const analise = {
      improdutivas: 0,
      canceladas: 0,
      instalacoes: 0,
      trocasEndereco: 0,
      rompimentos: 0,
      manutencoes: 0,
      materiais: {
        Drop_Metros: 0,
        Esticadores: 0,
        Conectores: 0,
        FixaFio: 0
      },
      materiaisFaltando: []
    }
  
    ordensFiltradas.forEach(ordem => {
      if (ordem.Status_OS === "Improdutiva") analise.improdutivas++
      if (ordem.Status_OS === "Cancelado") analise.canceladas++
  
      if (ordem.Tipo_OS === "Instalação") analise.instalacoes++
      if (ordem.Tipo_OS === "Alteração de Endereço") analise.trocasEndereco++
      if (ordem.Tipo_OS === "Rompimento") analise.rompimentos++
      if (ordem.Tipo_OS === "Manutenção") analise.manutencoes++
  
      const materiais = ordem.Materiais_Utilizados || {}
  
      analise.materiais.Drop_Metros += materiais.Drop_Metros || 0
      analise.materiais.Esticadores += materiais.Esticadores || 0
      analise.materiais.Conectores += materiais.Conectores || 0
      analise.materiais.FixaFio += materiais.FixaFio || 0
    })
  
    if (analise.materiais.Drop_Metros === 0) analise.materiaisFaltando.push('Drop em Metros')
    if (analise.materiais.Esticadores === 0) analise.materiaisFaltando.push('Alçadores')
    if (analise.materiais.Conectores === 0) analise.materiaisFaltando.push('Conectores')
    if (analise.materiais.FixaFio === 0) analise.materiaisFaltando.push('Fixa Fios')
  
    // Espera um pequeno tempo para mostrar o loading antes de navegar
    setTimeout(() => {
      navigate(`/admin/relatorios/empresa/${nomeEmpresa}/analise`, { 
        state: { 
          analise: { 
            ...analise, 
            ordens: ordensFiltradas 
          } 
        } 
      })
    }, 1500) // 1.5 segundos de loading animado
  }
  
  if (loading || loadingAnalise) {
    return (
      <Flex direction="column" align="center" justify="center" minH="100vh">
        <Spinner size="xl" thickness="5px" speed="0.65s" color="purple.500" />
        <Text mt={4} fontSize="lg" color="gray.600">Analisando os dados...</Text>
      </Flex>
    )
  }
  
  

  if (loading) return <Spinner size="xl" mt={20} />

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box flex="1" p={6} ml={{ base: 0, md: '250px' }}>
        <Button
          mb={6}
          onClick={() => navigate(-1)}
          colorScheme="blue"
          variant="solid"
          size="sm"
          borderRadius="full"
        >
          Voltar
        </Button>

        <Heading mb={6}>📄 Relatório da Empresa: {nomeEmpresa}</Heading>

        {/* Filtros */}
        <Flex gap={4} mb={8} flexWrap="wrap" align="flex-end">

          <Box>
            <Text fontSize="sm" mb={1}>Data Inicial</Text>
            <Input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              maxW="200px"
              borderRadius="lg"
            />
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>Data Final</Text>
            <Input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              maxW="200px"
              borderRadius="lg"
            />
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>Status</Text>
            <Select
              placeholder="Todos"
              value={statusSelecionado}
              onChange={(e) => setStatusSelecionado(e.target.value)}
              maxW="200px"
              borderRadius="lg"
            >
              <option value="Em Aberto">Em Aberto</option>
              <option value="Atribuido">Atribuído</option>
              <option value="Enviado">Enviado</option>
              <option value="Execução">Execução</option>
              <option value="Pendente">Pendente</option>
              <option value="Improdutiva">Improdutiva</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Agendada">Agendada</option>
              <option value="Finalizado">Finalizado</option>
            </Select>
          </Box>

          <Button
                colorScheme="purple"
                borderRadius="full"
                size="sm"
                onClick={() => handleAnaliseAutomatica()}
                >
                Fazer Análise Automática
                </Button>

        </Flex>

        {/* Cards de Ordens */}
        <VStack spacing={4} align="stretch">
          {ordensFiltradas.map((os, idx) => (
            <Card
              key={idx}
              boxShadow="md"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ boxShadow: 'lg', transform: 'scale(1.01)', transition: '0.2s' }}
            >
              <CardBody>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="bold">Cliente: {os.Nome_Cliente}</Text>
                  <Badge colorScheme={
                    os.Status_OS === "Finalizado" ? "green" :
                    os.Status_OS === "Cancelado" ? "red" :
                    os.Status_OS === "Improdutiva" ? "yellow" : "blue"
                  }>
                    {os.Status_OS}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="gray.600" mb={1}>📍 {os.Endereco_Cliente}</Text>
                <Text fontSize="xs" color="gray.400">📅 {new Date(os.Data_Envio_OS).toLocaleString('pt-BR')}</Text>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>
    </Box>
  )
}

export default RelatorioEmpresaAdmin
