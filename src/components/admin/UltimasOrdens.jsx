import { useEffect, useState } from 'react'
import { Box, Flex, Text, Table, Thead, Tbody, Tr, Th, Td, Spinner, useBreakpointValue, VStack, Badge } from '@chakra-ui/react'
import { apiGet } from '../../services/api'
import { useNavigate } from 'react-router-dom'

function UltimasOrdens() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const navigate = useNavigate()

  useEffect(() => {
    const buscarOrdens = async () => {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records?limit=1')
        const registro = res.list?.[0]

        let listaOrdens = []
        if (registro && registro['Ordem de Serviços']) {
          let jsonOrdem
          try {
            jsonOrdem = typeof registro['Ordem de Serviços'] === 'string'
              ? JSON.parse(registro['Ordem de Serviços'])
              : registro['Ordem de Serviços']

            const empresas = jsonOrdem.empresas || []
            empresas.forEach(empresa => {
              if (empresa.Ordens_de_Servico && empresa.Ordens_de_Servico.length > 0) {
                const ordensComEmpresa = empresa.Ordens_de_Servico.map(ordem => ({
                  ...ordem,
                  empresa_nome: empresa.empresa || '---'
                }))
                listaOrdens = [...listaOrdens, ...ordensComEmpresa]
              }
            })

            // Ordena pela data mais recente
            listaOrdens.sort((a, b) => new Date(b.Data_Envio_OS) - new Date(a.Data_Envio_OS))
          } catch (err) {
            console.error('Erro ao interpretar Ordem de Serviços:', err)
          }
        }

        setOrdens(listaOrdens.slice(0, 10))
      } catch (error) {
        console.error('Erro ao buscar ordens:', error)
      } finally {
        setLoading(false)
      }
    }

    buscarOrdens()

    const interval = setInterval(() => {
      buscarOrdens()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  function irParaDetalhe(ordem) {
    if (!ordem || !ordem.Status_OS) return;
  
    const status = ordem.Status_OS.toLowerCase();
  
    if (status.includes('execução')) {
      navigate(`/admin/ordem-execucao/${ordem.UnicID_OS}`);
    } else if (status.includes('pendente') || status.includes('pendenciada')) {
      navigate(`/admin/ordens-pendenciadas/${ordem.UnicID_OS}`);
    } else if (status.includes('finalizado')) {
      navigate(`/admin/ordens-finalizadas/${ordem.UnicID_OS}`);
    } else if (status.includes('improdutiva')) {
      navigate(`/admin/ordens-improdutivas/${ordem.UnicID_OS}`);
    } else {
      console.warn('Status desconhecido:', ordem.Status_OS);
    }
  }
  


  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100px">
        <Spinner size="lg" />
      </Flex>
    )
  }

  return (
    <Box w="full" mt={10}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>Últimas Ordens de Serviço</Text>

      {isMobile ? (
        <VStack spacing={4} align="stretch">
          {ordens.map((ordem, index) => (
            <Box
              key={index}
              p={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg="white"
              onClick={() => irParaDetalhe(ordem)}
              _hover={{ bg: 'gray.100', cursor: 'pointer' }}
            >

              <Text fontWeight="bold">N° O.S.: {ordem.Numero_OS || '---'}</Text>
              <Text><strong>Cliente:</strong> {ordem.Nome_Cliente || '---'}</Text>
              <Text><strong>Empresa:</strong> {ordem.empresa_nome || '---'}</Text>
              <Flex gap={2} align="center" flexWrap="wrap" mt={2}>
              <Badge
                colorScheme={
                  ordem.TipoCliente === 'Empresarial' ? 'blue'
                  : ordem.TipoCliente === 'Residencial' ? 'green'
                  : 'gray'
                }
                fontSize="0.7em"
                p={1}
                rounded="md"
              >
                {ordem.TipoCliente || 'Tipo não informado'}
              </Badge>

              <Badge colorScheme={getStatusColor(ordem.Status_OS)}>
                {ordem.Status_OS || '---'}
              </Badge>
            </Flex>
            </Box>
          ))}
        </VStack>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>N° O.S.</Th>
              <Th>Cliente</Th>
              <Th>Tipo Cliente</Th> 
              <Th>Empresa</Th>
              <Th>Status</Th>
              <Th>Data de Envio</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ordens.map((ordem, index) => (
              <Tr
                  key={index}
                  _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                  onClick={() => irParaDetalhe(ordem)}
                >

                <Td>{ordem.Numero_OS || '---'}</Td>
                <Td>{ordem.Nome_Cliente || '---'}</Td>

                <Td>
                  <Badge
                    colorScheme={
                      ordem.TipoCliente === 'Empresarial' ? 'blue'
                      : ordem.TipoCliente === 'Residencial' ? 'green'
                      : 'gray'
                    }
                    fontSize="0.7em"
                    p={1}
                    rounded="md"
                  >
                    {ordem.TipoCliente || 'Tipo não informado'}
                  </Badge>
                </Td>

                <Td>{ordem.empresa_nome || '---'}</Td>

                <Td>
                  <Badge colorScheme={getStatusColor(ordem.Status_OS)}>
                    {ordem.Status_OS || '---'}
                  </Badge>
                </Td>

                <Td>{ordem.Data_Envio_OS ? new Date(ordem.Data_Envio_OS).toLocaleString('pt-BR') : '---'}</Td>

              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  )
}

function getStatusColor(status) {
  if (status === 'Execução') return 'green'
  if (status === 'Pendente') return 'yellow'
  if (status === 'Finalizado') return 'blue'
  return 'gray'
}

export default UltimasOrdens
