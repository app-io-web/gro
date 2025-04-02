import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Heading, Select, Spinner, SimpleGrid, Text, useBreakpointValue
} from '@chakra-ui/react'
import { Settings } from 'lucide-react'
import { apiGet } from '../services/api'
import AdminSidebarDesktop from '../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../components/admin/AdminBottomNav'
import AdminMobileMenu from '../components/admin/AdminMobileMenu'

function OrdensEmExecucao() {
  const [ordens, setOrdens] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [ordensRes, tecnicosRes] = await Promise.all([
          apiGet('/api/v2/tables/mtnh21kq153to8h/records'),
          apiGet('/api/v2/tables/mpyestriqe5a1kc/records')
        ])

        const listaTecnicos = tecnicosRes.list.map(t => ({
          nome: t.Tecnico_Responsavel,
          id: t.ID_Tecnico_Responsavel
        }))
        setTecnicos(listaTecnicos)

        const todasOrdens = ordensRes.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string'
            ? JSON.parse(item['Ordem de Serviços'])
            : item['Ordem de Serviços']

          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico
              .filter(os => os.Status_OS === 'Execução')
              .map(os => ({
                ...os,
                empresa: emp.empresa
              }))
          )
        })

        setOrdens(todasOrdens)
      } catch (err) {
        console.error('Erro ao buscar ordens:', err)
      }
    }

    fetchDados()
  }, [])

  const ordensFiltradas = tecnicoSelecionado
    ? ordens.filter(os => os.ID_Tecnico_Responsavel === tecnicoSelecionado)
    : ordens

  // CSS de rotação
  const spinning = {
    animation: 'spin 1s linear infinite'
  }

  // Aplica o keyframe globalmente uma vez
  useEffect(() => {
    const keyframes = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    const styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = keyframes
    document.head.appendChild(styleSheet)
    return () => document.head.removeChild(styleSheet)
  }, [])

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box w="full" p={6} ml={!isMobile ? '250px' : 0}>
        <Heading size="lg" mb={4}>📋 Ordens em Execução</Heading>

        <Select placeholder="Filtrar por Técnico" mb={4} onChange={e => setTecnicoSelecionado(e.target.value)}>
          {tecnicos.map(tecnico => (
            <option key={tecnico.id} value={tecnico.id}>{tecnico.nome}</option>
          ))}
        </Select>

        {ordensFiltradas.length === 0 ? (
          <Spinner size="lg" />
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {ordensFiltradas.map((os, i) => (
                <Box
                    key={i}
                    onClick={() => navigate(`/admin/ordem-execucao/${os.UnicID_OS}`)}
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="sm"
                    bg="gray.50"
                    position="relative" // <-- AQUI
                    >
                <Box position="absolute" top={2} right={2}>
                  <Settings size={20} style={spinning} color="green" />
                </Box>
                <Text><strong>Cliente:</strong> {os.Nome_Cliente}</Text>
                <Text><strong>Telefone:</strong> {os.Telefone1_Cliente}</Text>
                <Text><strong>Tipo:</strong> {os.Tipo_OS}</Text>
                <Text><strong>Endereço:</strong> {os.Endereco_Cliente}</Text>
                <Text><strong>Técnico:</strong> {os.Tecnico_Responsavel}</Text>
                <Text><strong>Empresa:</strong> {os.empresa}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  )
}

export default OrdensEmExecucao
