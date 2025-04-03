import { Box, Heading, Text, Flex } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { apiGet } from '../../services/api'

function TecnicoDashboard() {
  const [metricas, setMetricas] = useState({
    total: 0,
    execucao: 0,
    pendente: 0,
    reagendada: 0,
    finalizada: 0
  })

  useEffect(() => {
    const carregarMetricas = async () => {
      const tecnicoID = localStorage.getItem('ID_Tecnico_Responsavel')
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')

      const todasOrdens = res.list.flatMap(item => {
        const json = typeof item['Ordem de Serviços'] === 'string'
          ? JSON.parse(item['Ordem de Serviços'])
          : item['Ordem de Serviços']

        return json.empresas.flatMap(emp =>
          emp.Ordens_de_Servico.map(ordem => ({
            ...ordem,
            UnicID_Empresa: emp.UnicID_Empresa
          }))
        )
      })

      const ordensDoTecnico = todasOrdens.filter(
        ordem => ordem.ID_Tecnico_Responsavel === tecnicoID
      )

      setMetricas({
        total: ordensDoTecnico.length,
        execucao: ordensDoTecnico.filter(o => o.Status_OS === 'Execução').length,
        pendente: ordensDoTecnico.filter(o => o.Status_OS === 'Pendente').length,
        reagendada: ordensDoTecnico.filter(o => o.Status_OS === 'Reagendada').length,
        finalizada: ordensDoTecnico.filter(o => o.Status_OS === 'Finalizado').length
      })
    }

    carregarMetricas()
  }, [])

  return (
    <Box p={6}>
      <Heading mb={4}>Painel do Técnico</Heading>

      <Flex gap={4} wrap="wrap">
        {Object.entries(metricas).map(([chave, valor]) => (
          <Box
            key={chave}
            p={4}
            borderRadius="lg"
            bg="gray.100"
            boxShadow="md"
            minW="150px"
            textAlign="center"
          >
            <Text fontWeight="bold">{chave.toUpperCase()}</Text>
            <Text fontSize="2xl">{valor}</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

export default TecnicoDashboard
