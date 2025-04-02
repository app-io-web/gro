import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../services/api'
import { Cog } from 'lucide-react'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'

function TecnicosList() {
  const [tecnicos, setTecnicos] = useState([])
  const [tecnicosEmExecucao, setTecnicosEmExecucao] = useState(new Set())
  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const fetchTecnicosEExecucao = async () => {
    try {
      const tecnicosRes = await apiGet('/api/v2/tables/mpyestriqe5a1kc/records')
      const ordensRes = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')

      const ordens = ordensRes.list.flatMap(item => {
        const json = typeof item['Ordem de Serviços'] === 'string'
          ? JSON.parse(item['Ordem de Serviços'])
          : item['Ordem de Serviços']

        return json.empresas.flatMap(emp =>
          emp.Ordens_de_Servico.map(os => ({
            ...os,
            empresa: emp.empresa
          }))
        )
      })

      const tecnicosExecutando = new Set(
        ordens
          .filter(os => os.Status_OS === 'Execução')
          .map(os => os.ID_Tecnico_Responsavel)
      )

      setTecnicos(tecnicosRes.list)
      setTecnicosEmExecucao(tecnicosExecutando)
    } catch (err) {
      console.error('Erro ao buscar técnicos ou ordens:', err)
    }
  }

  useEffect(() => {
    fetchTecnicosEExecucao()

    const interval = setInterval(() => {
      fetchTecnicosEExecucao()
    }, 10000) // a cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <Box minH="100vh" pl={{ base: 0, md: '250px' }} bg="gray.50">
      {!isMobile && <AdminSidebarDesktop />}
      <Box p={6}>
        <Heading size="lg" mb={6}>Técnicos Cadastrados</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {tecnicos.map((tecnico) => {
            const emExecucao = tecnicosEmExecucao.has(tecnico.ID_Tecnico_Responsavel)

            return (
              <Box
                key={tecnico.Id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg="white"
                boxShadow="sm"
                _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                onClick={() =>
                  navigate(`/admin/tecnico/${tecnico.ID_Tecnico_Responsavel}`)
                }
                position="relative"
              >
                {emExecucao && (
                  <Cog
                    color="green"
                    size={20}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      animation: 'spin 2s linear infinite'
                    }}
                  />
                )}

                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{tecnico.Tecnico_Responsavel}</Text>
                  <Text fontSize="sm">{tecnico.email_tecnico}</Text>
                  <Text fontSize="sm">Tel: {tecnico.telefone}</Text>
                </VStack>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
      {isMobile && <AdminBottomNav />}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  )
}

export default TecnicosList
