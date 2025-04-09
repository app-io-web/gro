// IMPORTS
import {
    Box, Heading, Text, Spinner, Stack, Card, CardBody, Button, Badge, Input, InputGroup, InputLeftElement, Flex, Select, useBreakpointValue
  } from '@chakra-ui/react';
  import { SearchIcon } from '@chakra-ui/icons';
  import { useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { apiGet } from '../../services/api';
  import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop';
  import AdminBottomNav from '../../components/admin/AdminBottomNav';
  import AdminMobileMenu from '../../components/admin/AdminMobileMenu';
  
  export default function OrdensPendenciadasAdmin() {
    const [ordens, setOrdens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [empresaSelecionada, setEmpresaSelecionada] = useState('');
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const navigate = useNavigate();
    const isMobile = useBreakpointValue({ base: true, md: false });
  
    useEffect(() => {
      async function fetchOrdens() {
        try {
          const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records');
  
          const todasOrdens = res.list.flatMap(item => {
            if (!item['Ordem de Serviços']) return [];
  
            const json = typeof item['Ordem de Serviços'] === 'string'
              ? JSON.parse(item['Ordem de Serviços'])
              : item['Ordem de Serviços'];
  
            if (!json.empresas || json.empresas.length === 0) return [];
  
            return json.empresas.flatMap(emp => {
              if (!emp.Ordens_de_Servico || emp.Ordens_de_Servico.length === 0) return [];
  
              return emp.Ordens_de_Servico.map(os => ({
                ...os,
                empresa: emp.empresa,
                UnicID_Empresa: emp.UnicID_Empresa
              }));
            });
          });
  
          const ordensPendenciadas = todasOrdens.filter(os =>
            os.Status_OS?.toLowerCase().includes('pendenciada') ||
            os.Status_OS?.toLowerCase().includes('pendente')
          );
  
          setOrdens(ordensPendenciadas);
        } catch (err) {
          console.error('Erro ao buscar ordens:', err);
        } finally {
          setLoading(false);
        }
      }
  
      fetchOrdens();
    }, []);
  
    const empresasUnicas = [...new Set(ordens.map(o => o.empresa))];
  
    const ordensFiltradas = ordens
      .filter(ordem => ordem.Nome_Cliente?.toLowerCase().includes(search.toLowerCase()))
      .filter(ordem => empresaSelecionada ? ordem.empresa === empresaSelecionada : true)
      .filter(ordem => {
        const dataEnvio = new Date(ordem.Data_Envio_OS);
        const inicio = dataInicial ? new Date(`${dataInicial}T00:00:00`) : null;
        const fim = dataFinal ? new Date(`${dataFinal}T23:59:59`) : null;
  
        if (inicio && fim) return dataEnvio >= inicio && dataEnvio <= fim;
        if (inicio) return dataEnvio >= inicio;
        if (fim) return dataEnvio <= fim;
        return true;
      });
  
    if (loading) return <Spinner size="xl" mt={20} />;
  
    return (
      <Box display="flex" flexDirection="column">
        {!isMobile && <AdminSidebarDesktop />}
        {isMobile && <AdminMobileMenu />}
        {isMobile && <AdminBottomNav />}
  
        <Box ml={{ base: 0, md: '250px' }} p={6} minH="100vh" pb={{ base: '100px', md: '0' }}>
          <Heading size="lg" mb={6} textAlign="center" color="purple.600">
            📋 Ordens Pendenciadas/Pendentes
          </Heading>
  
          {/* Filtros */}
          <Flex mb={6} gap={4} flexWrap="wrap" justify="center" align="center">
            <InputGroup w="220px">
                <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                placeholder="Buscar por nome do cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="white"
                />
            </InputGroup>

            <Select
                placeholder="Filtrar por empresa"
                value={empresaSelecionada}
                onChange={(e) => setEmpresaSelecionada(e.target.value)}
                w="220px"
                bg="white"
            >
                {empresasUnicas.map((empresa, idx) => (
                <option key={idx} value={empresa}>
                    {empresa}
                </option>
                ))}
            </Select>

            <Input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                w="220px"
                bg="white"
                placeholder="Data Inicial"
            />

            <Input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                w="220px"
                bg="white"
                placeholder="Data Final"
            />
            </Flex>

  
          {/* Lista de Ordens */}
          {ordensFiltradas.length === 0 ? (
            <Text textAlign="center" color="gray.500">Nenhuma ordem encontrada.</Text>
          ) : (
            <Stack spacing={4}>
              {ordensFiltradas.map((ordem) => (
                <Card key={ordem.UnicID_OS} bg="gray.50" boxShadow="md" rounded="md" _hover={{ boxShadow: 'xl' }}>
                  <CardBody>
                    <Stack spacing={2}>
                      <Text fontSize="md"><strong>Cliente:</strong> {ordem.Nome_Cliente}</Text>
                      <Text fontSize="sm" color="gray.600"><strong>Telefone:</strong> {ordem.Telefone1_Cliente}</Text>
                      <Text fontSize="sm" color="gray.600"><strong>Endereço:</strong> {ordem.Endereco_Cliente}</Text>
  
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Text fontSize="sm"><strong>Status:</strong></Text>
                        <Badge
                          colorScheme={ordem.Status_OS?.toLowerCase().includes('pendenciada') ? 'red' : 'orange'}
                          fontSize="0.8em"
                          px={2}
                          py={1}
                          rounded="md"
                        >
                          {ordem.Status_OS}
                        </Badge>
                      </Stack>
  
                      <Text fontSize="sm" color="gray.600"><strong>Empresa:</strong> {ordem.empresa}</Text>
  
                      <Button
                        colorScheme="purple"
                        size={isMobile ? "md" : "sm"}
                        mt={3}
                        w={isMobile ? "100%" : "auto"}
                        onClick={() => navigate(`/admin/ordens-pendenciadas/${ordem.UnicID_OS}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    );
  }
  