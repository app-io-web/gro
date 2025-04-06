import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../services/api'
import {
  Box, Heading, Text, Button, Flex, Spinner, useBreakpointValue
} from '@chakra-ui/react'

import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid
} from 'recharts'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter
} from '@chakra-ui/react'

import { useDisclosure } from '@chakra-ui/react'
import { useMemo } from 'react'





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
    agendadas: 0,
    canceladas: 0,
    pendenciadas: 0,
    finalizadas: 0,
    improdutivas: 0 // 👈 isso aqui tava faltando!
  })

  const [timelinePendenciadas, setTimelinePendenciadas] = useState([])
  const [timelineFinalizadas, setTimelineFinalizadas] = useState([])
  const [timelineCanceladas, setTimelineCanceladas] = useState([])
  const [mostrarImprodutivas, setMostrarImprodutivas] = useState(true)



  const { isOpen, onOpen, onClose } = useDisclosure()
  const restante = empresa?.restanteOSMes ?? 0


      // Define estilos dinâmicos
    const restanteColor = restante === 0
    ? 'red.100'
    : restante <= 3
      ? 'yellow.100'
      : 'green.100'

    const restanteTextColor = restante === 0
    ? 'red.800'
    : restante <= 3
      ? 'yellow.800'
      : 'green.800'

    // Classe CSS para pulsar
    const pulseClass = restante <= 3 ? 'pulse-animation' : ''

    // Se esgotado, desativa o botão e mostra modal ao clicar
    const handleClick = () => {
      if (restante <= 0) {
        onOpen() // abre o modal
      } else {
        navigate('/empresa/abrir-ordem') // navega normalmente
      }
    }
    
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
        const agora = new Date(); // ✅ Declarado aqui corretamente
      
        // Buscando informações da empresa
        const empresaRes = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records/${empresaId}`);
        if (!empresaRes) {
          throw new Error('Não foi possível recuperar dados da empresa.');
        }
      
        // Buscando ordens de serviço
        const ordensRes = await apiGet('/api/v2/tables/mtnh21kq153to8h/records');
        if (!ordensRes || !ordensRes.list) {
          throw new Error('Não foi possível recuperar as ordens de serviço.');
        }
      
        const todasOrdens = ordensRes.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string'
            ? JSON.parse(item['Ordem de Serviços'])
            : item['Ordem de Serviços'];
      
          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico.map(os => ({
              ...os,
              empresa: emp.empresa,
              UnicID_Empresa: emp.UnicID_Empresa
            }))
          );
        });
      
        const minhasOrdens = todasOrdens.filter(os => os.UnicID_Empresa === unicID);
        const mesAtual = agora.toISOString().slice(0, 7); // "2025-04"
      
        const ordensDoMes = minhasOrdens.filter(o => {
          const dataEnvio = new Date(o.Data_Envio_OS);
          return dataEnvio.toISOString().slice(0, 7) === mesAtual;
        });
      
        const usadas = ordensDoMes.length;
        const limite = empresaRes.Limite_de_Ordem || 0;
        const restante = Math.max(limite - usadas, 0);
      
        console.log('[DEBUG] Limite:', limite);
        console.log('[DEBUG] Ordens no mês:', usadas);
        console.log('[DEBUG] Restante de ordens:', restante);
      
        setEmpresa({ ...empresaRes, usadasOSMes: usadas, restanteOSMes: restante });
      
        const metricas = {
          abertas: minhasOrdens.filter(o =>
            ['Em Aberto', 'Agendada', 'Reagendada', 'Pendente', 'Atribuído', 'Enviado'].includes(o.Status_OS)
          ).length,
          agendadas: minhasOrdens.filter(o => o.Status_OS === 'Agendada').length,
          execucao: minhasOrdens.filter(o => o.Status_OS === 'Execução').length,
          canceladas: minhasOrdens.filter(o => o.Status_OS === 'Cancelado').length,
          pendenciadas: minhasOrdens.filter(o => o.Status_OS === 'Pendente').length,
          finalizadas: minhasOrdens.filter(o => o.Status_OS === 'Finalizado').length,
          improdutivas: minhasOrdens.filter(o =>
            ['improdutivo', 'improdutivos'].includes(o.Status_OS?.toLowerCase())
          ).length,
        };
      
        setMetricasOS(metricas);
      
        const horaAtual = agora.toLocaleTimeString();
        setTimelinePendenciadas(prev => [...prev.slice(-9), { hora: horaAtual, valor: metricas.pendenciadas }]);
        setTimelineFinalizadas(prev => [...prev.slice(-9), { hora: horaAtual, valor: metricas.finalizadas }]);
        setTimelineCanceladas(prev => [...prev.slice(-9), { hora: horaAtual, valor: metricas.canceladas }]);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setMostrarImprodutivas(prev => !prev)
    }, 8000) // 10 segundos
  
    return () => clearInterval(interval)
  }, [])
  
  const ultimoCard = useMemo(() => {
    return (mostrarImprodutivas && metricasOS.improdutivas > 0)
      ? {
          bg: "gray.200",
          label: "Improdutivas",
          valor: metricasOS.improdutivas,
          rota: "/empresa/ordens-improdutivas"
        }
      : {
          bg: "red.50",
          label: "Canceladas",
          valor: metricasOS.canceladas,
          rota: "/empresa/ordens-canceladas"
        }
  }, [mostrarImprodutivas, metricasOS])
  
  const cardsOS = useMemo(() => [
    { bg: "blue.50", label: "Em Aberto", valor: metricasOS.abertas, rota: "/empresa/ordens-abertas" },
    { bg: "cyan.50", label: "Agendadas", valor: metricasOS.agendadas, rota: "/empresa/ordens-agendadas" },
    { bg: "orange.50", label: "Em Execução", valor: metricasOS.execucao, rota: "/empresa/ordens-andamento" },
    { bg: "green.50", label: "Finalizadas", valor: metricasOS.finalizadas, rota: "/empresa/ordens-finalizadas" },
    { bg: "purple.50", label: "Pendenciadas", valor: metricasOS.pendenciadas, rota: "/empresa/ordens-pendenciadas" },
    ultimoCard
  ], [ultimoCard, metricasOS])
  
  

  if (loading) return <Spinner size="xl" mt={20} />
  if (!empresa) return <Text>Empresa não encontrada.</Text>





  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box
          ml={!isMobile ? '250px' : 0}
          p={6}
          minH="100vh"
          pb={isMobile ? '100px' : '0'} // 👈 adiciona paddingBottom no mobile
        >
      <Heading size="lg" mb={4}>Bem-vindo, {empresa?.empresa_nome}</Heading>

      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Text fontSize="xl">Suas Ordens de Serviço</Text>

        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify={{ base: 'flex-start', md: 'flex-end' }}
          gap={3}
          w={{ base: '100%', md: 'auto' }}
        >
          <Box
            bg="gray.100"
            px={4}
            py={2}
            borderRadius="lg"
            boxShadow="md"
            textAlign="center"
            w={{ base: '100%', md: 'auto' }}
          >
            <Text fontSize="sm" fontWeight="bold" color="gray.600">
              Limite de O.S.
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              {empresa?.Limite_de_Ordem ?? 0}
            </Text>
          </Box>

          <Box
            className={pulseClass}
            bg={restanteColor}
            px={4}
            py={2}
            borderRadius="lg"
            boxShadow="md"
            textAlign="center"
            w={{ base: '100%', md: 'auto' }}
          >
            <Text fontSize="sm" fontWeight="bold" color={restanteTextColor}>
              Restantes
            </Text>
            <Text fontSize="lg" fontWeight="bold" color={restanteTextColor}>
              {empresa?.restanteOSMes ?? 0}
            </Text>
          </Box>

          <Button
            colorScheme="blue"
            onClick={handleClick}
            w={{ base: '100%', md: 'auto' }}
          >
            Criar nova O.S.
          </Button>
        </Flex>

          {/* Modal para aviso */}
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Aviso</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                O limite de ordens de serviço foi atingido. <br />
                Por favor, entre em contato com os administradores para liberar novas O.S.
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Fechar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

      </Flex>



      <Flex gap={4} wrap="wrap" mb={8}>
        {cardsOS.map((card, i) => (
          <Box
            key={i}
            bg={card.bg}
            p={4}
            borderRadius="lg"
            flex="1"
            minW="150px"
            cursor="pointer"
            transition="all 0.3s ease"
            boxShadow="sm"
            _hover={{ bg: `${card.bg.replace('.50', '.100')}`, boxShadow: "lg", transform: "translateY(-3px)" }}
            onClick={() => navigate(card.rota)}
          >
            <Text fontWeight="bold">{card.label}</Text>
            <Text fontSize="2xl">{card.valor}</Text>
          </Box>
        ))}
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
