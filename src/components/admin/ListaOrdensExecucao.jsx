import { useEffect, useState } from 'react'
import { Box, Flex, Heading, Text, Badge, Spinner, VStack } from '@chakra-ui/react'
import { apiGet } from '../../services/api'

function ListaOrdensExecucao() {
  const [ordensExecucao, setOrdensExecucao] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const buscarOrdens = async () => {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records?limit=1')
        const registro = res.list?.[0]

        if (registro && registro['Ordem de Serviços']) {
          let jsonOrdem
          try {
            jsonOrdem = typeof registro['Ordem de Serviços'] === 'string'
              ? JSON.parse(registro['Ordem de Serviços'])
              : registro['Ordem de Serviços']

            const empresas = jsonOrdem.empresas || []
            const todasOrdens = empresas.flatMap(emp => 
              (emp.Ordens_de_Servico || []).map(ordem => ({
                ...ordem,
                empresa_nome: emp.empresa || '---'
              }))
            )
            const ordensEmExecucao = todasOrdens.filter(ordem => ordem.Status_OS === 'Execução')

            setOrdensExecucao(ordensEmExecucao)
          } catch (err) {
            console.error('Erro ao interpretar Ordem de Serviços:', err)
          }
        } else {
          console.warn('Nenhum dado encontrado em Ordem de Serviços')
        }
      } catch (error) {
        console.error('Erro ao buscar ordens em execução:', error)
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

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100px">
        <Spinner size="lg" />
      </Flex>
    )
  }

  return (
    <Box w="full" mt={10}>
      <Heading size="md" mb={4}>Ordens em Execução</Heading>
      <VStack spacing={4} align="stretch">
        {ordensExecucao.length === 0 && (
          <Text textAlign="center">Nenhuma ordem em execução encontrada.</Text>
        )}
        {ordensExecucao.map((ordem, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            shadow="sm"
            bg="white"
            _hover={{ bg: 'gray.50', cursor: 'pointer' }}
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontWeight="bold">Nº O.S.: {ordem.Numero_OS || '---'}</Text>
              <Badge colorScheme="green" fontSize="0.8em" p={1} borderRadius="md">
                {ordem.Status_OS || '---'}
              </Badge>
            </Flex>

            <Text><strong>Empresa:</strong> {ordem.empresa_nome || '---'}</Text>
            <Text><strong>Cliente:</strong> {ordem.Nome_Cliente || '---'}</Text>
            <Text><strong>Técnico:</strong> {ordem.Tecnico_Responsavel || '---'}</Text>

            {/* Tipo de Cliente em badge */}
            <Flex gap={2} mt={2} flexWrap="wrap">
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
            </Flex>

            <Text mt={2}><strong>Endereço:</strong> {ordem.Endereco_Cliente || '---'}</Text>
            <Text><strong>Data de Entrega:</strong> {ordem.Data_Entrega_OS ? new Date(ordem.Data_Entrega_OS).toLocaleString('pt-BR') : '---'}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}

export default ListaOrdensExecucao
