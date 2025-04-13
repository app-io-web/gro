import { useEffect, useState } from 'react';
import { Box, Grid, Heading, Flex, Spinner, Stat, StatLabel, StatNumber, StatHelpText, useToast, Select } from '@chakra-ui/react';
import { 
Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Input, Button, VStack
} from '@chakra-ui/react';

import { 
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  RadarChart, Radar,
  ScatterChart, Scatter,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
  ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ZAxis 
} from 'recharts';

import NeuralNetworkCanvas from './NeuralNetworkCanvas';

import { apiGet } from '../../services/api';

import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'

export default function AdminMetricas() {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    administracao: 0,
    empresas: 0,
    tecnicos: 0,
    tarefas: 0,
    ordens: 0
  });
  const [graficoTempoReal, setGraficoTempoReal] = useState([]);
  const [graficoHistorico, setGraficoHistorico] = useState([]);
  const [filtroHistorico, setFiltroHistorico] = useState('tudo');
  const [tipoGraficoTempoReal, setTipoGraficoTempoReal] = useState('area');
  const [tipoGraficoHistorico, setTipoGraficoHistorico] = useState('line');
  const [ultimoValorMetricas, setUltimoValorMetricas] = useState({});
  const [apiAtiva, setApiAtiva] = useState(true);


  const [senhaModal, setSenhaModal] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [senhaCorreta] = useState('dev01-admin1234');
  const [isSenhaOpen, setIsSenhaOpen] = useState(true);

  const toast = useToast();


  // Verifica se mudou
  useEffect(() => {
    const intervalo = setInterval(() => {
      const mudou = (
        ultimoValorMetricas.administracao !== metricas.administracao ||
        ultimoValorMetricas.empresas !== metricas.empresas ||
        ultimoValorMetricas.tecnicos !== metricas.tecnicos ||
        ultimoValorMetricas.tarefas !== metricas.tarefas ||
        ultimoValorMetricas.ordens !== metricas.ordens
      );
  
      if (mudou) {
        setApiAtiva(true);
        setUltimoValorMetricas(metricas);
      } else {
        setApiAtiva(false);
      }
    }, 3000); // a cada 3000 ms = 3 segundos
  
    return () => clearInterval(intervalo); // limpar o intervalo ao desmontar
  }, [metricas, ultimoValorMetricas]);
  

  useEffect(() => {
    const buscarMetricasTempoReal = async () => {
      try {
        const [admin, empresas, tecnicos, tarefas, ordens] = await Promise.all([
          apiGet('/api/v2/tables/mga2sghx95o3ssp/records/count'),
          apiGet('/api/v2/tables/mdbub9a31zt7aly/records/count'),
          apiGet('/api/v2/tables/mpyestriqe5a1kc/records/count'),
          apiGet('/api/v2/tables/mvgmphezonf3jyk/records/count'),
          apiGet('/api/v2/tables/mtnh21kq153to8h/records'),
        ]);

        let totalOrdens = 0;
        if (ordens.list && Array.isArray(ordens.list)) {
          ordens.list.forEach((registro) => {
            const jsonOrdemServicos = registro['Ordem de Serviços'];
            if (jsonOrdemServicos && Array.isArray(jsonOrdemServicos.empresas)) {
              jsonOrdemServicos.empresas.forEach((empresa) => {
                if (Array.isArray(empresa.Ordens_de_Servico)) {
                  totalOrdens += empresa.Ordens_de_Servico.length;
                }
              });
            }
          });
        }

        setMetricas({
          administracao: admin.count || 0,
          empresas: empresas.count || 0,
          tecnicos: tecnicos.count || 0,
          tarefas: tarefas.count || 0,
          ordens: totalOrdens,
        });

        const agora = new Date().toLocaleTimeString('pt-BR');
        setGraficoTempoReal((prev) => [
          ...prev.slice(-20),
          { time: agora, administracao: admin.count, empresas: empresas.count, tecnicos: tecnicos.count, tarefas: tarefas.count, ordens: totalOrdens }
        ]);

      } catch (error) {
        console.error('❌ Erro no tempo real:', error);
        toast({
          title: 'Erro ao carregar métricas em tempo real',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    buscarMetricasTempoReal();
    const interval = setInterval(buscarMetricasTempoReal, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        const res = await fetch('https://savedb-gro.nexusnerds.com.br/historico-metricas');
        const data = await res.json();

        if (data.historico.length > 0) {
          const formatado = data.historico.map(item => ({
            dataHora: new Date(item.dataHora),
            time: new Date(item.dataHora).toLocaleTimeString('pt-BR'),
            administracao: item.administracao,
            empresas: item.empresas,
            tecnicos: item.tecnicos,
            tarefas: item.tarefas,
            ordens: item.ordens
          }));

          setGraficoHistorico(formatado);
        }
      } catch (error) {
        console.error('❌ Erro no histórico:', error);
      }
    };

    buscarHistorico();
    const interval = setInterval(buscarHistorico, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtrarHistorico = () => {
    const agora = new Date();
    switch (filtroHistorico) {
      case '1h': return graficoHistorico.filter(item => agora - item.dataHora <= 3600000);
      case '24h': return graficoHistorico.filter(item => agora - item.dataHora <= 86400000);
      case '7d': return graficoHistorico.filter(item => agora - item.dataHora <= 604800000);
      default: return graficoHistorico;
    }
  };

  const renderizarGraficoTempoReal = () => {
    switch (tipoGraficoTempoReal) {
      case 'area':
        return (
          <AreaChart data={graficoTempoReal}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="administracao" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="empresas" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="tecnicos" stroke="#ffc658" fill="#ffc658" />
            <Area type="monotone" dataKey="tarefas" stroke="#ff8042" fill="#ff8042" />
            <Area type="monotone" dataKey="ordens" stroke="#0088FE" fill="#0088FE" />
          </AreaChart>
        );
  
      case 'bar':
        return (
          <BarChart data={graficoTempoReal}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="administracao" fill="#8884d8" />
            <Bar dataKey="empresas" fill="#82ca9d" />
            <Bar dataKey="tecnicos" fill="#ffc658" />
            <Bar dataKey="tarefas" fill="#ff8042" />
            <Bar dataKey="ordens" fill="#0088FE" />
          </BarChart>
        );
  
      case 'radar':
        return (
          <RadarChart outerRadius={90} width={500} height={300} data={graficoTempoReal}>
            <PolarGrid />
            <PolarAngleAxis dataKey="time" />
            <PolarRadiusAxis />
            <Radar name="Administração" dataKey="administracao" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="Empresas" dataKey="empresas" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <Radar name="Técnicos" dataKey="tecnicos" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
            <Radar name="Tarefas" dataKey="tarefas" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
            <Radar name="Ordens" dataKey="ordens" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        );
  
      default:
        return (
          <LineChart data={graficoTempoReal}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="administracao" stroke="#8884d8" />
            <Line type="monotone" dataKey="empresas" stroke="#82ca9d" />
            <Line type="monotone" dataKey="tecnicos" stroke="#ffc658" />
            <Line type="monotone" dataKey="tarefas" stroke="#ff8042" />
            <Line type="monotone" dataKey="ordens" stroke="#0088FE" />
          </LineChart>
        );
    }
  };




  const renderizarGraficoHistorico = () => {
    const dataFiltrada = filtrarHistorico();
    switch (tipoGraficoHistorico) {
      case 'area':
        return (
          <AreaChart data={dataFiltrada}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="administracao" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="empresas" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="tecnicos" stroke="#ffc658" fill="#ffc658" />
            <Area type="monotone" dataKey="tarefas" stroke="#ff8042" fill="#ff8042" />
            <Area type="monotone" dataKey="ordens" stroke="#0088FE" fill="#0088FE" />
          </AreaChart>
        );
  
      case 'bar':
        return (
          <BarChart data={dataFiltrada}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="administracao" fill="#8884d8" />
            <Bar dataKey="empresas" fill="#82ca9d" />
            <Bar dataKey="tecnicos" fill="#ffc658" />
            <Bar dataKey="tarefas" fill="#ff8042" />
            <Bar dataKey="ordens" fill="#0088FE" />
          </BarChart>
        );
  
        case 'radar':
          const ultimoRegistro = dataFiltrada[dataFiltrada.length - 1];
        
          const radarData = [
            { subject: 'Administração', value: ultimoRegistro?.administracao || 0 },
            { subject: 'Empresas', value: ultimoRegistro?.empresas || 0 },
            { subject: 'Técnicos', value: ultimoRegistro?.tecnicos || 0 },
            { subject: 'Tarefas', value: ultimoRegistro?.tarefas || 0 },
            { subject: 'Ordens', value: ultimoRegistro?.ordens || 0 },
          ];
        
          return (
            <RadarChart outerRadius={90} width={500} height={300} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Métricas" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          );
        
  
      default:
        return (
          <LineChart data={dataFiltrada}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="administracao" stroke="#8884d8" />
            <Line type="monotone" dataKey="empresas" stroke="#82ca9d" />
            <Line type="monotone" dataKey="tecnicos" stroke="#ffc658" />
            <Line type="monotone" dataKey="tarefas" stroke="#ff8042" />
            <Line type="monotone" dataKey="ordens" stroke="#0088FE" />
          </LineChart>
        );
    }
  };


    // Lógica da senha
    if (!autorizado) {
      return (
        <Modal isOpen={isSenhaOpen} onClose={() => {}} isCentered closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Digite a senha de acesso 🔒</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <Input
                  placeholder="Senha"
                  type="password"
                  value={senhaModal}
                  onChange={(e) => setSenhaModal(e.target.value)}
                />
                <Button colorScheme="blue" w="full" onClick={() => {
                  if (senhaModal === senhaCorreta) {
                    setAutorizado(true);
                    setIsSenhaOpen(false);
                  } else {
                    alert('Senha incorreta!');
                  }
                }}>
                  Acessar
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      );
    }
  
  


  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="gray.100">
      <AdminSidebarDesktop />
  
      <Box
        flex="1"
        p={6}
        ml={{ base: 0, md: '250px' }} // aqui deixa espaço da sidebar no desktop
        pb={{ base: '60px', md: 0 }}
      >
        <Heading mb={6}>📊 Painel de Métricas</Heading>
  
        <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }} gap={6} mb={10}>
          <CardMetricas label="Administração" value={metricas.administracao} />
          <CardMetricas label="Empresas" value={metricas.empresas} />
          <CardMetricas label="Técnicos" value={metricas.tecnicos} />
          <CardMetricas label="Tarefas" value={metricas.tarefas} />
          <CardMetricas label="Ordens de Serviço" value={metricas.ordens} />
        </Grid>
  
        <Box mb={4}>
          <NeuralNetworkCanvas ativo={apiAtiva} />
        </Box>
  
        {/* Gráfico Tempo Real */}
        <Box bg="white" p={6} borderRadius="xl" boxShadow="md" mb={10}>
          <Flex justify="space-between" mb={4} align="center">
            <Heading size="md">Gráfico em Tempo Real 📈</Heading>
            <Select width="200px" value={tipoGraficoTempoReal} onChange={e => setTipoGraficoTempoReal(e.target.value)}>
              <option value="line">Linha</option>
              <option value="area">Área</option>
              <option value="bar">Barra</option>
              <option value="radar">Radar</option>
            </Select>
          </Flex>
          <ResponsiveContainer width="100%" height={300}>
            {renderizarGraficoTempoReal()}
          </ResponsiveContainer>
        </Box>
  
        {/* Gráfico Histórico */}
        <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
          <Flex justify="space-between" mb={4} align="center" gap={4}>
            <Heading size="md">Histórico de Métricas 🕒</Heading>
            <Select width="200px" value={filtroHistorico} onChange={e => setFiltroHistorico(e.target.value)}>
              <option value="tudo">Tudo</option>
              <option value="1h">Última 1 hora</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
            </Select>
            <Select width="200px" value={tipoGraficoHistorico} onChange={e => setTipoGraficoHistorico(e.target.value)}>
              <option value="line">Linha</option>
              <option value="area">Área</option>
              <option value="bar">Barra</option>
              <option value="radar">Radar</option>
            </Select>
          </Flex>
          <ResponsiveContainer width="100%" height={300}>
            {renderizarGraficoHistorico()}
          </ResponsiveContainer>
        </Box>
      </Box>
    </Flex>
  );
  
}

function CardMetricas({ label, value }) {
  return (
    <Box p={4} bg="white" borderRadius="lg" boxShadow="md" _hover={{ boxShadow: 'xl' }} textAlign="center">
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{value}</StatNumber>
        <StatHelpText>Atualizado</StatHelpText>
      </Stat>
    </Box>
  );
}
